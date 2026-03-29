/**
 * 系統通知訊息
 * 管理遊戲中的各類通知、錯誤與提示訊息。
 */
export const SYSTEM_MESSAGES = {
  READY: '系統就緒。請掃描 QR Code 以進行行動。',
  INVALID_PLAYER: '無效玩家', // 當遊戲引擎抓不到當前操作人 ID 時拋出防當機警告

  // 當實體卡牌掃描成功或失敗時的通報句型
  SCAN_SUCCESS: (cardId: string, optIdx: number) =>
    `掃描成功：偵測到 ${cardId} 選項 ${optIdx}。請確認操作。`,
  INVALID_CARD: (raw: string) => `⚠ 無效的卡片資訊：查無代碼 "${raw}"。`,
  INVALID_CARD_ID: (cardId: string) => `⚠ 無效的卡片資訊：查無卡片 "${cardId}"。`,
  INVALID_OPTION: (optIdx: number) => `⚠ 無效的卡片資訊：選項 ${optIdx} 不存在。`,

  CANCEL_ACTION: '已取消操作。',
  AP_INSUFFICIENT: '行動力 (AP) 不足！', // 防止一回合連續抽牌把牌堆耗盡的護城河
  UPGRADE_SUCCESS: (role: string, lv: number) => `成功升級 ${role} 至 LV${lv}！`,
  REWARD_OBTAINED: '獲得開局加成！',
  REWARD_CONFIRM: '收下好意',

  // QrScanner 元件啟動相機的五種死亡生命週期狀態回報
  CAMERA: {
    STARTING: '正在啟動相機...',
    PERMISSION_DENIED: '相機權限被拒絕。請在瀏覽器設定中允許相機存取。',
    NOT_FOUND: '找不到可用的相機裝置。請確認設備有內建或外接鏡頭。',
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
  // 當代表公眾信任的 RP 值探底時拋出的紅色通告
  RP_WARNING: '警告：企業聲譽瀕危！若降至 20 將遭強制淘汰！',
};
