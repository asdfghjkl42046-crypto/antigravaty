/**
 * 角色技能系統
 * 處理玩家在人力市場購買的專業人才所帶來的被動加成與技能效果
 */

import type { Player, RoleType } from '../types/game';
import { roundUp } from './MathEngine';
import { SYSTEM_MESSAGES } from '../data/system/SystemMessages';

// ============================================================
// 通用角色基礎與升級介面
// ============================================================

/**
 * 取得玩家目前持有的單項角色技能等級
 * 防呆處理：若找不到物件，預設回傳 0 (無職業加成)
 */
export function getRoleLevel(player: Player, role: RoleType): number {
  return player.roles?.[role] ?? 0;
}

/** 角色升級驗證結構宣告 */
export interface UpgradeResult {
  success: boolean;
  message: string;
  updates?: Partial<Player>;
}

/**
 * 人才升級邏輯
 * 檢查玩家的資金與人脈是否足夠，並執行升級
 */
export function applyRoleUpgrade(player: Player, role: RoleType): UpgradeResult {
  const currentLevel = getRoleLevel(player, role);
  // 人資天賦上限皆為 3 級，滿等無法再次購買
  if (currentLevel >= 3) {
    return { success: false, message: SYSTEM_MESSAGES.ROLE.MAX_LEVEL(role) };
  }

  // 設定統一公定價 (100 人脈 + 100 萬元)
  const cost = { ip: 100, g: 100 };
  // 檢查玩家手頭的雙籌碼資源是否充足
  if (player.ip < cost.ip || player.g < cost.g) {
    return {
      success: false,
      message: SYSTEM_MESSAGES.ROLE.UPGRADE_REQUIREMENT(cost.ip, cost.g),
    };
  }

  // 取得目標升級階層並組裝進玩家的人才技能樹中
  const currentRoles = player.roles || {};
  const nextLevel = (currentRoles[role] || 0) + 1;
  const newRoles = { ...currentRoles, [role]: nextLevel };

  // 更新玩家的剩餘存款與點數
  const updates: Partial<Player> = {
    ip: player.ip - cost.ip,
    g: player.g - cost.g,
    roles: newRoles,
  };

  return {
    success: true,
    message: SYSTEM_MESSAGES.ROLE.UPGRADE_SUCCESS_DETAIL(role, nextLevel, cost.ip, cost.g),
    updates,
  };
}

// ============================================================
// 王牌律師 (Lawyer) - 主掌法庭答辯勝率與提告免疫
// ============================================================

/**
 * 王牌律師 LV1：法庭勝率加成
 * 讓玩家在法庭親自答辯時的成功率額外上升 30%
 */
export function getLawyerDefenseBonus(player: Player): number {
  // 總裁指示：我的技能是單純提升 30% 勝率。
  return getRoleLevel(player, 'lawyer') >= 1 ? 0.3 : 0;
}

/**
 * 王牌律師 LV2：防雷機制
 * 法庭上面對法官質詢時，系統會自動幫玩家刪除 1 個絕對會輸的選項
 */
export function shouldRemoveWrongOption(player: Player): boolean {
  return getRoleLevel(player, 'lawyer') >= 2;
}

/**
 * 計算律師終極技能「強制撤告」的手續費
 * 需花費玩家目前總體資金的 20% (最低 100 萬)
 */
export function getWithdrawCaseCost(player: Player): { g: number; ip: number } {
  return {
    g: Math.max(100, roundUp(player.g * 0.2)),
    ip: 5, // 固定另加消耗 5 點公關人脈進行打點疏通
  };
}

/**
 * 王牌律師 LV3：強制撤告發動條件
 * 判斷玩家在即將敗訴時，是否有足夠的資金與人脈來買通關係，強制銷案
 */
export function canWithdrawCase(player: Player): boolean {
  if (getRoleLevel(player, 'lawyer') < 3) return false;
  const { g: fee, ip: ipCost } = getWithdrawCaseCost(player);
  return player.g >= fee && player.ip >= ipCost;
}

/**
 * 計算敗訴後「非常上訴」重啟審判的法庭規費
 * 需扣除總資金的 20%
 */
export function getExtraAppealCost(player: Player): number {
  return roundUp(player.g * 0.2);
}

// ============================================================
// 公關經理 (PR) - 主掌媒體名望控制與賭局防護
// ============================================================

/**
 * 公關經理 LV1：危機處理
 * 玩家做壞事被扣除名聲時，公關部會出手掩蓋，讓名聲損失直接減半
 */
export function applyPRDiscount(player: Player, rpLoss: number): number {
  if (rpLoss >= 0) return rpLoss;
  if (getRoleLevel(player, 'pr') >= 1) {
    return roundUp(rpLoss / 2);
  }
  return rpLoss;
}

/**
 * 公關經理 LV2：帶風向
 * 若玩家在法庭敗訴，公關部能將社會輿論的殺傷力減半，保護公司形象
 */
export function applyPRCourtDiscount(player: Player, rpPenalty: number): number {
  if (getRoleLevel(player, 'pr') >= 2) {
    return roundUp(rpPenalty / 2);
  }
  return rpPenalty;
}

/**
 * 公關經理 LV3：免責聲明
 * 押注對手法庭勝敗時，就算猜錯也免除 10 點名聲損失
 */
export function isBetImmune(player: Player): boolean {
  return getRoleLevel(player, 'pr') >= 3;
}

/**
 * 公關經理 LV3：大外宣
 * 企業公關部每回合會自動發佈正面新聞，自動增加 5 點名聲
 */
export function getPRAutoRP(player: Player): number {
  return getRoleLevel(player, 'pr') >= 3 ? 5 : 0;
}

// ============================================================
// 資深會計師 (Accountant) - 主掌資金流向與海外避稅信託
// ============================================================

/**
 * 資深會計師 LV1：合法作帳
 * 執行 A 或 D 類商業卡牌賺錢時，靠著節稅自動多出 10% 利潤
 */
export function applyAccountantBonus(player: Player, cardId: string, gGain: number): number {
  if (gGain <= 0) return gGain; // 虧錢的交易不作帳
  const isAD = cardId.startsWith('A-') || cardId.startsWith('D-');
  if (isAD && getRoleLevel(player, 'accountant') >= 1) {
    return roundUp(gGain * 1.1); // 回傳增值 10% 之後的最終帳面獲益
  }
  return gGain;
}

/**
 * 資深會計師 LV2：法院罰款減半
 * 被法院判定敗訴沒收資金時，合法將遭沒收的金額砍半
 */
export function applyAccountantCourtDiscount(player: Player, fine: number): number {
  if (getRoleLevel(player, 'accountant') >= 2) {
    return roundUp(fine / 2); // 例如原判決沒收 300 萬，經過做帳變成只查到 150 萬
  }
  return fine;
}

/**
 * 資深會計師 LV3：海外信託
 * 只要連續 2 回合安份守己沒有增加黑歷史，每回合會自動把 10% 現金洗進破產法管不到的海外信託裡
 */
export function calculateTrustTransfer(player: Player): number {
  if (getRoleLevel(player, 'accountant') < 3) return 0;
  if (player.consecutiveCleanTurns < 2) return 0; // 手腳不乾淨這回合沒辦法搬運資金

  // 計算金庫剩餘吞吐量：上限為 1000 萬，需事先扣除目前已經匯出海外的累積餘額
  const maxTransfer = 1000 - player.trustFund;
  if (maxTransfer <= 0) return 0; // 金庫存滿了就不再搬移以免露餡

  // 比較「身上現金一成」與「剩餘信託額度極限空間」，取其小者作為本次安全轉移金匯出
  return Math.min(roundUp(player.g * 0.1), maxTransfer);
}

// ============================================================
// 技術長 (CTO) - 主掌自動化研發投報與行動力返還
// ============================================================

/**
 * 技術長 LV1：自動化代操
 * 執行最耗時的 A 類商業卡時，有 30% 機率由系統自動完成，退還 1 點行動力
 */
export function shouldRefundAP(player: Player, cardId: string): boolean {
  if (!cardId.startsWith('A-')) return false; // 大數據自動化僅限 A 商業區受惠
  if (getRoleLevel(player, 'cto') < 1) return false;
  return Math.random() < 0.3; // 實體亂數擲骰 30% 運氣觸發
}

/**
 * 技術長 LV2：駭客腳本
 * 每回合透過網路與勒索腳本，自動進帳 100 萬元的隱密黑金
 */
export function getCTOAutoIncome(player: Player): number {
  return getRoleLevel(player, 'cto') >= 2 ? 100 : 0;
}

/**
 * 技術長 LV3：反制技 — 專利陷阱 (可疊加)
 * 當有對手在人才市場 (B類卡) 選擇挖角或剝削時，若場上有其他玩家具備此技能，
 * 該對手將會被自動掛載「專利侵權」標籤與黑材料。
 * 若多名對手擁有此技能，懲罰將重複觸發。
 */
export function getCTOAntiTheftCount(allPlayers: Player[], currentPlayerId: string): number {
  // 計算除了當前行動者以外，有多少人裝備了 LV3 的 CTO
  return allPlayers.filter((p) => p.id !== currentPlayerId && getRoleLevel(p, 'cto') >= 3).length;
}
