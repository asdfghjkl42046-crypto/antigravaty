/**
 * 遊戲底層數值運算中心
 * 負責處理扣款打折、名聲懲罰、法庭法官貪婪偏好，以及何時會被警方大起訴的機率核心
 */

import type { Player, JudgePersonality, BribeItem } from '../types/game';
import { roundUp } from './MathEngine';
import {
  applyAccountantCourtDiscount,
  applyPRCourtDiscount,
  isBetImmune,
  getPRAutoRP,
  getCTOAutoIncome,
  calculateTrustTransfer,
} from './RoleEngine';
import {
  throwDataCorruptionError,
  throwLogicFailureError,
  throwNumericalCheckError,
} from './errors/EngineErrors';

// ============================================================
// §1-2 信用不合格 (收益補丁)
// ============================================================

/**
 * 名聲(RP)進帳結算
 * 如果玩家已經臭名昭彰 (名聲 < 50)，名聲收益會被系統殘酷打折。
 * 象徵著一旦喪失社會公信力，要洗白是非常困難的。
 */
export function calculateActualRPGain(player: Player, baseGain: number): number {
  if (baseGain <= 0) return baseGain; // 負向扣除不受此減半懲罰影響 (往下掉一樣快)
  if (player.rp < 50) {
    return roundUp(baseGain * 0.5); // 收益砍半
  }
  return baseGain;
}

// ============================================================
// §1-3 起訴機率公式
// ============================================================

/**
 * 起訴通緝值計算 (法院盯上你的機率)
 * 混合了本局的新罪、往年的舊帳，甚至連你做過的公益名聲都能拿來抵銷罪孽。
 * 但如果你是個長期的慣犯，系統還會強制拉高你的「被起訴保底機率」。
 */
export function getIndictmentChance(player: Player, currentTurn: number = 1): number {
  const sources = player.blackMaterialSources || [];

  // 嚴格檢查：如果 blackMaterialSources 內部的 count 含有 NaN，直接報錯
  sources.forEach((s, idx) => {
    if (s.count === undefined || Number.isNaN(s.count)) {
      throwDataCorruptionError(
        `玩家: ${player.name}`,
        `檢測到非法黑材料數據！標籤: ${s.tag}, 索引: ${idx}, 數值: ${s.count}。這會導致起訴機率計算失效。`
      );
    }
  });

  // 累加出現役的總黑材料數 (BM)
  const totalBM = sources.reduce((sum, s) => sum + s.count, 0);

  // 安全機制：如果玩家身上乾乾淨淨沒有任何黑材料，
  // 警方就絕對拿你沒轍 (起訴率 0%)，保障乖乖牌玩家。
  if (totalBM === 0) return 0;

  // 分離出「本回合剛產生熱騰騰的黑料 (高權重)」與「往期留下來的舊帳 (低權重)」
  const newBM = sources.filter((s) => s.turn === currentTurn).reduce((sum, s) => sum + s.count, 0);
  const oldBM = sources.filter((s) => s.turn < currentTurn).reduce((sum, s) => sum + s.count, 0);

  // 嚴格檢查：totalTagsCount 是否為合法數字
  if (player.totalTagsCount !== undefined && Number.isNaN(player.totalTagsCount)) {
    throwDataCorruptionError(`玩家: ${player.name}`, `totalTagsCount 為 NaN！`);
  }
  const totalTags = player.totalTagsCount || 0;

  // 綜合結算：(新罪*3.5倍) + (舊罪*0.8倍) + (累積犯罪標籤*0.2) - (名望折抵)
  const baseProb = newBM * 3.5 + oldBM * 0.8 + totalTags * 0.2 - (player.rp - 50) * 0.5;

  // 最後確認：如果最終機率算出來是 NaN，說明 player.rp 可能也有問題
  if (Number.isNaN(baseProb)) {
    throwLogicFailureError(
      `起訴機率計算結果為 NaN！`,
      `(newBM: ${newBM}, oldBM: ${oldBM}, totalTags: ${totalTags}, RP: ${player.rp})`
    );
  }

  // 違法階梯：為防止老玩家依仗資金洗白，歷史犯罪次數過多的法外狂徒將面臨越來越高的基礎發跡底線
  let floor = 0;
  if (totalTags > 0) {
    floor = Math.min(100, Math.ceil(totalTags / 40) * 10);
  }

  // 回傳前抹除小數點，並確保機率介於 0% 到 100% 之間
  const rawProb = Math.floor(baseProb);
  return Math.max(floor, Math.min(100, rawProb));
}

// ============================================================
// 法庭處罰與賄賂好感度處理
// ============================================================

/**
 * 賄賂契合度死定矩陣 (Scale 1-10)
 * 記錄五種法官人格對於不同走小門贈禮的受賄喜好度評分。5分為極愛，1分為厭惡。
 */
export const BRIBE_MATRIX: Record<JudgePersonality, Record<BribeItem, number>> = {
  traditionalist: { antique: 5, crypto: 1, art: 4, wine: 3, intel: 2 }, // 傳統派愛古董
  algorithmic: { antique: 1, crypto: 5, art: 3, wine: 2, intel: 4 }, // 科技派愛加密貨幣
  elegant: { antique: 4, crypto: 2, art: 5, wine: 4, intel: 1 }, // 貴族派愛藝術收藏
  pragmatic: { antique: 2, crypto: 4, art: 1, wine: 5, intel: 3 }, // 務實派愛名酒豪飲
  power_broker: { antique: 3, crypto: 3, art: 2, wine: 1, intel: 5 }, // 軍閥派愛軍事情報
};

/** 提取賄賂好感度得分的純函式 */
export function getBribeScore(judge: JudgePersonality, item: BribeItem): number {
  return BRIBE_MATRIX[judge][item] || 0;
}

/**
 * 法庭敗訴大失血結算：
 * 一旦被法官判決有罪，會面臨殘酷的剝奪：
 * 1. 罰款以當初不法獲利的 3 倍起跳。
 * 2. 如果是法院常客 (累犯)，罰款會翻到 6 倍之多！
 * 3. 高級公關或會計師幫你擋煞。
 */
export function calculateConvictionPenalty(
  player: Player,
  netIncome: number,
  currentTurn: number = 999, // 預設 999 防呆，避免沒傳到的地方炸掉
  isPreexisting: boolean = false, // 標記是否為開局既有的前科 (Turn 0)
  isAppeal: boolean = false, // 標記是否為非常上訴回合 (重審)
  personality?: JudgePersonality
): {
  fine: number;
  rpLoss: number;
  detail?: string;
} {
  // 防呆：無法判斷的收入或非法數值直接拒絕結算
  if (netIncome === undefined || netIncome === null || Number.isNaN(Number(netIncome))) {
    throwNumericalCheckError(
      `玩家: ${player.name} 的法庭結算`,
      `測得不法所得 (netIncome) 缺失或為 NaN！無法計算罰金。`
    );
  }
  const safeIncome = netIncome;

  // 1. 強制倍率邏輯：如果是開局既有 (Turn 0)，強制套用 1.0x (單純吐回非法所得，不額外追絞)
  // 否則，前 5 回合敗訴 (包含 5 回合)，只罰該案件淨獲利的 1 倍作為保護期；5回合後標準罰則為 3x
  const isProtected = currentTurn <= 5;
  const baseMultiplier = isPreexisting || isProtected ? 1.0 : 3.0;

  // 基礎罰金計算: 本次查獲不法所得的指定倍率
  let fineBeforeDiscount = roundUp(safeIncome * baseMultiplier);

  // 2. 檢查玩家生涯進出法庭的黑歷史 (非常上訴失敗強制加重 6 倍！)
  const trials = player.totalTrials || 0;
  let trialMultiplier = 1.0;

  if (isAppeal) {
    trialMultiplier = 2.0; // 上訴失敗，雙倍奉還
  } else if (!isPreexisting) {
    // 開局既有罪犯不重複加重 (除非上訴失敗)，正常遊戲案件則依累犯門檻提升
    if (trials >= 7) trialMultiplier = 6.0;
    else if (trials >= 4) trialMultiplier = 3.0;
  }

  fineBeforeDiscount = roundUp(fineBeforeDiscount * trialMultiplier);
  const baseRPLoss = 5;

  // 3. 折扣與保護傘邏輯
  // 上訴重審則保留原本的所有折扣
  const rawDiscount = player.startBonusFineReduction || 0;
  if (Number.isNaN(rawDiscount)) {
    throwNumericalCheckError(
      'MechanicsEngine.calculateConvictionPenalty',
      `偵測到非法折扣率 (startBonusFineReduction: ${rawDiscount})。`
    );
  }
  const discountRate = isPreexisting ? 0 : rawDiscount; // [修正] 移除 isAppeal 限制

  // [賄賂系統實作] 判斷賄賂物是否完全命中法官偏好 (得分 5 分)
  let bribeMultiplier = 1.0;
  if (personality && player.bribeItem && !isPreexisting) {
    // [修正] 移除 !isAppeal 限制
    const score = getBribeScore(personality, player.bribeItem);
    if (score === 5) {
      bribeMultiplier = 0.8; // 完全匹配時獲得 20% 減免
    }
  }

  const fineMultiplier = (1.0 - discountRate) * bribeMultiplier;

  // 將保護傘折扣套用回最終罰款上
  let fine = roundUp(fineBeforeDiscount * fineMultiplier);

  // 4. 檢查專業人士擋災 (如果是開局既有，會計師無法幫你擋掉)
  fine = isPreexisting
    ? applyAccountantCourtDiscount(player, fine)
    : applyAccountantCourtDiscount(player, fine);
  // [優化] 上述行邏輯有誤，應為：
  fine = isPreexisting ? fine : applyAccountantCourtDiscount(player, fine); // [修正] 移除 isAppeal 限制
  const rpLoss = applyPRCourtDiscount(player, baseRPLoss);

  // 5. 拼湊計算明細說明文本 (讓玩家死個明白)
  const trialCount = trials + 1;
  const turnLabel = currentTurn === 0 ? '[開局前科]' : `[第 ${currentTurn} 回合]`;
  const trialLabel = isAppeal ? '[非常上訴失利]' : `[第 ${trialCount} 次涉案]`;
  const multiplierReason = isPreexisting || isProtected ? '(新手保護期 1.0x)' : '(標準倍率 3.0x)';

  let detail = `${turnLabel} ${trialLabel} 不法所得(${safeIncome}萬) * ${multiplierReason}`;

  if (isAppeal) {
    detail += `\n- 非常上訴失敗：罰金強制加重 2.0x (並套用既有減免)`;
  }
 else if (trialMultiplier > 1) {
    const reason = trials >= 7 ? '限制重案累犯' : '累犯倍率';
    detail += ` * ${reason} ${trialMultiplier}倍`;
  }

  const baseTotal = roundUp(fineBeforeDiscount);

  if (discountRate > 0) {
    detail += ` = ${baseTotal}萬；減去開局特權-${Math.round(discountRate * 100)}%`;
  }

  if (bribeMultiplier < 1) {
    detail += `；[賄賂加成] 罰金再折抵 20%`;
  }

  detail += ` 總計 = ${fine} 萬 G`;
  return { fine, rpLoss, detail };
}

/**
 * 旁觀者干預機率補正：
 * 被告的同夥可以護航 (支持 +10% 勝率)，但競爭對手也可以落井下石 (質疑 -10% 勝率)。
 */
export function calculateSpectatorInfluence(interventions: { text: string }[]): number {
  if (!interventions || interventions.length === 0) return 0;

  let totalInfluence = 0;
  interventions.forEach((iv, idx) => {
    // 核心邊界防禦：確保傳入的干預物件具備合法文本描述，避免 TypeError 導致法庭流程中斷
    if (!iv || typeof iv.text !== 'string') {
      throwDataCorruptionError(
        'MechanicsEngine.calculateSpectatorInfluence',
        `偵測到非法干預數據 (索引: ${idx})！物件缺少或具備無效的 text 屬性。`
      );
    }

    // 根據預定義的公版文字來匹配干預力
    if (iv.text.includes('合理商業範疇')) {
      totalInfluence += 0.1; // 支持被告 (+10%)
    } else if (iv.text.includes('深表懷疑')) {
      totalInfluence -= 0.1; // 質疑被告
    }
  });

  return totalInfluence;
}

export interface BetResult {
  gGain: number; // 現金增減 (萬 G)
  ipGain: number; // 人脈點數獎勵 (IP)
  rpGain: number; // 社會信用名聲增減 (RP)
}

/**
 * 旁聽席的賭博：
 * 當別人在受審時，你可以下注押他會不會坐牢。
 * 雖然猜中有人才點數，但猜錯可是會被沒收 100 萬元保證金的！
 */
export function settleBet(
  player: Player,
  betChoice: 'win' | 'lose' | 'none',
  actualResult: boolean
): BetResult {
  // 良民不參與賭博，全身而退
  if (betChoice === 'none') return { gGain: 0, ipGain: 0, rpGain: 0 };

  // 判定其賭盤選擇是否與法庭結論相同
  const isCorrect =
    (betChoice === 'win' && actualResult) || (betChoice === 'lose' && !actualResult);

  // 猜中有人才點數，統一給予 30 IP
  if (isCorrect) return { gGain: 0, ipGain: 30, rpGain: 0 };

  // 如果猜錯，先檢查玩家有沒有裝配免死公關天賦 (LV3)
  if (isBetImmune(player)) return { gGain: 0, ipGain: 0, rpGain: 0 };

  // 沒有防護罩的輸家被扣除 10 點名聲 (RP)
  // 此扣除將在 store 結算時，被公關部長 (LV1) 的技能再次折抵。
  return { gGain: 0, ipGain: 0, rpGain: -10 };
}

/**
 * 當玩家按下結束回合時執行。
 * 負責發放高級人才的被動薪水、結算守法天數，並把多餘的錢偷偷塞進海外信託。
 */
export function settleEndOfTurn(player: Player, currentTurn: number): Partial<Player> {
  const updates: Partial<Player> = {};

  // § 嚴格檢查：核心資產必須存在且為合法數字 (防止數據損壞導致的 NaN 連鎖反應)
  if (player.g === undefined || Number.isNaN(player.g)) {
    throwDataCorruptionError(`玩家: ${player.name}`, `現金(g) 屬性缺失或為 NaN！`);
  }
  if (player.rp === undefined || Number.isNaN(player.rp)) {
    throwDataCorruptionError(`玩家: ${player.name}`, `名聲(rp) 屬性缺失或為 NaN！`);
  }
  if (player.trustFund === undefined || Number.isNaN(player.trustFund)) {
    throwDataCorruptionError(`玩家: ${player.name}`, `信託基金(trustFund) 屬性缺失或為 NaN！`);
  }
  if (player.consecutiveCleanTurns === undefined || Number.isNaN(player.consecutiveCleanTurns)) {
    throwDataCorruptionError(
      `玩家: ${player.name}`,
      `連續清白回合(consecutiveCleanTurns) 屬性缺失或為 NaN！`
    );
  }

  // 擷取當前狀態以便運算推疊
  let finalG = player.g;
  let finalRP = player.rp;
  let finalTrust = player.trustFund;

  // 1. 人資天賦檢查 - 公關 (PR) LV3：動用媒體帶風向，每回合免費自動 +5 RP
  const rpPerTurn = getPRAutoRP(player);
  if (rpPerTurn > 0) finalRP += rpPerTurn;

  // 2. 人資天賦檢查 - 技術長 (CTO) LV3：靠自動化黑客網路腳本印鈔，每回合免費自動 +100 萬 G
  const gPerTurn = getCTOAutoIncome(player);
  if (gPerTurn > 0) finalG += gPerTurn;

  // 3. 清白回合計數更新 (§4-2)
  // 檢查該玩家在「這整回合之中」是否有染指任何最新觸發的犯罪標籤
  const hasCrimeThisTurn = player.tags.some(
    (t) => t.isCrime && t.turn === currentTurn && !t.isResolved
  );
  // 若該局有犯案，連續無犯罪紀錄歸零；若無犯案，則增加計數 (Streak Bonus)
  const newConsecutiveCleanTurns = hasCrimeThisTurn ? 0 : (player.consecutiveCleanTurns || 0) + 1;
  updates.consecutiveCleanTurns = newConsecutiveCleanTurns;

  // 4. 人資天賦檢查 - 會計師 (Accountant) LV3：合法避稅網路與信託金轉移機制
  // 隨著連續做乖寶寶的回合增加 (Streak Bonus)，會計師能將越來越龐大的現金轉入不可被法院追繳的海外信託
  const tempPlayer = { ...player, consecutiveCleanTurns: newConsecutiveCleanTurns };
  const trustAmount = calculateTrustTransfer(tempPlayer);
  if (trustAmount > 0) {
    // 扣除手邊暴露危險的流動金，轉入信託保險箱
    finalG -= trustAmount;
    finalTrust += trustAmount;
  }

  // 5. AP 行動力重置：回合結束時，除非玩家已經出局，否則 AP 強度補回上限 5 點供下一輪運用
  updates.ap = player.isBankrupt ? player.ap : 5;

  // 最終安全檢查：確保回傳的數據不包含 NaN 或非法值
  if (
    Number.isNaN(finalG) ||
    Number.isNaN(finalRP) ||
    Number.isNaN(finalTrust) ||
    Number.isNaN(newConsecutiveCleanTurns)
  ) {
    throwDataCorruptionError(
      `玩家: ${player.name}`,
      `結算過程中產生非法數值！(G: ${finalG}, RP: ${finalRP}, Trust: ${finalTrust}, CleanTurns: ${newConsecutiveCleanTurns})`
    );
  }

  // 紀錄封裝
  updates.g = finalG;
  updates.rp = finalRP;
  updates.trustFund = finalTrust;

  return updates;
}
