/**
 * 系統全域文案定義 (System Strings)
 *
 * 本檔案為「系統級別回饋」的單一真值來源 (SSOT)。
 * 包含錯誤攔截訊息、引擎邏輯回饋、以及 UI 共用標籤。
 * 讓開發者在修改提示語氣時，無需深入引擎邏輯原始碼。
 */

export const SystemStrings = {
  // 🚫 錯誤與攔截相關
  ERRORS: {
    INVALID_CODE: '無效代碼。',
    INVALID_PLAYER: '無效玩家',
    INSUFFICIENT_AP: '🚫 體力不足：\n您的 AP 已歸零，請結束回合以恢復精力。',
    BANKRUPT_BLOCK: '🚫 行動終止：\n您的企業已宣告破產，無法再進行商業活動。',
    CAMERA_START_FAIL: '啟動失敗：\n請檢查權限設定，或嘗試重新整理頁面。',
    SECURE_CONTEXT_REQUIRED:
      '🚨 安全性限制：\n瀏覽器禁止在非加密連線 (HTTP) 下開啟相機。\n請將網址改為 https:// 或使用手動輸入編碼。',
  },

  // ✅ 行動與引擎回饋相關
  ACTION: {
    DECLARATION_LABEL: '安全申報',
    SKIP_DECLARATION_LABEL: '已略過申報',
    SUCCESS_PREFIX: '【成功】',
    DEFAULT_SUCCESS_LABEL: '計畫執行成功',
    ACCOUNTANT_BONUS_TIP: '(已獲得會計師額外分紅)',
    REDRAW_SUCCESS: '手牌洗牌成功',
    UPGRADE_SUCCESS: '員工升級成功',
    PR_DISCOUNT_TIP: '(已執行公關損害控管)',
  },

  // 🏛️ 法庭相關
  COURT: {
    WIN_RP_RECOVERY: '【勝訴】\n由於您洗清了冤屈，相關名聲已成功補回。',
    LOSE_PENALTY: '【敗訴】\n法庭已正式執行裁罰，資金與名聲遭到扣除。',
    APPEAL_USED: '【非常上訴】已啟動。\n這是一場決定命運的辯論。',
    WITHDRAW_SUCCESS: '相關案件已成功撤銷。',
  },

  // 🔚 結算相關
  ENDING: {
    TITLE_PREFIX: '最終結局：',
    EVAL_PREFIX: '歷史評價：',
  },
};
