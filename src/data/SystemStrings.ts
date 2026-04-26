/**
 * 系統全域文案定義 (System Strings)
 *
 * 本檔案為「系統級別回饋」的單一真值來源 (SSOT)。
 * 包含錯誤攔截訊息、引擎邏輯回饋、以及 UI 共用標籤。
 */

export const SystemStrings = {
  // 🏷️ UI 共用標籤 (SSOT 修改點)
  UI_LABELS: {
    MONEY: '資金',
    TRUST_FUND: '海外信託',
    IP: 'IP 人脈',
    RP: 'RP 名聲',
    AP: 'AP 行動點數',
    BM: '黑料',
    CONVICTION: '前科',
    LEVEL: '等級',
    STATUS_BANKRUPT: '已破產',
    STATUS_ACTIVE: '運作中',
    
    // 按鈕與通用操作
    CONFIRM_RESOLUTION: '確認結算',
    CLOSE_CASE: '關閉卷宗',
    COLLECT_REWARD: '領取獎勵',
    END_TURN: '結束回合',
    BACK: '返回',
    SUBMIT: '送出',
    WITHDRAW_CASE: '強制撤告',
    APPEAL: '非常上訴',
    CANCEL: '取消返回',
    CONFIRM: '確認',

    // 商店/人才專用
    PAYMENT_TITLE: '支付結算',
    PAYMENT_SOURCE: '選擇支付來源',
    CASH_PAY: '現金支付',
    TRUST_PAY: '信託支付',
    ADJUST_PAY: '調整支付來源比例',
    CONFIRM_HIRE: '確認扣款並簽約',
    ROLE_CONTRACT: '人才任命合約',
    CONTRACT_SIGNED: '合約已生效',
  },

  // 📏 單位定義
  UNITS: {
    MONEY: '萬',
    IP: ' IP',
    RP: ' RP',
    BM: ' 件',
    LEVEL: ' 級',
  },

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
    TRIAL_TITLE: '法庭結算',
    WITHDRAW_TITLE: '強制撤告結算',
    APPEAL_TITLE: '啟動非常上訴',
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

  // ✨ 裝飾性與介面細節 (DASHBOARD/POPUPS)
  DECORATION: {
    SCAN_ID: '掃描編號',
    CONFIDENTIAL_DOC: '機密文件',
    CONFIDENTIAL_ADVANTAGE: '內部優勢文件',
    NEXT_PAGE: '下一頁',
    ACKNOWLEDGE: '朕知道了',
    RAP_SHEET: '犯罪紀錄編號',
    SUBJECT: '對象',
    CHARGE_PROTOCOL: '起訴協議代碼',
    RECIDIVISM_MARK: '累犯標記',
    NEXT_RECORD: '下一條紀錄',
    CLOSE_DOSSIER: '關閉卷宗',
    QUICK_BROWSE: '快速瀏覽',
    CURRENT_POS: '當前位置',
    ACTIVE: '生效中',
    IN_PROGRESS: '運作中',
  },

  // 📸 掃描頁面專用
  SCAN: {
    CAMERA_PROMPT: '點擊按鈕啟動光學掃描器',
    START_CAMERA: '啟動相機',
    INPUT_PLACEHOLDER: '例如: A011',
    MANUAL_INPUT_LABEL: '備援編碼輸入',
    END_TURN_PROMPT: (current: string, next: string) => `${current} 結束回合，換 ${next}`,
    DECODE_SYNC: '解析並同步卡片',
    NO_RECORDS: '檔案庫無任何犯罪紀錄',
  },

  // 🛒 商店與人才專用
  STORE: {
    HR_DOSSIER: '機密任命檔案',
    ID_LABEL: '識別編號',
    STAGES: '階段',
    CANCEL: '取消',
    CONFIRM_HIRE_PROMPT: '確認能力並準備簽約',
    INSUFFICIENT_FUNDS: '資金或人脈不足',
    CONTRACT_ACTIVE: '合約已生效',
  },

  // 📊 報表與結算
  RESOLUTION: {
    SUCCESS_TITLE: '計畫執行成功',
    FAILURE_TITLE: '計畫受阻',
    PASSIVE_TITLE: '回合結算報表',
    PASSIVE_MSG: '您的人才已完成本回合的自動化作業。',
    DEFENDANT_WIN: '法庭判決勝訴',
    DEFENDANT_LOSE: '法庭判決敗訴',
    WIN_MSG: '您已成功洗清罪嫌。',
    LOSE_MSG: '法庭已正式執行裁罰。',
    BREAKDOWN_TITLE: '人才產出細目',
    BETTING_TITLE: '場外押注結算',
    BYSTANDER_PL: '旁觀者盈虧',
    NO_BETS: '本場無人進行押注',
  },
};
