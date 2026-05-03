/**
 * 【系統訊息與對話文案】
 * --------------------------------------------------
 * 對應功能：彈窗通知、掃描結果、升級提示、法庭公告。
 */
export const SYSTEM_MESSAGES = {
  // --- 掃描與輸入相關 ---
  READY: '系統就緒。請掃描 QR Code 以進行行動。',
  INVALID_PLAYER: '無效玩家',
  // 參數：卡片ID, 選項序號
  SCAN_SUCCESS: (cardId: string, optIdx: number) =>
    `掃描成功：偵測到 ${cardId} 選項 ${optIdx}。請確認操作。`,
  INVALID_CARD: (raw: string) => `⚠ 無效的卡片資訊：查無代碼 "${raw}"。`,
  INVALID_CARD_ID: (cardId: string) => `⚠ 無效的卡片資訊：查無卡片 "${cardId}"。`,
  INVALID_OPTION: (optIdx: number) => `⚠ 無效的卡片資訊：選項 ${optIdx} 不存在。`,
  INVALID_CODE: '⚠ 無效的卡片代碼。',
  CANCEL_ACTION: '已取消操作。',

  // --- 狀態阻擋提示 ---
  INSUFFICIENT_AP: '🚫 體力不足：\n您的 AP 已歸零，請結束回合。',
  BANKRUPT_BLOCK: '🚫 行動終止：\n您的企業已宣告破產。',
  SECURE_CONTEXT_REQUIRED: '🚨 安全性限制：\n瀏覽器禁止在非加密連線 (HTTP) 下開啟相機。',
  CAMERA_START_FAIL: '啟動失敗：\n請檢查權限設定。',

  // --- 升級與獎勵 ---
  UPGRADE_SUCCESS: (role: string, lv: number) => `成功升級 ${role} 至 LV${lv}！`,
  REWARD_OBTAINED: '獲得開局加成！',
  REWARD_CONFIRM: '收下好意',

  /**
   * 【相機控制訊息】
   * 出現在 ScanScreen 或 Lobby 掃描介面。
   */
  CAMERA: {
    STARTING: '正在啟動相機...',
    PERMISSION_DENIED: '相機權限被拒絕。請在瀏覽器設定中允許相機存取。',
    NOT_FOUND: '找不到可用的相機裝置。',
    START_FAILED: (msg: string) => `相機啟動失敗：${msg}`,
    CLOSE: '✕ 關閉相機',
    INITIALIZING: '啟動中...',
  },

  /**
   * 【人才升級對話】
   * 出現在商店 (StoreScreen) 點擊升級時。
   */
  ROLE: {
    MAX_LEVEL: (role: string) => `${role} 已達最高等級 LV3。`,
    UPGRADE_REQUIREMENT: (ip: number, g: number) => `需要 ${ip} IP + ${g} 萬 G 才能升級。`,
    UPGRADE_SUCCESS_DETAIL: (role: string, lv: number, ip: number, g: number) =>
      `成功升級 ${role} 至 LV${lv}！已扣除 ${ip} IP + ${g} 萬 G。`,
  },

  /**
   * 【行動執行反饋】
   * 出現在行動執行彈窗的標題或標記。
   */
  ACTION: {
    DECLARATION_LABEL: '安全申報',
    SKIP_DECLARATION_LABEL: '已略過申報',
    SUCCESS_PREFIX: '【成功】',
    DEFAULT_SUCCESS_LABEL: '計畫執行成功',
  },

  /**
   * 【結算畫面文字】
   * 對應 ResolutionOverlay.tsx，回合結束或行動結束後的報告。
   */
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
    BYSTANDER_PL: '旁觀者盈虧',
    BETTING_TITLE: '場外押注結算',
    NO_BETS: '本場無人進行押注',
  },

  // 聲望警告
  RP_WARNING: '警告：企業聲譽瀕危！若降至 20 將遭強制淘汰！',
};
