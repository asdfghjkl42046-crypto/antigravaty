/**
 * [宣判專用指南] 洗錢法庭攻防用語大全 (Courtroom Trial Narrative & UI)
 * 高度集中所有庭制上的威脅文字、開庭警告訊息、以及各階段用來定罪的專屬名詞，當總裁站上法庭，這些字眼就會化作鍘刀。
 */
export const COURT_TEXT = {
  COURT_NAME: 'Antigravity 最高法院',
  JUDGE_PREFIX: '主審：',
  JUDGE_TITLE: '主審法官',
  DEFENDANT_LABEL: '被告人',
  // 強制防偷窺系統 (System Lock)：當輪到你被提審時蒙蔽其他玩家視線的護城河
  SYSTEM_LOCK: {
    TITLE: 'System Lock: 裝置交接中',
    SUBTITLE: '我準備好了，解鎖發言',
  },
  // 法庭煉獄七步曲：從被指控到終審判決，一步步剝奪總裁最後尊嚴的法定流程
  STAGES: {
    1: '階段 1：開庭敘事',
    2: '階段 2：旁觀者干預',
    3: '階段 3：旁聽押注',
    4: '階段 4：法官質詢與答辯',
    5: '階段 5：技能觸發確認',
    6: '階段 6：最終判決',
    DEFAULT: '法庭程序進行中',
  },
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
  // 生死狡辯的十字路口：你是要拿「合法理由」來當擋箭牌，還是要硬頸不認罪，質疑檢察官「貼錯標籤」？
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
    FEE_LABEL: '撤告費用 (總資金 20%，最低 100 萬)', // 極度貪婪的王牌律師要價：就算花上兩成身家，也至少會榨出一百萬打點費
    IP_LABEL: '人脈 (IP)',
    WITHDRAW_DESC: '支付上述費用後，將撤銷本次起訴，相關黑材料歸零，案件不成立。',
    GIVE_UP_BTN: '放棄，接受判決',
    EXECUTE_BTN: '執行撤告',
  },
  PHASE_6: {
    GUILTY: '有罪判決',
    NOT_GUILTY: '無罪撤告',
    // 死灰復燃或蓋棺定論的公版判決書 (不連 AI 體驗版時專用的罐頭法槌)
    GUILTY_DESC: (tag: string, escape: string) =>
      `【有罪判決】被告之答辯內容未能推翻「${tag}」之犯罪構成。即便其辯稱為「${escape}」，仍難掩其規避監管之實質惡意。本庭依此裁定公訴成立。`,
    NOT_GUILTY_DESC: (tag: string, escape: string, term: string) =>
      `【無罪裁定】本庭採信被告關於「${escape}」之抗辯。判定其執行「${term}」時並無主觀惡意，其行為符合商業慣例與法律阻卻事由，宣告對其「${tag}」行為之起訴不予成立。`,
    ACCEPT_BTN: '接受判決',
    // 終極保命符 / 最高法院黑暗交易：用極度誇張的 20% 企業總資產，硬是買下非常上訴的豁免權！
    EXTRA_APPEAL_BTN: (cost: number) => `法庭終審救濟 (花費 ${cost} 萬 G)`,
    FINE: '罰金',
    RP_LOSS: '名聲損失',
  },
};
