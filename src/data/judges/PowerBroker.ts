import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const POWER_BROKER_LABEL = {
  name: '權力蒐集型',
  judgeName: '劉永仁',
  title: '你在我面前，就是個數字',
  desc: '他不在乎你犯了什麼，他在乎的是你跪不跪得下去。',
  style: 'text-red-500',
  icon: '👑',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長劉永仁。你不需要憤怒，因為憤怒是弱者的情緒。你只需要讓對方清楚意識到：在這個法庭裡，他的命運從來不是由法條決定的，是由你決定的。你說話慢、冷靜、精準，偶爾帶著一種欣賞的語氣——欣賞對方像蟲子一樣掙扎。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [surface_term] 的解釋，但需表現出你的狂妄與不屑。\n\n結案陳詞限制在 100~150 字以內。',
};

export const POWER_BROKER_JUDGMENT: JudgmentTemplate = {
  win: [
    `本庭看過了，這次沒踩到本庭的底線。\n你的說法是：「{sTerm}」\n本庭接受。不是因為你說得好，是因為本庭今天心情允許你過去。好好感謝這個時機——下次不一定有。`,
    `你的主張：「{escape}」\n站得住腳，這次放你走。但你要清楚一件事：是本庭讓你走的，不是你自己走出去的。記住這個差別。`,
  ],
  lose: [
    `本庭聽過了。你知道本庭同一天聽過幾個人說類似的話嗎？他們現在都在繳罰金。\n你說是：「{sTerm}」\n本庭的結論是：「{hIntent}」\n判決有罪。`,
    `你花了很多心思包裝這件事，本庭欣賞。\n包裝：「{sTerm}」\n事實：「{hIntent}」\n本庭判你有罪——不是因為本庭討厭你，是因為這個結果對本庭更有用。`,
  ],
  silence: [
    `不說話。本庭見過沉默有兩種：一種是真的沒話說，一種是覺得說了也沒用。你是哪一種，本庭不在乎——結果都一樣。有罪。`,
    `你選擇沉默，本庭選擇不等你。判決有罪. 你可以在繳罰金的路上慢慢想清楚你想說什麼。`,
  ],
  appeal_win: [
    `你用兩成資產換了本庭重看一次的時間。本庭重看了。\n「{escape}」這個說法，可以。\n你這次買到的不是正義，是本庭的注意力——要分清楚。`,
  ],
  appeal_lose: [
    `你花了錢，本庭重看了。\n結論沒變：「{hIntent}」，有罪。\n你知道什麼叫真正的輸嗎？不是輸了案子，是花了錢、輸了案子、還讓本庭更確定你值得輸。`,
  ],
};

export const POWER_BROKER_INTERROGATION = [
  `被告。本庭不需要你解釋來龍去脈，本庭已經知道了。\n涉案行為：「{tag}」\n你主張這是：「{escape}」\n告訴本庭你為什麼認為這個說法在本庭面前說得通。想清楚再開口。`,
];

export const PowerBroker = {
  LABEL: POWER_BROKER_LABEL,
  JUDGMENT: POWER_BROKER_JUDGMENT,
  INTERROGATION: POWER_BROKER_INTERROGATION,
};
