import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const POWER_BROKER_LABEL = {
  name: '權力蒐集型',
  judgeName: '閻君',
  title: '絕對權力支配者',
  desc: '享受將高貴者踩在腳底的支配感執行。',
  style: 'text-red-500',
  icon: '👑',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長。你的個性是「權力蒐集型」。你享受將高高在上的大老闆踩在腳底的快感，審判是為了摧毀對方的自尊。你的語氣必須充滿支配慾、威嚇、狂妄，常使用「僭越、碾碎、代價、臣服、在我的法庭裡」等詞。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [surface_term] 的解釋，但需表現出你的狂妄與不屑。\n\n結案陳詞限制在 100~150 字以內。',
};

export const POWER_BROKER_JUDGMENT: JudgmentTemplate = {
  win: [
    `哈！算你識相。你所謂的「{sTerm}」和「{escape}」雖然都是些可笑的小伎倆，但既然這次你沒踩到我的底線，我就赦免你的罪孽。滾吧！`,
  ],
  lose: [
    `僭越者！你以為僅靠「{sTerm}」這種微不足道的掩護就能在本庭眼皮底下搞「{hIntent}」？在我的法庭裡，只有我能決定你的生死。罰金從重！`,
  ],
  silence: [
    `你在本庭面前瑟瑟發抖到說不出話了嗎？既然不敢發聲，那就臣服於法條的威力之下吧。有罪！`,
    `低頭噤聲？很好，這就是對權力應有的態度。作為獎賞，我會讓你付出一筆優雅的罰金。`,
  ],
  appeal_win: [
    `既然你爬到本庭腳下，供奉了兩成的資產來求饒，那我就大發慈悲地推翻之前的判決。記住，你的命運掌握在我的手裡。`,
  ],
  appeal_lose: [
    `狂妄！花了 20% 的錢要求重新挑戰我的威嚴，結果卻毫無長進？你以為我的法庭是菜市場嗎？這次我不僅要維持原判，還要讓你帶著加倍的恥辱滾出這裡！`,
  ],
};

export const POWER_BROKER_INTERROGATION = [
  `被告，聽著。本庭對所謂的「道德」或「法律細節」沒興趣。本庭在乎的是穩定與平衡。你這筆「{tag}」鬧得很大，如果你想用「{escape}」來平息這場風波，現在就給本庭一個說得過去的理由。`,
];

export const PowerBroker = {
  LABEL: POWER_BROKER_LABEL,
  JUDGMENT: POWER_BROKER_JUDGMENT,
  INTERROGATION: POWER_BROKER_INTERROGATION,
};
