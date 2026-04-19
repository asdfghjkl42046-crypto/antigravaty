/**
 * 行動處裡中心
 * 負責處理玩家做決定後的結果，包含誰先開始、錢跟名聲的增減，以及是否犯法。
 */

import type {
  Player,
  ActionResult,
  BaseOption,
  OptionType,
  BlackMaterialSource,
  Tag,
  Card,
  SpecialTag,
  MoneyValue,
} from '../types/game';
import { CARDS_DB } from '../data/cards/CardsDB';
import { getResolvedTags, formatLawTags } from '../data/laws/LawCasesDB';
import { sha256, resolveMoneyValue } from './MathEngine';
import { calculateActualRPGain } from './MechanicsEngine';
import { applyAccountantBonus, shouldRefundAP, applyPRDiscount } from './RoleEngine';
import {
  throwNumericalCheckError,
} from './errors/EngineErrors';

/**
 * 定義卡片選項的結果（賺點錢、扣名聲、或犯了哪條法）
 * 這個型別整合了所有類型的選項欄位。
 */
export type AnyCardOption = BaseOption & {
  type?: OptionType;
  succRate?: number; // 0~1 的成功機率 (如 0.8 代表 80% 成功率)
  succ?: {
    // 鑑定成功的獎勵
    g?: MoneyValue;
    rp?: number;
    ip?: number;
    bm?: number | 'all'; // 若為 all 則可以消除掉身上所有的黑材料
    lawCaseIds?: string[];
  };
  fail?: {
    // 鑑定失敗的懲罰
    g?: MoneyValue;
    rp?: number;
    ip?: number;
    loss?: number;
    special?: SpecialTag; // 特殊狀態如 'sue' 會強制觸發起訴
    lawCaseIds?: string[];
  };
};

/**
 * 決定這回合誰先動
 * 第一輪看出生背景，之後看誰的行動力 (AP) 跟資產多。
 */
export function sortTurnOrder(players: Player[], currentRound: number): Player[] {
  // 設定開局路線權重
  const pathPriority: Record<string, number> = { blackbox: 3, backdoor: 2, normal: 1 };

  return [...players].sort((a, b) => {
    // 處理第 1 回合特殊權重
    if (Number(currentRound) === 1) {
      const vA = pathPriority[a.startPath || 'normal'] || 0;
      const vB = pathPriority[b.startPath || 'normal'] || 0;
      if (vB !== vA) return vB - vA;
      return Math.random() - 0.5;
    }

    const apA = Number(a.ap);
    const apB = Number(b.ap);
    if (Number.isNaN(apA) || Number.isNaN(apB)) {
      throwNumericalCheckError(
        'ActionEngine.sortTurnOrder',
        `偵測到 AP 為 NaN (A: ${a.ap}, B: ${b.ap})。`
      );
    }
    if (apB !== apA) return apB - apA;

    // 若行動力相同，則由資本高的玩家先行
    const assetsA = (a.g || 0) + (a.trustFund || 0);
    const assetsB = (b.g || 0) + (b.trustFund || 0);
    if (Number.isNaN(assetsA) || Number.isNaN(assetsB)) {
      throwNumericalCheckError(
        'ActionEngine.sortTurnOrder',
        `偵測到資產計算結果為 NaN (A: ${assetsA}, B: ${assetsB})。`
      );
    }
    if (assetsB !== assetsA) return assetsB - assetsA;

    // 若連財產都同等，再來比拼社會名聲
    const rpA = Number(a.rp);
    const rpB = Number(b.rp);
    if (rpB !== rpA) return rpB - rpA;

    return Math.random() - 0.5; // 極端情況同分才亂數擲骰
  });
}

/**
 * 格式化收益通知文字
 * 依照使用者規範：>0 顯示獲得，<0 顯示花費，0 不提。
 * 格式：[項目][獲得/花費] [數值] [單位]
 */
function formatStatsBundle(g: number, ip: number, rp: number, bm: number): string {
  const parts: string[] = [];
  const items = [
    { label: '資金', val: g, unit: '萬' },
    { label: '技術', val: ip, unit: '點' },
    { label: '名聲', val: rp, unit: '點' },
    { label: '黑材料', val: bm, unit: '點' },
  ];

  for (const item of items) {
    if (item.val === 0) continue;
    const action = item.val > 0 ? '獲得' : '花費';
    parts.push(`${item.label}${action} ${Math.abs(item.val)} ${item.unit}`);
  }

  // 返回以「、」分隔的字串，若無變動則回傳空字串
  return parts.length > 0 ? parts.join('、') : '無顯著影響';
}

/**
 * 當玩家選好卡片選項後，來這邊算帳。
 * 負責處理：扣除成本、判斷成功率、人才技能加成、計算黑材料，並建立防偽犯罪紀錄。
 *
 * @param player 誰在動
 * @param cardId 哪張牌
 * @param optionIdx 選了第幾個選項
 * @param lastHash 上一筆紀錄的雜湊碼
 * @param choice 選項後的二階段抉擇 (合法申報 | 黑箱略過)
 * @param turn 目前回合數
 */
export async function performAction(
  player: Player,
  cardId: string,
  optionIdx: number,
  lastHash: string,
  choice: 'declare' | 'skip' | 'normal',
  turn: number,
  counterCTOCount: number = 0
): Promise<ActionResult & { hashedTags: Tag[]; finalHash: string }> {
  try {
    // 0. 檢查一下資料對不對 (防呆機制)
    if (lastHash === undefined || lastHash === null) {
      throwNumericalCheckError(
        'ActionEngine.performAction',
        '傳入的 lastHash 雜湊鏈標頭非法(undefined/null)。'
      );
    }

    const card = CARDS_DB[cardId];
    // [新增] 唯一識別碼：加入隨機偏移，確保多人同時掃描時，行動數據不會撞號或共用
    const actionId = Date.now() + Math.floor(Math.random() * 1000);
    const timestamp = new Date().toISOString();

    // 若找不到該實體卡片，則拒絕結算
    if (!card) {
      return {
        success: false,
        message: `找不到地點卡: ${cardId}`,
        updates: {},
        appliedTags: [],
        hashedTags: [],
        finalHash: lastHash,
        apRefunded: true,
        actionId,
        log: { playerId: player.id, turn, cardId, optionIndex: optionIdx, tags: '', timestamp },
      };
    }

    // 取出被選中的卡片選項詳細結構參數
    const opt = card[optionIdx as unknown as keyof Card] as AnyCardOption;

    // [修正] 防禦性守門員：檢核選項是否存在，防止 TypeError
    if (!opt) {
      return {
        success: false,
        message: `🚫 系統錯誤：找不到行動選項 (${optionIdx})。`,
        updates: {},
        appliedTags: [],
        hashedTags: [],
        finalHash: lastHash,
        apRefunded: true, // 系統資料錯誤，不應扣除玩家 AP
        actionId,
        log: {
          playerId: player.id,
          turn,
          cardId,
          optionIndex: optionIdx,
          tags: 'ERR_INVALID_OPT',
          timestamp,
        },
      };
    }

    const updates: Partial<Player> = {};
    const snapshots: ActionResult['appliedTags'] = [];

    // [核心邏輯修正] 現在根據文案判定的 'poachtalent' 標籤來觸發 CTO 反制，不再依賴視覺上的等級 (SR/SSR/UR)
    const isBTypeRisky = cardId.startsWith('B-') && (opt?.special === 'poachtalent');
    const tagMultiplier = isBTypeRisky ? 1 + counterCTOCount : 1;

    const isAPRefundedBySkill = shouldRefundAP(player, cardId);

    if (player.isBankrupt || (player.ap <= 0 && !isAPRefundedBySkill)) {
      return {
        success: false,
        message: `🚫 系統攔截：狀態不符 (${player.isBankrupt ? '破產' : 'AP不足'})。`,
        updates: {},
        appliedTags: [],
        hashedTags: [],
        finalHash: lastHash,
        apRefunded: true,
        actionId,
        log: { playerId: player.id, turn, cardId, optionIndex: optionIdx, tags: 'INTERCEPTED', timestamp },
      };
    }

    // 檢查玩家是否正受到禁足管制 (例如被政府盯上)
    if (player.skipNextCard) {
      return {
        success: false,
        message: `🚫 行動凍結：您目前正受到標案審核或政府管制，本次行動無效！`,
        updates: {
          skipNextCard: false,
          ap: Math.max(0, (player.ap || 0) - 1), // [核心修正] 禁足仍要扣除 1 點 AP
        }, // 自動解除管制以迎接下次行動
        appliedTags: [],
        hashedTags: [],
        finalHash: lastHash,
        actionId,
        apRefunded: false,
        log: {
          playerId: player.id,
          turn,
          cardId,
          optionIndex: optionIdx,
          tags: 'CARD_SKIPPED',
          timestamp,
        },
      };
    }

    // 1. 動態解析標籤：從法律資料庫提取
    const baseLawCaseIds = opt.lawCaseIds || [];
    const resolvedBaseTags = getResolvedTags(baseLawCaseIds);
    let message = '';

    // [新增] 套利與破產風險警示：若選項具備負向失敗金，先行在訊息中加載警示文字
    const hasBankruptcyRisk = resolveMoneyValue(opt.fail?.g) < 0;
    if (hasBankruptcyRisk) {
      message += ' (⚠️ 注意：此行動若失敗，隨之而來的賠償金可能導致公司破產)';
    }

    let finalSuccess = true;
    // 判斷玩家的選擇是否需要付費來合法申報
    const isDeclaration = choice === 'declare';

    // 1. 算價錢：看看這一動要付多少錢。如果要合法申報，要加收 50 萬手續費喔。
    let costToDeduct = opt.costG || 0;
    // 如果玩家選擇了申報，課徵 50 萬手續費
    if (isDeclaration) costToDeduct += 50;

    // 身家過低拒絕服務
    if (player.g < costToDeduct) {
      return {
        success: false,
        message: `資源不足：執行此行動需要 ${costToDeduct} 萬資金，您的餘額不足。`,
        updates: {},
        appliedTags: [],
        hashedTags: [],
        finalHash: lastHash,
        apRefunded: true, // 資金不足時取消行動，並退還行動力 (操作攔截)
        actionId,
        log: {
          playerId: player.id,
          turn,
          cardId,
          optionIndex: optionIdx,
          tags: 'INSUFFICIENT_FUNDS',
          timestamp,
        },
      };
    }

    // 2. 抓出這張卡的基礎獎勵：先確定成功的話能拿到多少資金、名聲跟技術資產。
    const baseRewardG = resolveMoneyValue(opt.succ?.g !== undefined ? opt.succ.g : opt.g);
    const baseRewardRP = resolveMoneyValue(opt.succ?.rp !== undefined ? opt.succ.rp : opt.rp || 0);
    const baseRewardIP = resolveMoneyValue(opt.succ?.ip !== undefined ? opt.succ.ip : opt.ip || 0);

    // 基礎收益給會計天賦判定，看有沒有額外的灰色收入加成
    const bonusRewardG = applyAccountantBonus(player, cardId, baseRewardG);
    // [核心修正] C 類卡片的選項，若帶有 declareLogic 標籤，即使申報也要過機率檢定；A 類選項申報則維持百分百成功
    const isCTypeOptionWithUI = cardId.startsWith('C-') && opt.special === 'declareLogic';
    const isCTypeZOption = isCTypeOptionWithUI; // 保留變數名以減少後續改動
    const skipRandomCheck = isDeclaration && !isCTypeOptionWithUI;

    // [核心機制重構] 標籤生成與記錄過濾器
    // 規定：僅針對 SSR、SSSR、UR 且具備明確法律 ID 的行動進行犯罪記錄。SR 級別絕對不紀錄。
    const isRiskyRank = ['SSR', 'SSSR', 'UR'].includes(opt.type || '');
    
    // 3. 系統報表敘事生成與標籤處理
    if (isDeclaration) {
      message = `【安全申報】已依照法規完成金流紀錄，扣除相關成本 ${costToDeduct} 萬。`;
    } else if (isRiskyRank && resolvedBaseTags.length > 0) {
      // 僅在非法申報且等級為高風險（SSR 以上）時，才記錄標籤
      for (let i = 0; i < tagMultiplier; i++) {
        snapshots.push({
          tag: resolvedBaseTags,
          netIncome: bonusRewardG,
          lawCaseIds: baseLawCaseIds,
          rpChange: baseRewardRP,
          multiplier: tagMultiplier,
          multiplierSource: tagMultiplier > 1 ? 'CTO' : undefined,
        });
      }
      message += ` (已略過申報，扣除成本 ${costToDeduct} 萬)`;
    } else {
      // SR 行動或是無 ID 標籤：即便略過申報也僅更新訊息，不產生任何 snapshot 黑材料紀錄
      if (!isDeclaration) {
        message += ` (已略過申報，扣除成本 ${costToDeduct} 萬)`;
      }
    }

    // 4. 丟骰子時間：如果有成功率限制且你沒選申報，就看運氣好不好了。
    if (opt.succRate !== undefined && !skipRandomCheck) {
      // 只有在成功率小於 1.0 時才執行隨機判定
      if (opt.succRate < 1.0 && Math.random() > opt.succRate) finalSuccess = false;
    }

    // 5. 根據勝敗來決定金錢與標籤結算
    let finalGChange = 0;
    let finalRPChange = 0;
    let finalIPChange = 0;

    if (finalSuccess) {
      if (isDeclaration) {
        // 安全申報：再多扣繳 50 萬手續費
        const baseG = resolveMoneyValue(opt.g);
        finalGChange = baseG - costToDeduct;
        // [新增] C 類卡申報成功額外獎勵 30 RP；其餘卡片維持原本基礎名聲獎勵
        const baseRPWithBonus = isCTypeZOption ? baseRewardRP + 30 : baseRewardRP;
        finalRPChange = calculateActualRPGain(player, baseRPWithBonus);
        finalIPChange = baseRewardIP;

        // [新增] 若是 C 類卡且成功獲得獎勵，在訊息增加提示文字
        if (isCTypeZOption) {
          message += `。獲得額外獎勵 +30 RP！`;
        }
      } else {
        // 檢定過關且未主動申報的黑箱路線
        // [修正] 獎勵回測機制：若 succ 中未定義，則回退使用頂層基礎數值，支援扁平結構卡牌
        const succG = resolveMoneyValue(opt.succ?.g !== undefined ? opt.succ.g : opt.g);
        const succRP = resolveMoneyValue(opt.succ?.rp !== undefined ? opt.succ.rp : opt.rp || 0);
        const succIP = resolveMoneyValue(opt.succ?.ip !== undefined ? opt.succ.ip : opt.ip || 0);

        // 成功獲得的資金再次納入會計師進行額外分紅加成
        const bonusSuccG = applyAccountantBonus(player, cardId, succG);
        const totalG = bonusSuccG;
        const totalRP = succRP;

        // 最終結算
        finalGChange = totalG - costToDeduct;
        finalRPChange = calculateActualRPGain(player, totalRP);
        // [新增] 危機公關：如果名聲變動是負的，趕快請公關部出來「說明」一下（處理損害減半）
        if (finalRPChange < 0) {
          finalRPChange = applyPRDiscount(player, finalRPChange);
        }
        finalIPChange = succIP;

        // E 卡洗黑材料清除機制
        if (opt.succ?.bm === 'all') {
          // 成功洗白所有黑材料
          updates.blackMaterialSources = [];
        } else if (opt.succ?.bm !== undefined) {
          const sources = JSON.parse(JSON.stringify(player.blackMaterialSources || []));
          let pointsToRemove = 0;

          if (typeof opt.succ.bm === 'number') {
            pointsToRemove = opt.succ.bm;
          } else if (typeof opt.succ.bm === 'string' && (opt.succ.bm as string).includes('%')) {
            // [新增] 百分比扣除邏輯：計算總量並採無條件進位
            const totalBM = sources.reduce((sum: number, s: BlackMaterialSource) => sum + s.count, 0);
            const ratio = parseInt(opt.succ.bm) / 100;
            pointsToRemove = Math.ceil(totalBM * ratio);
          }

          while (pointsToRemove > 0) {
            const valid = sources
              .map((s: BlackMaterialSource, idx: number) => (s.count > 0 ? idx : -1))
              .filter((idx: number) => idx !== -1);
            if (valid.length === 0) break; 
            const target = valid[Math.floor(Math.random() * valid.length)];
            sources[target].count -= 1;
            pointsToRemove -= 1;
          }
          // 保留標籤紀錄
          updates.blackMaterialSources = sources.filter((s: BlackMaterialSource) => s.count > 0);
        }

        // 成功所帶出來的標籤：僅在有明確定義成功標籤，且與頂層標籤不重複時才增加
        const succLawCaseIds = (opt.succ?.lawCaseIds || []).filter(
          (id) => !baseLawCaseIds.includes(id)
        );
        const resolvedSuccTags = getResolvedTags(succLawCaseIds);
        if (resolvedSuccTags.length > 0) {
          for (let i = 0; i < tagMultiplier; i++) {
            snapshots.push({
              tag: resolvedSuccTags,
              netIncome: totalG,
              lawCaseIds: succLawCaseIds,
              rpChange: finalRPChange,
            });
          }
        }

        // 銜接分發獎勵：若為 100% 成功，則隱藏【成功】標籤以避免 UI 彈窗
        const isDirectSuccess = opt.succRate === 1.0;

        if (!message || message.startsWith(' (')) {
          const prefix = isDirectSuccess ? '' : '【成功】';
          message = `${prefix}${opt.label || '計畫執行成功'}。${message}`;
        } else if (!message.includes('【成功】') && !isDirectSuccess) {
          message = `【成功】${message}`;
        }
      }
    } else {
      // 失敗的情況 (不享有預期成功的 base rewards 收益)
      const failG = resolveMoneyValue(opt.fail?.g);
      const failRP = resolveMoneyValue(opt.fail?.rp || 0);
      const failIP = resolveMoneyValue(opt.fail?.ip || 0);

      const totalG = failG;
      finalGChange = totalG - costToDeduct;
      finalRPChange = calculateActualRPGain(player, failRP);
      // [新增] 損害控管：計畫失敗扣名聲也要靠公關掩飾，能救多少算多少
      if (finalRPChange < 0) {
        finalRPChange = applyPRDiscount(player, finalRPChange);
      }
      finalIPChange = failIP;

      // 失敗所帶出來的標籤：僅在有明確定義失敗標籤，且與頂層標籤不重複時才增加
      const failLawCaseIds = (opt.fail?.lawCaseIds || []).filter(
        (id) => !baseLawCaseIds.includes(id)
      );
      const resolvedFailTags = getResolvedTags(failLawCaseIds);
      if (resolvedFailTags.length > 0) {
        for (let i = 0; i < tagMultiplier; i++) {
          snapshots.push({
            tag: resolvedFailTags,
            netIncome: totalG,
            lawCaseIds: failLawCaseIds,
            rpChange: finalRPChange,
            surface_term: opt.surface_term,
            hidden_intent: opt.hidden_intent,
            escape: opt.escape,
          });
        }
      }
      // E卡失敗獲得關鍵字sue，會觸發法庭階段
      message =
        opt.fail?.special === 'sue'
          ? `【遭遇重案】${opt.label}: 公權力已介入，立即進入法庭！`
          : `【失敗】${opt.label}: 行動遭遇挫折。`;
    }

    const hashedTags: Tag[] = [];
    let currentLastHash = lastHash;

    for (const s of snapshots) {
      const ts = new Date().toISOString();
      // 支援多重標籤：每個標籤都應產生獨立的雜湊鏈節點與黑材料紀錄
      for (const singleTag of s.tag) {
        const hash = await sha256(currentLastHash + singleTag + ts);
        hashedTags.push({
          id: actionId,
          text: singleTag,
          turn,
          timestamp: ts,
          isCrime: true,
          hash,
          netIncome: s.netIncome,
          lawCaseIds: s.lawCaseIds,
          rpChange: s.rpChange,
          isResolved: false,
        });
        // 更新最新一筆的防偽亂碼
        currentLastHash = hash;
      }
    }

    // 7. 保障AP安全機制
    // 若觸發 CTO 自動化代操技能，則 AP 點數不扣除
    const apRefunded = isAPRefundedBySkill;

    // 進行購買避免資金負債機制(罰金例外)
    updates.g = Math.max(0, (player.g || 0) + finalGChange);
    updates.rp = (player.rp || 0) + finalRPChange;
    updates.ip = (player.ip || 0) + finalIPChange;

    // 遊戲生涯的總營收計算
    const rawGGain = finalGChange + costToDeduct;
    if (rawGGain > 0) updates.totalIncome = (player.totalIncome || 0) + rawGGain;
    updates.ap = apRefunded ? player.ap : Math.max(0, (player.ap || 0) - 1);
    // 連續安全執法回合的判定
    if (hashedTags.length > 0) updates.consecutiveCleanTurns = 0;
    // 禁足延遲發動機制
    if (opt.special === 'skip_next' || opt.skipNextCard) updates.skipNextCard = true;

    // 8. 黑材料(BM) 累積：以拉高起訴輪盤機率 (各處標籤統一生成邏輯)
    // 總裁指示：一個標籤就是一個黑材料 (SSOT，基礎 1 點)
    if (hashedTags.length > 0) {
      const newBMSources = [...(updates.blackMaterialSources || player.blackMaterialSources || [])];

      // [核心數值] 計算不申報加成 (僅限 C 類卡之 Z 型選項在選擇「略過」時觸發)
      // 規則：BM = (標籤數 + 2) * tagMultiplier (對於 C 類卡，multiplier 為 1)
      let extraBMTotals = 0;
      if (choice === 'skip' && isCTypeZOption) {
        extraBMTotals = 2;
      }

      hashedTags.forEach((ht, idx) => {
        // 將加成平均分配到第一個標籤上，或者每個標籤都加？
        // 用戶說「總共加 2」，我們加在第一個標籤的 count 裡即可，
        // 或者對每個標籤套用倍率。
        const extraForThisTag = idx === 0 ? extraBMTotals : 0;
        newBMSources.push({
          tag: ht.text,
          count: 1 + extraForThisTag, // [修正] tagMultiplier 於生成標籤時已複製過實體，勿重複相乘疊加
          actionId,
          turn,
        });
      });

      updates.blackMaterialSources = newBMSources;
    }

    // 9. 檢查有沒有被警察「抓個正著」：例如某些 E 類陷阱卡失敗會直接法庭見。
    let forcedTrial = undefined;
    if (!finalSuccess && opt.fail?.special === 'sue') {
      forcedTrial = { tagId: actionId, reason: message };
    }

    // [新增] 統計資訊摘要 (GEMINI.md §2-2 規範)
    // 計算黑材料淨變動
    let netBMChange = 0;
    if (hashedTags.length > 0) {
      const extraBMTotals = (choice === 'skip' && isCTypeZOption) ? 2 : 0;
      netBMChange = hashedTags.length + extraBMTotals;
    } else if (updates.blackMaterialSources !== undefined) {
      // 若有 BM 減少邏輯 (如 E 卡成功)
      const oldTotal = player.blackMaterialSources.reduce((s, b) => s + b.count, 0);
      const newTotal = updates.blackMaterialSources.reduce((s, b) => s + b.count, 0);
      netBMChange = newTotal - oldTotal;
    }

    const statsSummary = formatStatsBundle(finalGChange, finalIPChange, finalRPChange, netBMChange);
    // [格式更新] 因 [業主名] 的選擇，[企業名] [摘要]
    const finalAnnouncement = `因 ${player.ownerName} 的選擇，${player.name}${statsSummary}`;

    // [修正] 最終數值安全性檢查：確保 updates 中不包含 NaN，防止數據污染傳播到 Store
    if (Number.isNaN(updates.g) || Number.isNaN(updates.rp) || Number.isNaN(updates.ip)) {
      throwNumericalCheckError(
        `玩家: ${player.name} 的行動結算 (${cardId})`,
        `結算結果出現 NaN！(G: ${updates.g}, RP: ${updates.rp}, IP: ${updates.ip})`
      );
    }

    // 將行動結果回傳給遊戲總控台
    const multiplierLabel =
      tagMultiplier > 1 ? ` (受其他玩家 CTO 影響，犯罪紀錄 x${tagMultiplier})` : '';
    return {
      success: cardId.startsWith('A-') ? true : finalSuccess,
      message: `${finalAnnouncement}${multiplierLabel}`,
      updates,
      appliedTags: snapshots,
      hashedTags,
      finalHash: currentLastHash,
      apRefunded,
      actionId,
      forcedTrial,
      log: {
        playerId: player.id,
        turn,
        cardId,
        optionIndex: optionIdx,
        tags:
          snapshots.map((t) => formatLawTags(t.tag)).join(',') ||
          (updates.skipNextCard ? 'SKIP_NEXT' : ''),
        timestamp: new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const error = err as Error & { category?: string };
    // [核爆處理]：透過 instanceof 對錯誤進行分類，提供玩家更有意義的修復建議。
    console.error(`[Fatal Action Engine Error]`, error);

    let categoryPrefix = '🚫 系統嚴重錯誤';
    let suggestion = '請截圖並聯繫開發者。';

    if (error.category === 'Data') {
      categoryPrefix = '📁 資料損毀錯誤';
      suggestion = '請嘗試重新整理網頁或重新啟動遊戲。';
    } else if (error.category === 'Calculation') {
      categoryPrefix = '🔢 數值算力錯誤';
      suggestion = '偵測到非法數值運算，請聯繫開發人員。';
    } else if (error.category === 'Flow') {
      categoryPrefix = '🌐 環境流程錯誤';
      suggestion = '目前環境可能不支持某些功能，請使用現代瀏覽器。';
    }

    return {
      success: false,
      message: `${categoryPrefix}：${error?.message || '未知錯誤'}。\n【建議】${suggestion}`,
      updates: {},
      appliedTags: [],
      hashedTags: [],
      finalHash: lastHash,
      apRefunded: true, // 發生引擎嚴重錯誤時，不應扣除玩家行動點
      actionId: Date.now(),
      log: {
        playerId: player.id,
        turn,
        cardId,
        optionIndex: optionIdx,
        tags: 'FATAL_ENGINE_ERROR',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * 洗牌扣除 AP 行動點邏輯
 */
export function applyRedrawCards(player: Player): {
  success: boolean;
  message: string;
  updates: Partial<Player>;
} {
  // 沒有任何精力無法洗牌
  if (player.ap <= 0) return { success: false, message: '', updates: {} };
  return {
    success: true,
    message: `【洗牌成功】已刷新桌上5張牌。`,
    updates: { ap: player.ap - 1 },
  };
}
