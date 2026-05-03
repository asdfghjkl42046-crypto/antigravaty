/**
 * 系統通知與警告訊息 (對齊舊代碼 Key 名稱)
 */
export const SYSTEM_MESSAGES = {
  READY: '請掃描 QR Code 以進行行動。',
  INVALID_PLAYER: '系統異常：無法識別業主特徵 (錯誤：用戶會話失效)',
  SCAN_SUCCESS: (cardId: string, optIdx: number) =>
    `掃描成功：偵測到 ${cardId} 選項 ${optIdx}。請確認操作。`,
  INVALID_CARD: (raw: string) => `⚠ 無效的卡片資訊：查無代碼 "${raw}"。`,
  INVALID_CARD_ID: (cardId: string) => `⚠ 無效的卡片資訊：查無卡片 "${cardId}"。`,
  INVALID_OPTION: (optIdx: number) => `⚠ 無效的卡片資訊：選項 ${optIdx} 不存在。`,
  INVALID_CODE: '⚠ 無效的卡片代碼。',
  NOT_YOUR_TURN: '🚫 行動受阻：\n現在不是您的回合，無法執行此操作。',
  CANCEL_ACTION: '已取消操作。',

  // 對齊舊代碼使用的 Key
  INSUFFICIENT_AP: '🚫 體力不足：\n您的 AP 已歸零，請結束回合。',
  BANKRUPT_BLOCK: '🚫 行動終止：\n您的企業已宣告破產。',
  SECURE_CONTEXT_REQUIRED: '🚨 安全性限制：\n瀏覽器禁止在非加密連線 (http) 下開啟相機。',
  CAMERA_START_FAIL: '啟動失敗：\n請檢查權限設定。',

  UPGRADE_SUCCESS: (role: string, lv: number) => `成功升級 ${role} 至 LV${lv}！`,
  REWARD_OBTAINED: '獲得開局加成！',
  REWARD_CONFIRM: '收下好意',

  CAMERA: {
    STARTING: '正在啟動相機...',
    PERMISSION_DENIED: '相機權限被拒絕。請在瀏覽器設定中允許相機存取。',
    NOT_FOUND: '找不到可用的相機裝置。',
    START_FAILED: (msg: string) => `相機啟動失敗：${msg}`,
    CLOSE: '✕ 關閉相機',
    INITIALIZING: '啟動中...',
  },

  ROLE: {
    MAX_LEVEL: (role: string) => `${role} 已達最高等級 LV3。`,
    UPGRADE_REQUIREMENT: (ip: number, g: number) => `需要 ${ip} IP + ${g} 萬 G 才能升級。`,
    UPGRADE_SUCCESS_DETAIL: (role: string, lv: number, ip: number, g: number) =>
      `成功升級 ${role} 至 LV${lv}！已扣除 ${ip} IP + ${g} 萬 G。`,
  },

  ACTION: {
    DECLARATION_LABEL: '安全申報',
    SKIP_DECLARATION_LABEL: '已略過申報',
    SUCCESS_PREFIX: '【成功】',
    DEFAULT_SUCCESS_LABEL: '計畫執行成功',
  },

  RESOLUTION: {
    SUCCESS_TITLE: '計畫執行成功',
    FAILURE_TITLE: '計畫受阻',
    PASSIVE_TITLE: '回合結算報表',
    PASSIVE_MSG: '您的優秀員工已完成自動化作業。',
    DEFENDANT_WIN: '法庭判決勝訴',
    DEFENDANT_LOSE: '法庭判決敗訴',
    WIN_MSG: '您已成功洗清罪嫌。',
    LOSE_MSG: '法庭已正式執行裁罰。',
    BREAKDOWN_TITLE: '優秀員工產出狀況',
    BYSTANDER_PL: '盈虧',
    BETTING_TITLE: '場外押注結算',
    NO_BETS: '本場無人進行押注',
  },

  RP_WARNING: '警告：企業聲譽瀕危！若降至 20 將遭強制淘汰！',
};
