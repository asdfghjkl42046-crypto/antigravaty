import { PLAYER_UI_STRINGS } from './ui/PlayerStrings';
import { ROLE_STRINGS } from './ui/RoleStrings';
import { SYSTEM_MESSAGES } from './ui/MessageStrings';

/**
 * 系統全域文案定義 (System Strings)
 * 策劃者請注意：此檔案為 SSOT，向下相容舊代碼結構。
 */
export const SYSTEM_STRINGS = {
  // --- 分類模組 ---
  PLAYER: PLAYER_UI_STRINGS,
  ROLES: ROLE_STRINGS,
  MESSAGES: SYSTEM_MESSAGES,

  // --- 扁平化結構 (向下相容組件大量使用的路徑) ---
  UI_LABELS: {
    MONEY: '資金',
    TRUST_FUND: '海外信託',
    IP: 'IP 人脈',
    RP: 'RP 名聲',
    AP: 'AP 行動點數',
    BM: '犯罪證據',
    CONVICTION: '前科',
    LEVEL: '等級',
    STATUS_BANKRUPT: '已破產',
    STATUS_ACTIVE: '運作中',
    CONFIRM: '確認執行',
    CANCEL: '取消返回',
    BACK: '返回',
    CLOSE: '關閉',
    PAYMENT_TITLE: '支付結算',
    PAYMENT_SOURCE: '選擇支付來源',
    CASH_PAY: '現金支付',
    TRUST_PAY: '信託支付',
    CONFIRM_HIRE: '確認扣款並簽約',
    END_TURN: '結束回合',
    // 補強分頁文字
    TABS: {
      SCAN: '行動掃描',
      HR: '採購人才',
      LOG: '歷史日誌',
    },
    // 補強掃描標題
    SCAN_TITLE: '掃描行動卡',
    MANUAL_READ: '手動破解',
    OPEN_CAMERA: '開啟相機掃描',
  },


  UNITS: {
    MONEY: '萬',
    IP: ' IP',
    RP: ' RP',
    BM: ' 件',
    LEVEL: ' 級',
  },

  // 快捷訪問
  ERRORS: SYSTEM_MESSAGES,
  ACTION: SYSTEM_MESSAGES.ACTION,
  RESOLUTION: SYSTEM_MESSAGES.RESOLUTION,
  STORE: {
    ...ROLE_STRINGS.HR_UI,
    HR_DOSSIER: '機密任命檔案',
    ID_LABEL: '識別編號',
    STAGES: '階段',
    CANCEL: '取消',
    CONFIRM_HIRE_PROMPT: '確認能力並準備簽約',
    INSUFFICIENT_FUNDS: '資金或人脈不足',
    CONTRACT_ACTIVE: '合約已生效',
  },

  DECORATION: {
    SCAN_ID: '掃描編號',
    CONFIDENTIAL_DOC: '機密文件',
    CONFIDENTIAL_ADVANTAGE: '內部優勢文件',
    NEXT_PAGE: '下一頁',
    ACKNOWLEDGE: '確認',
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
    DASHBOARD_TITLE: '創業冒險',
  },

  SCAN: {
    CAMERA_PROMPT: '點擊按鈕啟動光學掃描器',
    START_CAMERA: '啟動相機',
    INPUT_PLACEHOLDER: '例如: A011',
    MANUAL_INPUT_LABEL: '備援編碼輸入',
    END_TURN_PROMPT: (current: string, next: string) => `${current} 結束回合，換 ${next}`,
    DECODE_SYNC: '解析並同步卡片',
    NO_RECORDS: '檔案庫無任何犯罪紀錄',
  },

  START_PATH: {
    TITLE: '選擇你的創業開局',
    NAMES: {
      normal: '白手起家',
      backdoor: '融資創業',
      blackbox: '家族企業',
    } as Record<string, string>,
    getLabels: (cards: any) => ({
      normal: cards.START_PATHS[1].description.split('\n\n') || [],
      backdoor: cards.START_PATHS[2].description.split('\n\n') || [],
      blackbox: cards.START_PATHS[3].description.split('\n\n') || [],
    }),
  },

  // 開局設定
  SETUP: {
    NORMAL_BONUS_MSG: (name: string) => `恭喜！${name} 總裁選擇了「白手起家」，獲得減少懲罰（-5% 罰金）的開局獎勵！`,
    BRIBE_BONUS_MSG: (name: string, judge: string, itemName: string) => `恭喜！${name} 總裁準備的 ${itemName} 深受 ${judge} 喜愛，獲得減少懲罰（-20% 罰金）的開局獎勵！`,
    DEFAULT_BRIBE_NAME: '禮物',
    START_PATH_NAMES: {
      normal: '白手起家',
      backdoor: '融資創業',
      blackbox: '家族企業',
    } as Record<string, string>,
    MODE_SELECT: {
      WEBSITE_DESC: '使用固定戲劇性文案模板\n無需等待 AI 生成',
      AI_DESC: '由 LLM 生成無限變化的判決\n支援自由文字陳述',
    }
  },
};


// 最終兼容性出口
export const SystemStrings = SYSTEM_STRINGS;
