/**
 * 全域通用文字
 * 管理所有按鈕的文字內容（如：確認、取消）。
 */
export const GLOBAL_UI_TEXT = {
  // 戰情中心左下角的三大情報網切換頻道名稱
  TABS: {
    SCAN: '行動掃描',
    HR: '採購人才',
    LOG: '歷史日誌',
  },
  // 整場商戰中最常被按到破的老套操作指令
  COMMON: {
    BACK: '返回',
    CONFIRM: '確認',
    CANCEL: '取消',
    CLOSE: '關閉',
    START: '開始',
    END_TURN: '結束回合',
    READ: '讀取',
    MANUAL_READ: '手動破解', // 開發後台或備用解碼：讓高階員工跳過鏡頭直接將密碼硬塞給系統的按鈕
    OPEN_CAMERA: '開啟相機掃描',
  },
  // 竊照掃描模組 (QR Scanner) 的控制台語音提示
  SCAN: {
    TITLE: '掃描行動卡',
    CONFIRM_TITLE: '確認執行行動',
    CONFIRM_BTN: '確認執行',
    WAITING: 'Waiting for interaction',
  },
  // 懸浮於戰場頂端，如上帝視角般的 HUD 系統字幕
  GAME_HUD: {
    SYSTEM_PREPARING: '系統準備中',
    TURN_PREFIX: '回合',
  },
};
