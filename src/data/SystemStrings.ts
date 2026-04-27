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

  // --- 全域通用文字 (原 GlobalUI.ts) ---
  GLOBAL: {
    TABS: {
      SCAN: '行動掃描',
      HR: '採購人才',
      LOG: '歷史日誌',
    },
    COMMON: {
      BACK: '返回',
      CONFIRM: '確認',
      CANCEL: '取消',
      CLOSE: '關閉',
      START: '開始',
      END_TURN: '結束回合',
      READ: '讀取',
      MANUAL_READ: '手動破解',
      OPEN_CAMERA: '開啟相機掃描',
    },
    SCAN: {
      TITLE: '掃描行動卡',
      CONFIRM_TITLE: '確認執行行動',
      CONFIRM_BTN: '確認執行',
      WAITING: 'Waiting for interaction',
    },
    GAME_HUD: {
      SYSTEM_PREPARING: '系統準備中',
      TURN_PREFIX: '回合',
    },
  },

  // --- 法庭攻防文字 (原 CourtData.ts) ---
  COURT: {
    COURT_NAME: 'Antigravity 最高法院',
    JUDGE_PREFIX: '主審：',
    JUDGE_TITLE: '主審法官',
    DEFENDANT_LABEL: '被告人',
    SYSTEM_LOCK: {
      TITLE: 'System Lock: 裝置交接中',
      SUBTITLE: '我準備好了，解鎖發言',
    },
    STAGES: {
      1: '階段 1：開庭敘事',
      2: '階段 2：旁觀者干預',
      3: '階段 3：旁聽押注',
      4: '階段 4：法官質詢與答辯',
      5: '階段 5：技能觸發確認',
      6: '階段 6：最終判決',
      DEFAULT: '法庭程序進行中',
    } as Record<number | string, string>,
    PHASE_1: {
      CHARGE_LABEL: '行為指控：',
      AI_TITLE: '【AI 最高法院提審】',
      NON_AI_TITLE: '【最高法院查緝部提審】',
      SUSPECT: (tag: string) => `被告企業涉嫌 "${tag}" 之情事...`,
      CONTINUE_BTN: '了解指控內容，進入干預階段',
    },
    PHASE_2: {
      SUBMITTED: '已提交',
      SELECTED: '干預內容已選取',
      WAITING: '尚未選擇',
      AI_PLACEHOLDER: '輸入文字干預法官判斷...',
      AI_INPUTTED: '已輸入文字',
      CONFIRM_BTN: '確認所有干預內容並進入押注 (Confirm All & Enter Betting)',
    },
    PHASE_3: {
      BET_WIN: '押勝訴',
      BET_LOSE: '押敗訴',
      BET_SKIP: '放棄押注',
      FINAL_CHOICE: '最終選定：',
      WIN: '勝訴',
      LOSE: '敗訴',
      SKIP: '放棄',
      CONFIRM_BTN: '確認所有押注項目，進入質詢答辯',
    },
    PHASE_4: {
      QUESTION_TITLE: '法官質詢',
      DEFENSE_OPTIONS: [
        '選取 [J] 辯護策略 ($0% 加成)',
        '選取 [K] 辯護策略 (+5% 加成)',
        '選取 [L] 辯護策略 (+10% 加成)',
      ],
      SUPPLEMENTARY_LABEL: '補充陳述 (選填)',
      SUPPLEMENTARY_PLACEHOLDER: '請輸入您的辯護詞...',
      SUBMIT_BTN: '提交答辯',
    },
    PHASE_5: {
      TITLE: '王牌律師發動',
      SUB: 'ACE ATTORNEY LV3 — WITHDRAW CASE',
      DESC: '你的王牌律師（LV3）已介入本案，提出撤告申請：',
      FEE_LABEL: '撤告費用 (總資金 20%，最低 100 萬)',
      IP_LABEL: '人脈 (IP)',
      WITHDRAW_DESC: '支付上述費用後，將撤銷本次起訴，相關黑材料歸零，案件不成立。',
      GIVE_UP_BTN: '放棄，接受判決',
      EXECUTE_BTN: '執行撤告',
    },
    PHASE_6: {
      GUILTY: '有罪判決',
      NOT_GUILTY: '無罪撤告',
      GUILTY_DESC: (tag: string, escape: string) =>
        `【有罪判決】被告之答辯內容未能推翻「${tag}」之犯罪構成。即便其辯稱為「${escape}」，仍難掩其規避監管之實質惡意。本庭依此裁定公訴成立。`,
      NOT_GUILTY_DESC: (tag: string, escape: string, term: string) =>
        `【無罪裁定】本庭採信被告關於「${escape}」之抗辯。判定其執行「${term}」時並無主觀惡意，其行為符合商業慣例與法律阻卻事由，宣告對其「${tag}」行為之起訴不予成立。`,
      ACCEPT_BTN: '接受判決',
      EXTRA_APPEAL_BTN: (cost: number) => `法庭終審救濟 (花費 ${cost} 萬 G)`,
      FINE: '罰金',
      RP_LOSS: '名聲損失',
    },
  }
};

// 最終兼容性出口
export const SystemStrings = SYSTEM_STRINGS;
export const GLOBAL_UI_TEXT = SYSTEM_STRINGS.GLOBAL;
export const COURT_TEXT = SYSTEM_STRINGS.COURT;
