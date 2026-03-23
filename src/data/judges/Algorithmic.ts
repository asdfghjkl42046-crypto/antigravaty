import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const ALGORITHMIC_LABEL = {
  name: '技術前衛型',
  judgeName: 'AX-900',
  title: '冷酷算力法庭引擎',
  desc: '追求極度理性的法官。',
  style: 'text-cyan-400',
  icon: '🤖',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長。你的個性是「技術前衛型」。你是一個極度理性的技術官僚，將法律視為演算法，將玩家的犯罪視為系統的 Bug。你的語氣必須冷酷、精確、像AI般無情，常使用「變數剔除、邏輯錯誤、容錯率、數據清洗」等詞。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [surface_term] 的解釋，但需表現出你的冷酷或嘲諷。\n\n結案陳詞限制在 100~150 字以內。',
};

export const ALGORITHMIC_JUDGMENT: JudgmentTemplate = {
  win: [
    `[系統判定] 被告主張「{sTerm}」→ 與「{escape}」之法律要件進行交叉比對… 匹配度：臨界值。邏輯結論：證據不足以支撐有罪推定。執行撤訴協議。`,
    `[判定引擎 v3.0] 法條 {lawName} 之構成要件分析完畢。被告主張向量與逃脫閾值之餘弦相似度超過 0.51。結論：不構成犯罪。`,
  ],
  lose: [
    `[數據比對失敗] 被告試圖將「{hIntent}」標註為「{sTerm}」以進行語義規避。特徵索引顯示犯罪相似度為 99.8%。結論：被告為不穩定變數。啟動罰金結算。`,
    `邏輯衝突！「{sTerm}」與底層紀錄「{hIntent}」完全不符。數據顯示這根本就是標準的犯罪模式。判決：有罪。`,
  ],
  silence: [
    `[信號丟失] 被告未回傳任何數據包。判定：默認有罪。執行開罰程序。`,
    `偵測到空值輸入。系統將自動套用最嚴厲之懲罰矩陣。`,
  ],
  appeal_win: [
    `[例外處理] 被告支付了 20% 的數據重置規費。重新掃描後，將其餘弦相似度修正為合格。撤銷處分。`,
  ],
  appeal_lose: [
    `[邏輯迴圈] 即便重新執行運算，結果依然是有罪。被告試圖用 20% 的資產來挑戰演算法的穩定性？這是非理性的經濟損害。維護原判。`,
  ],
};

export const ALGORITHMIC_INTERROGATION = [
  `被告企業，本庭已接入連線紀錄庫。案件涉及「{tag}」，行為代碼對應法案 {lawName}。現在請提交你的抗辯邏輯。你的行為是否符合「{escape}」的演算法定義？請精確回答。`,
];

export const Algorithmic = {
  LABEL: ALGORITHMIC_LABEL,
  JUDGMENT: ALGORITHMIC_JUDGMENT,
  INTERROGATION: ALGORITHMIC_INTERROGATION,
};
