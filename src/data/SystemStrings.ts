import { ROLE_STRINGS } from './ui/RoleStrings';
import { SYSTEM_MESSAGES } from './ui/MessageStrings';

/**
 * 核心文案數據中心 (SystemStrings SSOT)
 * --------------------------------------------------
 * 這裡是整個遊戲所有 UI 文字的唯一來源。
 * 調整文案前請參考各區塊的中文註解，以了解其在頁面上的具體位置。
 */
export const SYSTEM_STRINGS = {
  // --- 基礎數據掛載 ---
  PLAYER: {} as any, // 玩家相關動態文案 (由 PlayerStrings.ts 提供)
  ROLES: ROLE_STRINGS, // 人才/職業相關描述
  MESSAGES: SYSTEM_MESSAGES, // 系統通知與警告訊息

  /**
   * 【全局通用標籤】
   * 用於全遊戲各處的基礎按鈕、數值單位與狀態顯示。
   */
  UI_LABELS: {
    MONEY: '資金',
    TRUST_FUND: '海外信託',
    IP: 'IP', // 人脈點數 (Influence Points)
    RP: 'RP', // 聲望點數 (Reputation Points)
    AP: 'AP', // 行動力 (Action Points)
    BM: 'BM', // 黑材料 (Black Material)
    CONVICTION: '前科',
    LEVEL: '等級',
    STATUS_BANKRUPT: '已破產',
    STATUS_ACTIVE: '運作中',
    CONFIRM: '確認執行',
    CANCEL: '取消返回',
    BACK: '返回',
    CLOSE: '關閉',
    PAYMENT_TITLE: '支付結算', // 支付彈窗的標題
    PAYMENT_SOURCE: '選擇支付來源',
    CASH_PAY: '現金支付',
    TRUST_PAY: '信託支付',
    CONFIRM_HIRE: '確認扣款並簽約', // 人才市場簽約按鈕
    END_TURN: '結束回合',
    TABS: {
      SCAN: '行動掃描',
      HR: '採購人才',
      LOG: '歷史日誌',
    },
    SCAN_TITLE: '掃描行動卡',
    MANUAL_READ: '手動破解',
    OPEN_CAMERA: '開啟相機掃描',
  },

  /**
   * 【數值單位】
   * 渲染數值時自動附加的後綴。
   */
  get UNITS() {
    return {
      MONEY: '萬',
      IP: ` ${this.UI_LABELS.IP}`,
      RP: ` ${this.UI_LABELS.RP}`,
      BM: ' 件',
      LEVEL: ' 級',
    };
  },

  /**
   * 【行動執行反饋】
   * 當玩家掃描並執行行動卡後的結果顯示。
   */
  ACTION: {
    DECLARATION_LABEL: '安全申報',
    SKIP_DECLARATION_LABEL: '已略過申報',
    SUCCESS_PREFIX: '【成功】',
    DEFAULT_SUCCESS_LABEL: '計畫執行成功',
    // 參數：業主名, 企業名, 執行摘要
    SUCCESS_MSG: (owner: string, company: string, summary: string) =>
      `因 ${owner} 的選擇，${company}${summary}`,
  },

  /**
   * 【商店與人才市場】
   * 對應 StoreScreen.tsx，處理人才招聘與道具購買。
   */
  get STORE() {
    return {
      ...ROLE_STRINGS.HR_UI,
      HR_DOSSIER: '機密任命檔案', // 商店標題
      ID_LABEL: '識別編號',
      STAGES: '階段',
      CANCEL: '取消',
      CONFIRM_HIRE_PROMPT: '確認能力並準備簽約',
      INSUFFICIENT_FUNDS: '資金或人脈不足',
      CONTRACT_ACTIVE: '合約已生效',
    };
  },

  /**
   * 【錯誤與阻擋訊息】
   * 用於全域 Alert 或阻擋玩家不合規操作的訊息。
   */
  ERRORS: {
    INSUFFICIENT_AP: '🚫 體力不足：\n您的 AP 已歸零，請結束回合。',
    BANKRUPT_BLOCK: '🚫 行動終止：\n您的企業已宣告破產。',
    INVALID_PLAYER: '系統異常：無法識別業主特徵 (錯誤：用戶會話失效)',
    SECURE_CONTEXT_REQUIRED: '此環境不支援加密連線，無法開啟相機',
    CAMERA_START_FAIL: '無法啟動相機，請檢查權限設定',
    INVALID_CODE: '無效的行動編碼或 QR Code',
  },

  /**
   * 【UI 裝飾與細節標籤】
   * 用於增強沉浸感的各式卷宗、檔案編號標籤。
   */
  DECORATION: {
    SCAN_ID: '掃描編號',
    CONFIDENTIAL_DOC: '機密文件',
    CONFIDENTIAL_ADVANTAGE: '內部優勢文件',
    NEXT_PAGE: '下一頁',
    ACKNOWLEDGE: '確認',
    RAP_SHEET: '犯罪紀錄編號', // 前科彈窗
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

  /**
   * 【開局路徑選擇】
   * 對應 ParchmentBook.tsx，玩家剛進遊戲選擇創業背景的 3D 書本。
   */
  START_PATH: {
    TITLE: '選擇你的創業開局',
    NAMES: {
      normal: '白手起家',
      backdoor: '融資創業',
      blackbox: '家族企業',
    } as Record<string, string>,
    // 根據遊戲卡牌數據動態分頁顯示
    getLabels: (cards: any) => {
      const paginate = (text: string, maxChars = 200): string[] => {
        const paragraphs = text
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);
        const pages: string[] = [];
        let current = '';

        for (const para of paragraphs) {
          if (current.length > 0 && current.length + para.length + 1 > maxChars) {
            pages.push(current);
            current = para;
          } else {
            current = current ? current + '\n' + para : para;
          }
        }
        if (current.length > 0) pages.push(current);
        return pages.length > 0 ? pages : [''];
      };

      return {
        normal: paginate(cards.START_PATHS[1].description),
        backdoor: paginate(cards.START_PATHS[2].description),
        blackbox: paginate(cards.START_PATHS[3].description),
      };
    },
  },

  /**
   * 【設備模式選擇頁】
   * 對應 EntryScreen.tsx，遊戲啟動後第一個畫面。
   */
  ENTRY: {
    HEADER_TITLE: '創業冒險',
    SUBTITLE: '選擇設備使用模式',
    SINGLE: {
      TITLE: '單機遊玩',
      SUB: 'Local Multiplayer',
      DESC: '單設備進行遊戲，展開法庭博弈。',
      BTN: '確認選擇',
    },
    MULTI: {
      TITLE: '多機連線',
      SUB: 'Online Multiplayer',
      DESC: '多設備同步，展開法庭博弈。',
      BTN: '確認選擇',
    },
  },

  /**
   * 【玩家註冊頁面】
   * 對應 PlayerRegistrationScreen.tsx，填寫企業名稱、選擇頭像與路徑。
   */
  REGISTRATION: {
    PLAYER_MARK: (idx: number, total: number) => `玩家 ${idx} / ${total}`,
    OWNER_PLACEHOLDER: '請輸入業主姓名',
    CORP_PLACEHOLDER: '請輸入企業名稱',
    DEFAULT_CORP_NAME: '安提格拉維提 財團',
    DEFAULT_OWNER_NAME: 'Arch Architect',
    DEFAULT_CORP: (idx: number) => `企業 ${idx}`,
    DEFAULT_OWNER: (idx: number) => `業主 ${idx}`,
    OPEN_BOOK_BTN: '翻閱卷宗檔案', // 選擇開局路徑後的確認按鈕
    BACK_TO_SELECT: '返回選擇',
    CONFIRM_BTN: '確認',
    LABELS: {
      OWNER: '業主姓名',
      CORP: '企業名稱',
      BRIBE: '初始賄賂資產',
      SELECT_PATH: '選擇開局路徑',
    },
    BRIBE_MODAL: {
      TITLE: '機密賄賂清單',
      VERSION: 'CONFIDENTIAL_REGISTER_V4',
      VALUATION: 'VALUATION: CLASSIFIED',
      START_GAME: '確認開始博弈',
      DESC: '選擇一項資產作為開局賄賂，這將影響特定法官的初步好感度。',
    },
    BRIBES: {
      antique: '傳世古董',
      crypto: '虛擬貨幣',
      art: '名家油畫',
      wine: '特供紅酒',
      intel: '機密情報',
    } as Record<string, string>,
  },

  /**
   * 【遊戲主看板】
   * 對應 DashboardScreen.tsx，遊戲進行中的核心 HUD 介面。
   */
  DASHBOARD: {
    TURN_INFO: (turn: number) => `第 ${String(turn).padStart(2, '0')}/50 輪`,
    CURRENT_JUDGE: '當前法官',
    BONUS_TITLE: '獲得開局加成',
    TAG_RECORD_TITLE: '犯罪前科紀錄',
    TABS: {
      HOME: '企業總部',
      SCAN: '掃描卡片',
      SHOP: '黑市',
    },
    MODAL: {
      WITHDRAW_SETTLEMENT: '強制撤告結算',
      EXTRA_APPEAL: '啟動非常上訴',
    },
  },

  /**
   * 【遊戲結算與勝利頁】
   * 對應 EndingScreen.tsx 與 VictoryScreen.tsx，遊戲結束時的數據統計。
   */
  ENDING: {
    DOSSIER_ID: '案件編號',
    VICTORY_TITLE: '個人創業勝利',
    GUILTY_TITLE: '法庭有罪裁決',
    STATUS_CLEARED: '起訴撤銷',
    STATUS_TERMINATED: '行動終止',
    LABEL_STATUS: '狀態',
    LABEL_CERTIFIED_DOSSIER: '認證卷宗',
    STATS: {
      TOTAL_PROFIT: '總資產結算',
      FINAL_RP: '最終信用',
      TOTAL_FINES: '法治代價累計 (罰金)',
      UNIT_WAN: '萬',
    },
    // 印章標籤
    STAMPS: {
      SAINT: '神格化',
      SAINT_FAKE: '偽善者',
      TYCOON: '絕對支配',
      DRAGONHEAD: '正式核准',
      ARRESTED: '有罪判定',
      BANKRUPT: '全盤否決',
      LIMIT: '時效終止',
    },
    BUTTONS: {
      RESTART: '歸檔並重啟人生',
      CONTINUE: '確認清算並繼續遊戲',
    },
    FOOTER: '反重力數據系統 // 程序已終止 // 繼承人選拔結束',
  },

  /**
   * 【掃描行動介面】
   * 對應 ScanScreen.tsx，處理 QR Code 掃描與手動輸入。
   */
  SCAN: {
    TITLE: '掃描行動編碼',
    GUIDE: '將 QR Code 置於方框中心',
    STARTING: '正在啟動相機...',
    SUCCESS: '掃描成功！',
    ERROR: '無效的行動編碼',
    NO_RECORDS: '查無犯罪紀錄',
    CAMERA_PROMPT: '掃描功能需要使用相機權限，請點擊下方按鈕啟動',
    START_CAMERA: '啟動掃描鏡頭',
    MANUAL_INPUT_LABEL: '手動輸入行動編碼',
    INPUT_PLACEHOLDER: '輸入編碼，例如：LOC-77-1',
    DECODE_SYNC: '解碼並同步數據',
    // 參數：當前玩家, 下一玩家
    END_TURN_PROMPT: (current: string, next: string) => `結束 ${current} 的回合，輪到 ${next}`,
  },

  /**
   * 【行動結算彈窗】
   * 對應 ResolutionOverlay.tsx，顯示行動後的盈虧報告。
   */
  RESOLUTION: {
    ACTION_TITLE: '行動結果結算',
    BET_TITLE: '場外押注結算',
    CONFIRM_BTN: '確認並繼續',
    CONFIRM_SIMPLE: '確認',
    SUCCESS_TITLE: '行動成功',
    FAILURE_TITLE: '行動失敗',
    PASSIVE_TITLE: '回合結算報告', // 回合開始時的自動收支報告
    PASSIVE_MSG: '根據您的資產與地位，本回合產生以下變動',
    DEFENDANT_WIN: '法庭判決：無罪',
    DEFENDANT_LOSE: '法庭判決：有罪',
    WIN_MSG: '恭喜！法官採納了您的辯詞，正義得到伸張（或者錢給到位了）。',
    LOSE_MSG: '判決結果對您不利，請準備好承擔法律後果。',
    BREAKDOWN_TITLE: '人才產出細目',
    BYSTANDER_PL: '旁觀者盈虧',
    NO_BETS: '本場無人進行押注',
    OVERSEAS_TRANSFER: '(轉移海外)',
    BET_RESULT_SUBTITLE: '押注收益清單',
  },

  /**
   * 【PVP 連線大廳】
   * 對應 LobbyScreen.tsx，處理多機連線、創房與掃描進入。
   */
  LOBBY: {
    WAITING_JOIN: '等待其他企業加入...',
    YOUR_ID: '你的識別代碼',
    TITLE: '多機連線大廳',
    CLICK_COPY: '點擊複製',
    START_PVP: '開始連線博弈',
    READY_STATUS: '已就緒',
    WAITING_STATUS: '連線中...',
    CREATE_ROOM: '建立房間',
    JOIN_ROOM: '加入房間',
    CLOSE_ROOM: '關閉房間',
    EXIT_ROOM: '退出房間',
    DESC: '建立全球唯一的加密房間，與好友展開實時數據同步對局。',
    ROOM_OPENED: '加密房間已開啟',
    HOST_WAITING: '等待玩家加入',
    GUEST_WAITING: '加入加密房間',
    GUEST_WAITING_MSG: '等待遊戲開始',
    GUEST_GUIDE: '請掃描房長手機螢幕上的 QR Code',
    CONNECTED: '連線已建立',
    SUCCESS_JOIN: '識別成功',
    CURRENT_PLAYERS: (count: number) => `目前玩家 (${count} / 4)`,
    SELF_MARK: '(自己)',
    OTHER_MARK: '(他人)',
    ERRORS: {
      SUPABASE_MISSING: '系統錯誤：尚未配置 Supabase 環境變數。',
      INSERT_FAIL: '無法建立或加入房間，請檢查網路。',
      ROOM_NOT_FOUND: '加入失敗：找不到該房間密鑰。',
    },
  },

  /**
   * 【最終勝利頁】
   * 遊戲大賽結束後，顯示獲勝者與評分。
   */
  VICTORY: {
    WINNER_TITLE: '🏆 最終勝出者',
    SCORE_LABEL: '統治力評分',
    ASSET_LABEL: '總資產',
    RP_LABEL: '最終聲望',
    BACK_MAIN: '返回主選單',
  },

  /**
   * 【遊戲設定與預加載】
   * 處理開局獎勵通知與參與人數選擇。
   */
  SETUP: {
    NORMAL_BONUS_MSG: (name: string) =>
      `恭喜！${name} 總裁選擇了「白手起家」，獲得（-5% 罰金）開局獎勵！`,
    BRIBE_BONUS_MSG: (name: string, judge: string, itemName: string) =>
      `恭喜！${name} 總裁準備的 ${itemName} 深受 ${judge} 喜愛，獲得（-20% 罰金）開局獎勵！`,
    DEFAULT_BRIBE_NAME: '禮物',
    START_PATH_NAMES: {
      normal: '白手起家',
      backdoor: '融資創業',
      blackbox: '家族企業',
    } as Record<string, string>,
    // 玩家人數選擇頁面
    PLAYER_COUNT: {
      TITLE: '選擇參與人數',
      SUBTITLE: '這是一場關於法律、權力與金錢的較量\n請選擇參與這場博弈的人數。',
      CONFIRM_BTN: '確認人數並開始冒險',
      UNIT_SINGLE: '人',
      UNIT_MULTI: '人',
    },
    // 遊戲運行模式選擇 (Website vs AI)
    MODE_SELECT: {
      TITLE: '創業冒險',
      SUBTITLE: '現代法律篇',
      WEBSITE_TITLE: '網站模式',
      WEBSITE_DESC: '使用固定戲劇性文案模板\n無需等待模型生成',
      AI_TITLE: 'AI 模式',
      AI_DESC: '由 AI 生成無限變化的判決\n支援自由文字陳述',
      START_BTN: '開始遊戲',
    },
  },

  /**
   * 【全域佈局標籤】
   * 用於通用的 HUD、導覽欄與系統準備訊息。
   */
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
    GAME_HUD: {
      SYSTEM_PREPARING: '系統準備中',
      TURN_PREFIX: '回合',
    },
  },

  /**
   * 【法庭互動與判決系統】
   * 對應 CourtroomScreen.tsx 與 IndictmentBook.tsx，遊戲中最核心的法律博弈區。
   */
  COURT: {
    // 法庭階段標題
    STAGES: {
      1: '階段 1：開庭敘事',
      2: '階段 2：旁觀者干預',
      3: '階段 3：旁聽押注',
      4: '階段 4：法官質詢與答辯',
      5: '階段 5：技能觸發確認',
      6: '階段 6：最終判決',
      DEFAULT: '法庭程序進行中',
    } as Record<number | string, string>,
    DOCUMENTS: {
      INDICTMENT: '刑事起訴書',
      VERDICT: '裁決判決書',
      EDU_TITLE: '【法制教育】',
      PUNISH_TITLE: '【裁罰結果】',
    },
    LABELS: {
      INTERVENTION_BY: '旁聽干預: ',
      BETTING_BY: '場外賭局: ',
      DEFENSE_BY: '被告答辯: ',
      WIN_RATE_INFO: '勝訴情報',
      NEED_ACE_LAWYER: '需王牌律師 LV2 洞察',
      SCHEME_PREFIX: '方案 ', // 方案 J, K, L 的前綴
    },
    // 法庭內的交互按鈕
    ACTIONS: {
      SUPPORT: '🛡 支持被告',
      OPPOSE: '⚔ 質疑被告',
      ABSTAIN: '棄權',
      WIN: '勝訴',
      LOSE: '敗訴',
      SKIP: '跳過',
      REVERSE: '逆轉裁判', // 律師發動逆轉
      EXIT: '離開',
      GIVE_UP_REVERSE: '放棄逆轉 / 接受判決',
      EXTRA_APPEAL: '非常上訴 (啟動審判救濟)',
      COUNTDOWN_PREFIX: '自動裁決倒數...',
    },
    ALERTS: {
      // 參數：金額, 人脈消耗
      ACE_SKILL_PROMPT: (g: string, ip: number) =>
        `確定要發動王牌律師技能嗎？\n將支付 ${g} 並消耗 ${ip} 點 IP。`,
      GIVE_UP_PROMPT: '確定要放棄逆轉機會，直接接受法院判決嗎？',
      REVERSE_HINT: '發動逆轉，扭轉乾坤', // 按鈕下方的發光提示
      EXIT_HINT: '按下，離開法庭',
    },
    VERDICT: {
      WIN: '無罪',
      LOSE: '有罪',
    },
    // 階段 1：起訴書內容
    PHASE_1: {
      CHARGE_LABEL: '行為指控：',
      AI_TITLE: '【AI 最高法院提審】',
      NON_AI_TITLE: '【最高法院查緝部提審】',
      SUSPECT: (tag: string) => `被告企業涉嫌 "${tag}" 之情事...`,
      CONTINUE_BTN: '了解指控內容，進入干預階段',
    },
    // 階段 2：旁觀者干預
    PHASE_2: {
      SUBMITTED: '已提交',
      SELECTED: '干預內容已選取',
      WAITING: '尚未選擇',
      AI_PLACEHOLDER: '輸入文字干預法官判斷...',
      AI_INPUTTED: '已輸入文字',
      CONFIRM_BTN: '確認所有干預內容並進入押注',
    },
    // 階段 3：場外押注
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
    // 階段 4：質詢答辯
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
    // 階段 5：律師特別撤告
    PHASE_5: {
      TITLE: '王牌律師發動',
      DESC: '你的王牌律師（LV3）已介入本案，提出撤告申請：',
      FEE_LABEL: '撤告費用 (總資金 20%，最低 100 萬)',
      IP_LABEL: '人脈 (IP)',
      WITHDRAW_DESC: '支付上述費用後，將撤銷本次起訴，相關黑材料歸零，案件不成立。',
      GIVE_UP_BTN: '放棄，接受判決',
      EXECUTE_BTN: '執行撤告',
    },
    // 階段 6：判決結果呈現 (動態判決書)
    PHASE_6: {
      GUILTY: '有罪判決',
      NOT_GUILTY: '無罪撤告',
      // 有罪敘事模板：參數（罪名, 被告辯詞）
      GUILTY_DESC: (tag: string, escape: string) =>
        `【有罪判決】被告之答辯內容未能推翻「${tag}」之犯罪構成。即便其辯稱為「${escape}」，仍難掩其規避監管之實質惡意。本庭依此裁定公訴成立。`,
      // 無罪敘事模板：參數（罪名, 被告辯詞, 法律術語）
      NOT_GUILTY_DESC: (tag: string, escape: string, term: string) =>
        `【無罪裁定】本庭採信被告關於「${escape}」之抗辯。判定其執行「${term}」時並無主觀惡意，其行為符合商業慣例與法律阻卻事由，宣告對其「${tag}」行為之起訴不予成立。`,
      ACCEPT_BTN: '接受判決',
      EXTRA_APPEAL_BTN: (cost: number) => `法庭終審救濟 (花費 ${cost} 萬 G)`,
      FINE: '罰金',
      RP_LOSS: '名聲損失',
    },
  },

  /**
   * 等待畫面文案
   */
  LOADING: {
    DEFAULT: '系統數據加載中',
    TIPS: [
      '正在封存案卷...',
      '掃描非法資產...',
      '校準法官人格...',
      '加密通訊連線...',
      '同步雲端資料...',
      '準備法庭判決...',
    ],
    COURT_TIPS: [
      '正在掃描違規代碼...',
      '準備公訴證言...',
      '法官人格已加載...',
      '正在計算勝訴率...',
      '律師函件發送中...',
      '法庭現場封鎖中...',
    ],
    DEFENSE_TIPS: [
      '正在檢索判例資料庫...',
      '分析公訴方邏輯漏洞...',
      '選定最佳辯護策略...',
      '準備被告陳述草案...',
      '法律術語自動轉譯中...',
      '同步辯方證據文件...',
    ],
  },

  /**
   * 【商店額外規則】
   * 處理信用過低等特殊情境。
   */
  STORE_EXTRA: {
    RP_TOO_LOW: '🚨 安全警告：您的名聲 (RP) 過低，黑市人才拒絕與您接洽。',
  },

  /**
   * 【UI 校準工具】
   * 對應 AlignmentTool.tsx，開發者專用的佈局微調工具。
   */
  ALIGNMENT: {
    TITLE: 'UI 校準工具',
    GUIDE: '拖動滑桿調整元素位移',
    SAVE: '儲存配置',
    RESET: '重置預設',
    EXPORT: '匯出佈局 JSON',
    HIDE: '隱藏代碼',
    LABEL_HINT: '文字內容 (LABEL)',
    INPUT_PLACEHOLDER: '輸入新文字...',
    UNDO_HINT: 'Ctrl+Z: 撤銷 • Backspace: 刪除元件',
    RESIZE_HINT: 'Alt+方向鍵: 微調大小',
  },
};

// ----------------------------------------------------------------------
// 底部導出與掛載
// ----------------------------------------------------------------------

import { PLAYER_UI_STRINGS } from './ui/PlayerStrings';
SYSTEM_STRINGS.PLAYER = PLAYER_UI_STRINGS;

export const SystemStrings = SYSTEM_STRINGS;
export const GLOBAL_UI_TEXT = SYSTEM_STRINGS.GLOBAL;
export const COURT_TEXT = SYSTEM_STRINGS.COURT;
export const PLAYER_UI_TEXT = SYSTEM_STRINGS.PLAYER;
