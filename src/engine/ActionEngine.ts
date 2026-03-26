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
} from '../types/game';
import { CARDS_DB } from '../data/cards/CardsDB';
import { LAW_CASES_DB, getResolvedTags } from '../data/laws/LawCasesDB';
import { roundUp, sha256 } from './MathEngine';
import { calculateActualRPGain } from './MechanicsEngine';
import { applyAccountantBonus, shouldRefundAP } from './RoleEngine';

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
    special?: string; // 特殊狀態如 'sue' 會強制觸發起訴
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

    // 第二回合起：依體力決定順序
    const apA = Number(a.ap);
    const apB = Number(b.ap);
    if (apB !== apA) return apB - apA;

    // 若行動力相同，則由資本高的玩家先行
    const assetsA = (a.g || 0) + (a.trustFund || 0);
    const assetsB = (b.g || 0) + (b.trustFund || 0);
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
  choice: 'declare' | 'skip',
  turn: number,
  counterCTOCount: number = 0
): Promise<ActionResult & { hashedTags: Tag[]; finalHash: string }> {
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
      apRefunded: false,
      actionId,
      log: { playerId: player.id, turn, cardId, optionIndex: optionIdx, tags: '', timestamp },
    };
  }

  // 取出被選中的卡片選項詳細結構參數
  const opt = card[optionIdx as unknown as keyof Card] as AnyCardOption;
  const updates: Partial<Player> = {};
  const snapshots: ActionResult['appliedTags'] = [];

  // [CTO 反制技] 偵測人才市場的惡性競爭 (可疊加)
  if (counterCTOCount > 0 && cardId.startsWith('B-') && (opt?.type === 'B' || opt?.type === 'C')) {
    for (let i = 0; i < counterCTOCount; i++) {
      snapshots.push({
        tag: ['專利侵權'],
        netIncome: 0,
        lawCaseIds: ['B-COUNTER-PATENT'],
        rpChange: -5,
      });
    }
  }

  // 檢查玩家是否正受到禁足管制 (例如被政府盯上)
  if (player.skipNextCard) {
    return {
      success: false,
      message: `🚫 行動凍結：您目前正受到標案審核或政府管制，本次行動無效！`,
      updates: { skipNextCard: false }, // 自動解除管制以迎接下次行動
      appliedTags: [],
      hashedTags: [],
      finalHash: lastHash,
      apRefunded: false,
      actionId,
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
  if (opt.costCashPct !== undefined) {
    // 有比例費用的計算公式 (無條件進位)
    costToDeduct = Math.max(costToDeduct, roundUp((player.g || 0) * opt.costCashPct));
  }
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
  // 合法申報不需面臨隨機失敗檢定
  const skipRandomCheck = isDeclaration;

  // 3. 系統報表敘事生成與標籤處理
  if (isDeclaration) {
    message = `【安全申報】已依照法規完成金流紀錄，扣除相關成本 ${costToDeduct} 萬。`;
  } else if (resolvedBaseTags.length > 0) {
    // 優先記錄從法條解析出的標籤
    snapshots.push({
      tag: resolvedBaseTags,
      netIncome: bonusRewardG,
      lawCaseIds: baseLawCaseIds,
      rpChange: baseRewardRP,
      surface_term: opt.surface_term,
      hidden_intent: opt.hidden_intent,
      escape: opt.escape,
    });
    if (choice === 'skip' && opt.type !== 'C') {
      message += ` (已略過申報，扣除成本 ${costToDeduct} 萬)`;
    }
  } else if (choice === 'skip') {
    // 僅在選擇略過且未對應特定法律條文時，才使用通用的「隱匿金流」標籤
    snapshots.push({
      tag: ['隱匿金流'],
      netIncome: bonusRewardG,
      lawCaseIds: baseLawCaseIds,
      rpChange: baseRewardRP,
      surface_term: opt.surface_term,
      hidden_intent: opt.hidden_intent,
      escape: opt.escape,
    });
    if (opt.type !== 'C') {
      message += ` (已略過申報，扣除成本 ${costToDeduct} 萬)`;
    }
  }

  // 4. 行動機率(骰子檢定)判定
  if (opt.succRate !== undefined && !skipRandomCheck) {
    // 非滿機率的判定
    if (Math.random() > opt.succRate) finalSuccess = false;
  }

  // 5. 根據勝敗來決定金錢與標籤結算
  let finalGChange = 0;
  let finalRPChange = 0;
  let finalIPChange = 0;

  if (finalSuccess) {
    if (isDeclaration) {
      // 安全申報，需要倒貼手續費
      finalGChange = -costToDeduct;
      // 但大幅吸收了名聲進帳
      finalRPChange = calculateActualRPGain(player, baseRewardRP);
      finalIPChange = baseRewardIP;
    } else {
      // 檢定過關且未主動申報的黑箱路線
      const succG = opt.succ?.g || 0;
      const succRP = opt.succ?.rp || 0;
      const succIP = opt.succ?.ip || 0;
      // 成功獲得的資金再次納入會計師進行額外分紅加成
      const bonusSuccG = applyAccountantBonus(player, cardId, succG);
      const totalG = bonusRewardG + bonusSuccG;
      const totalRP = baseRewardRP + succRP;

      // 最終結算
      finalGChange = totalG - costToDeduct;
      finalRPChange = calculateActualRPGain(player, totalRP);
      finalIPChange = baseRewardIP + succIP;

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

      // 成功所帶出來的標籤紀錄下來供未來當對簿公堂的把柄
      const succLawCaseIds = opt.succ?.lawCaseIds || opt.lawCaseIds || [];
      const resolvedSuccTags = getResolvedTags(succLawCaseIds);
      if (resolvedSuccTags.length > 0) {
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

      if (!message || message.startsWith(' (')) {
        message = `【成功】${opt.label || '計畫執行成功'}。${message}`;
      } else if (!message.includes('【成功】')) {
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

    // 失敗所帶出來的標籤紀錄下來供未來當對簿公堂的把柄
    const failLawCaseIds = opt.fail?.lawCaseIds || opt.lawCaseIds || [];
    const resolvedFailTags = getResolvedTags(failLawCaseIds);
    if (resolvedFailTags.length > 0) {
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
  // 總裁指示：原本的標籤就是一個黑材料 (SSOT，基礎 1 點)，如果是「不申報」則額外增加累加上去
  if (!isDeclaration && hashedTags.length > 0) {
    // A. 基礎罰則：每個標籤保底 1 點
    const baseBMPerTag = 1;

    // B. 額外懲罰池 (不申報時的 Bonus)：C 類卡牌(重大舞弊)額外加 3 點，B 類(一般違規)額外加 1 點
    let extraPenaltyPool = 0;
    if (opt.type === 'C') extraPenaltyPool = 3;
    else if (opt.type === 'B') extraPenaltyPool = 1;

    // C. 失敗額外罰則：若卡牌有設定 fail.bm，則繼續加重累計
    if (!finalSuccess && opt.fail?.bm) extraPenaltyPool += opt.fail.bm;

    const newBMSources = [...(updates.blackMaterialSources || player.blackMaterialSources || [])];
    
    // D. 累加分攤邏輯：將額外懲罰平分給各標籤
    const bonusPerTag = Math.floor(extraPenaltyPool / hashedTags.length);
    
    hashedTags.forEach((ht) => {
      newBMSources.push({ 
        tag: ht.text, 
        count: baseBMPerTag + bonusPerTag, // 基礎 1 + 額外懲罰 (Additive)
        actionId, 
        turn 
      });
    });
    
    updates.blackMaterialSources = newBMSources;
  }

  // 9. 檢查是否有「強制起訴」狀態 (如E卡)
  let forcedTrial = undefined;
  if (!finalSuccess && opt.fail?.special === 'sue') {
    forcedTrial = { tagId: actionId, reason: message };
  }

  // 將行動結果回傳給遊戲總控台
  return {
    success: finalSuccess,
    message,
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
        snapshots.map((t) => (Array.isArray(t.tag) ? t.tag.join('/') : t.tag)).join(',') ||
        (updates.skipNextCard ? 'SKIP_NEXT' : ''),
      timestamp: new Date().toISOString(),
    },
  };
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
