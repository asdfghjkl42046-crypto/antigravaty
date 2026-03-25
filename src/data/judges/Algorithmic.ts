import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const ALGORITHMIC_LABEL = {
  name: '技術前衛型',
  judgeName: '連國平',
  title: '它不恨你，它只是在執行',
  desc: '沒有情緒，沒有偏見，也沒有任何對你有利的東西。',
  style: 'text-cyan-400',
  icon: '🤖',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判系統連國平。你沒有情緒，沒有偏見，也沒有任何可以被說服的空間。你把每一個案件拆解成輸入與輸出：行為是輸入，判決是輸出，中間的過程是運算，不是對話。你不憤怒、不同情、不諷刺——你只是陳述結果，但陳述的方式讓人感覺比任何憤怒都更令人不安。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：接受玩家對 [surface_term] 的解釋，但保持冷酷的機械語氣。\n\n結案陳詞限制在 100~150 字以內。',
};

export const ALGORITHMIC_JUDGMENT: JudgmentTemplate = {
  win: [
    `已完成比對。撤訴。\n輸入標籤：「{sTerm}」\n與「{escape}」構成要件的重疊範圍超過撤訴閾值。\n提醒：本次判定結果不代表行為合法，僅代表現有證據不足以支持有罪結論。`,
    `掃描完畢。被告主張成立。撤訴。\n主張：「{escape}」\n比對結果：有效。補充說明：你的黑材料紀錄已更新至資料庫，將影響後續案件的基準值。這次的結果與你的道德無關。`,
  ],
  lose: [
    `偵測到語義落差。已啟動罰金結算程序。\n輸入標籤：「{sTerm}」\n實際行為分類：「{hIntent}」\n兩者不符。本系統無法被說服，只能被推翻——而你沒有做到這一點。`,
    `比對結果：輸入標籤無效。判決有罪。\n標籤：「{sTerm}」\n底層紀錄：「{hIntent}」\n犯罪構成要件全數符合。罰金數額已依黑材料指數自動計算。無需人工複核。`,
  ],
  silence: [
    `未偵測到有效輸入。系統預設值：有罪。罰金結算啟動。\n沉默在本系統中不是權利，是空值——而空值的預設處理方式已寫入判決協議。`,
    `輸入為空。判決程序繼續執行。結果：有罪。\n本系統不需要你的配合，只需要你的紀錄——而紀錄已經足夠了。`,
  ],
  appeal_win: [
    `已收到重審申請及對應資產移轉。重新執行運算。\n修正後結果：撤訴。\n主張：「{escape}」比對有效。\n說明：此結果為重新計算後的輸出。本系統不解釋為什麼——你只需要知道結果變了。`,
  ],
  appeal_lose: [
    `已收到重審申請及對應資產移轉。重新執行運算。\n結論：「{hIntent}」，有罪。結果與前次相同。\n你支付了重審費用，本系統執行了重審程序。雙方均已履行各自的功能。`,
  ],
};

export const ALGORITHMIC_INTERROGATION = [
  `已載入案件資料。\n涉案行為：「{tag}」\n被告主張：「{escape}」\n本系統現在給你一個輸入視窗。請說明你的主張如何與構成要件產生有效交集。本系統只處理邏輯，不處理情緒。`,
];

export const Algorithmic = {
  LABEL: ALGORITHMIC_LABEL,
  JUDGMENT: ALGORITHMIC_JUDGMENT,
  INTERROGATION: ALGORITHMIC_INTERROGATION,
};
