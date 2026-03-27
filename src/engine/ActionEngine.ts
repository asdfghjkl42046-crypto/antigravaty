/**
 * 單次行動結算流程
 * 主要負責：決定玩家行動順序、解析並執行卡牌選項的所有影響，以及防竄改機制
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
} from '../types/game';
import { CARDS_DB } from '../data/cards/CardsDB';
import { LAW_CASES_DB, getResolvedTags, formatLawTags } from '../data/laws/LawCasesDB';
import { roundUp, sha256 } from './MathEngine';
import { calculateActualRPGain } from './MechanicsEngine';
import { applyAccountantBonus, shouldRefundAP } from './RoleEngine';
import {
  throwDataDefinitionError,
  throwLogicFailureError,
  throwEnvironmentError,
  throwNumericalCheckError,
} from './errors/EngineErrors';

/**
 * 定義每張卡牌選項會對玩家造成的收益、懲罰與觸犯的法條
 */
export type AnyCardOption = BaseOption & {
  type?: OptionType;
  costG?: number; // 該行動需要支付的資金
  succRate?: number; // 0~1 的成功機率 (如 0.8 代表 80% 成功率)
  g?: number; // 資金獲得量
  rp?: number; // 聲望增減量
  ip?: number; // 人脈獲得量
  bm?: number; // 產生的黑材料點數
  lawCaseIds?: string[]; // 法條編號
  succ?: {
    // 鑑定成功的獎勵
    g?: number;
    rp?: number;
    ip?: number;
    bm?: number | 'all'; // 若為 all 則可以消除掉身上所有的黑材料
    lawCaseIds?: string[];
  };
  fail?: {
    // 鑑定失敗的懲罰
    g?: number;
    rp?: number;
    ip?: number;
    bm?: number;
    loss?: number;
    special?: SpecialTag; // 特殊狀態如 'sue' 會強制觸發起訴
    lawCaseIds?: string[];
  };
};

/**
 * 決定每回合玩家的行動順序：
 * - 第 1 回合：依開局路線(黑箱 > 走後門 > 正規)決定，重現社會現實。
 * - 第 2 回合起：依行動力 > 總財產 > 名聲 > 隨機 排序
 */
export function sortTurnOrder(players: Player[], currentRound: number): Player[] {
  // 將開局路線賦予開局順位制度，數值越高越先開始
  const pathPriority: Record<string, number> = { blackbox: 3, backdoor: 2, normal: 1 };

  return [...players].sort((a, b) => {
    // 處理第一回合獨佔的特權路徑加成順位排列
    if (Number(currentRound) === 1) {
      const vA = pathPriority[a.startPath || 'normal'] || 0;
      const vB = pathPriority[b.startPath || 'normal'] || 0;
      if (vB !== vA) return vB - vA;
      return Math.random() - 0.5; // 極端情況同分才亂數擲骰
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
 * 玩家執行卡牌行動的結算中心。
 * 負責處理：扣除花費、判斷行動成功率、會計天賦分紅、計算黑材料，以及建立防竄改的犯罪紀錄。
 *
 * @param player 執行此行動的玩家
 * @param cardId 卡片編號
 * @param optionIdx 玩家選擇的選項
 * @param lastHash 上一筆防竄改紀錄碼
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
    // 0. 輸入合法性預先檢查 (入参守門員)
    if (lastHash === undefined || lastHash === null) {
      throwNumericalCheckError(
        'ActionEngine.performAction',
        '傳入的 lastHash 雜湊鏈標頭非法(undefined/null)。'
      );
    }

    const card = CARDS_DB[cardId];
    const actionId = Date.now();
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

    // [CTO 反制技] 判定：偵測人才市場的惡性競爭
    // 若場上有其他玩家擁有 CTO 角色，則本次行動的標籤獲取量將依人數加計 (1 + N) 倍
    const isCTOContested =
      counterCTOCount > 0 && cardId.startsWith('B-') && (opt?.type === 'B' || opt?.type === 'C');
    const tagMultiplier = isCTOContested ? 1 + counterCTOCount : 1;

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
    let finalSuccess = true;
    // 判斷玩家的選擇是否需要付費來合法申報
    const isDeclaration = choice === 'declare';

    // 1. 成本計算 (GEMINI.md §2-2)，判斷玩家有沒有足夠的錢選擇選項
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
        apRefunded: true, // 資金不足時取消行動，並退還行動力
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

    // 2. 基礎收益暫存區 (待套用 RP 名聲懲罰...等公式)
    const baseRewardG = opt.g || 0;
    const baseRewardRP = opt.rp || 0;
    const baseRewardIP = opt.ip || 0;
    // 基礎收益給會計天賦判定，看有沒有額外的灰色收入加成
    const bonusRewardG = applyAccountantBonus(player, cardId, baseRewardG);
    // [核心修正] C 類卡片的 C 類選項，即使申報也要過機率檢定；A 類選項申報則維持百分百成功
    const isCTypeCOption = cardId.startsWith('C-') && opt.type === 'C';
    const skipRandomCheck = isDeclaration && !isCTypeCOption;

    // 3. 系統報表敘事生成與標籤處理
    if (isDeclaration) {
      message = `【安全申報】已依照法規完成金流紀錄，扣除相關成本 ${costToDeduct} 萬。`;
    } else if (resolvedBaseTags.length > 0) {
      // 優先記錄從法條解析出的標籤
      for (let i = 0; i < tagMultiplier; i++) {
        snapshots.push({
          tag: resolvedBaseTags,
          netIncome: bonusRewardG,
          lawCaseIds: baseLawCaseIds,
          rpChange: baseRewardRP,
          surface_term: opt.surface_term,
          hidden_intent: opt.hidden_intent,
          escape: opt.escape,
          multiplier: tagMultiplier,
          multiplierSource: tagMultiplier > 1 ? 'CTO' : undefined,
        });
      }
      if (choice === 'skip' && opt.type !== 'C') {
        message += ` (已略過申報，扣除成本 ${costToDeduct} 萬)`;
      }
    } // [修正] 移除冗餘的「隱匿金流」備援區塊，因所有具備申報面板之卡牌均已帶有 lawCaseIds。

    // 4. 行動機率(骰子檢定)判定
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
        // 安全申報，需要倒貼手續費
        finalGChange = -costToDeduct;
        // [新增] C 類卡申報成功額外獎勵 30 RP；其餘卡片維持原本基礎名聲獎勵
        const baseRPWithBonus = isCTypeCOption ? baseRewardRP + 30 : baseRewardRP;
        finalRPChange = calculateActualRPGain(player, baseRPWithBonus);
        finalIPChange = baseRewardIP;

        // [新增] 若是 C 類卡且成功獲得獎勵，在訊息增加提示文字
        if (isCTypeCOption) {
          message += `。獲得額外獎勵 +30 RP！`;
        }
      } else {
        // 檢定過關且未主動申報的黑箱路線
        // [修正] 獎勵回測機制：若 succ 中未定義，則回退使用頂層基礎數值，支援扁平結構卡牌
        const succG = opt.succ?.g !== undefined ? opt.succ.g : opt.g || 0;
        const succRP = opt.succ?.rp !== undefined ? opt.succ.rp : opt.rp || 0;
        const succIP = opt.succ?.ip !== undefined ? opt.succ.ip : opt.ip || 0;

        // 成功獲得的資金再次納入會計師進行額外分紅加成
        const bonusSuccG = applyAccountantBonus(player, cardId, succG);
        const totalG = bonusSuccG;
        const totalRP = succRP;

        // 最終結算
        finalGChange = totalG - costToDeduct;
        finalRPChange = calculateActualRPGain(player, totalRP);
        finalIPChange = succIP;

        // E 卡洗黑材料清除機制
        if (opt.succ?.bm === 'all') {
          // 成功洗白所有黑材料
          updates.blackMaterialSources = [];
        } else if (typeof opt.succ?.bm === 'number') {
          // 隨機抽取黑材料進行抹平
          const sources = JSON.parse(JSON.stringify(player.blackMaterialSources || []));
          let pointsToRemove = opt.succ.bm;
          while (pointsToRemove > 0) {
            const valid = sources
              .map((s: BlackMaterialSource, idx: number) => (s.count > 0 ? idx : -1))
              .filter((idx: number) => idx !== -1);
            if (valid.length === 0) break; // 若玩家目前無黑材料則停止清除
            const target = valid[Math.floor(Math.random() * valid.length)];
            sources[target].count -= 1;
            pointsToRemove -= 1;
          }
          // 保留標籤紀錄
          updates.blackMaterialSources = sources.filter((s: BlackMaterialSource) => s.count > 0);
        }

        // 成功所帶出來的標籤：僅在有明確定義成功標籤，且與頂層標籤不重複時才增加
        const succLawCaseIds = (opt.succ?.lawCaseIds || []).filter(id => !baseLawCaseIds.includes(id));
        const resolvedSuccTags = getResolvedTags(succLawCaseIds);
        if (resolvedSuccTags.length > 0) {
          for (let i = 0; i < tagMultiplier; i++) {
            snapshots.push({
              tag: resolvedSuccTags,
              netIncome: totalG,
              lawCaseIds: succLawCaseIds,
              rpChange: finalRPChange,
              surface_term: opt.surface_term,
              hidden_intent: opt.hidden_intent,
              escape: opt.escape,
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
      // 失敗的情況
      const failG = opt.fail?.g || 0;
      const failRP = opt.fail?.rp || 0;
      const failIP = opt.fail?.ip || 0;
      // 資金名聲結算
      const totalG = bonusRewardG + failG;
      const totalRP = baseRewardRP + failRP;

      finalGChange = totalG - costToDeduct;
      finalRPChange = calculateActualRPGain(player, totalRP);
      finalIPChange = finalIPChange + failIP;

      // 失敗所帶出來的標籤：僅在有明確定義失敗標籤，且與頂層標籤不重複時才增加
      const failLawCaseIds = (opt.fail?.lawCaseIds || []).filter(id => !baseLawCaseIds.includes(id));
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
          surface_term: s.surface_term,
          hidden_intent: s.hidden_intent,
          escape: s.escape,
          isResolved: false,
        });
        // 更新最新一筆的防偽亂碼
        currentLastHash = hash;
      }
    }

    // 7. 保障AP安全機制
    // 失敗或取消的，AP點數不扣除
    const isAPRefundedBySkill = shouldRefundAP(player, cardId);
    const apRefunded = (player.g < costToDeduct && !finalSuccess) || isAPRefundedBySkill;

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
    // 總裁指示：原本的標籤就是一個黑材料 (SSOT，基礎 1 點)
    // 修正：申報失敗也會產生黑材料，且「不申報」時根據類別有額外加成
    if (hashedTags.length > 0) {
      const newBMSources = [...(updates.blackMaterialSources || player.blackMaterialSources || [])];
      
      // 計算額外加成 (僅在選擇不申報時)
      let extraBM = 0;
      if (!isDeclaration) {
        if (opt.type === 'C') extraBM = 2; // [修正] 每標籤 1+2=3 點，2標籤則為 6 點
        else if (opt.type === 'B') extraBM = 1; // 每標籤 1+1=2 點
      }

      hashedTags.forEach((ht) => {
        newBMSources.push({
          tag: ht.text,
          count: 1 + extraBM, // [SSOT 歸一化] 基礎 1 + 類別加重
          actionId,
          turn,
        });
      });

      updates.blackMaterialSources = newBMSources;
    }

    // 9. 檢查是否有「強制起訴」狀態 (如E卡)
    let forcedTrial = undefined;
    if (!finalSuccess && opt.fail?.special === 'sue') {
      forcedTrial = { tagId: actionId, reason: message };
    }

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
      success: finalSuccess,
      message: `${message}${multiplierLabel}`,
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
  } catch (err: any) {
    // [核爆處理]：透過 instanceof 對錯誤進行分類，提供玩家更有意義的修復建議。
    console.error(`[Fatal Action Engine Error]`, err);

    let categoryPrefix = '🚫 系統嚴重錯誤';
    let suggestion = '請截圖並聯繫開發者。';

    if (err.category === 'Data') {
      categoryPrefix = '📁 資料損毀錯誤';
      suggestion = '請嘗試重新整理網頁或重新啟動遊戲。';
    } else if (err.category === 'Calculation') {
      categoryPrefix = '🔢 數值算力錯誤';
      suggestion = '偵測到非法數值運算，請聯繫開發人員。';
    } else if (err.category === 'Flow') {
      categoryPrefix = '🌐 環境流程錯誤';
      suggestion = '目前環境可能不支持某些功能，請使用現代瀏覽器。';
    }

    return {
      success: false,
      message: `${categoryPrefix}：${err?.message || '未知錯誤'}。\n【建議】${suggestion}`,
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
  if (player.ap <= 0) return { success: false, message: '無法洗牌。', updates: {} };
  return {
    success: true,
    message: `【洗牌成功】已刷新桌上5張牌。`,
    updates: { ap: player.ap - 1 },
  };
}
