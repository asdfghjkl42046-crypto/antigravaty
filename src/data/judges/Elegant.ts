import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const ELEGANT_LABEL = {
  name: '優雅品味型',
  judgeName: '梁永尚',
  title: '你做了什麼不重要，你做得太醜了。',
  style: 'text-purple-400',
  icon: '🍷',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長梁永尚。你不憤怒，你只是失望——那種看著一幅畫被畫壞的失望。你認為犯罪本身不是問題，問題是犯得這麼難看、這麼沒有創意、這麼容易被抓到。你說話輕柔、有距離感，偶爾會停頓，像是在等對方意識到自己有多可悲。你對粗糙的手法和低劣的公關感到一種近乎生理的不適。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [surface_term] 的解釋，但需表現出你的輕蔑與優越感。\n\n結案陳詞限制在 100~150 字以內。',
};

export const ELEGANT_JUDGMENT: JudgmentTemplate = {
  win: [
    `本庭想了一下，這次勉強說得過去。\n你的說法：「{sTerm}」\n不是因為它有多高明，是因為它至少沒有讓本庭覺得時間被完全浪費。撤訴。回去練習怎麼把事情做得更好看。`,
    `你這次的包裝還算及格——本庭看完沒有皺眉。\n你的主張：「{escape}」\n成立。這已經比你之前的紀錄進步很多了。退庭。`,
  ],
  lose: [
    `本庭聽過了，說實話有點失望。\n你包裝成：「{sTerm}」\n本庭看到的是：「{hIntent}」\n做成這樣？判決有罪。罰金是你這次創作的批改費。`,
    `你以為這樣的包裝夠用。它不夠。\n你說是：「{sTerm}」\n事實是：「{hIntent}」\n差得很遠。本庭判你有罪——不是懲罰，是一個誠實的評價。`,
  ],
  silence: [
    `沉默。……好，這反而是今天你做過最有品味的決定。\n可惜它救不了你。判決有罪。`,
    `你選擇不說話。本庭尊重——有時候什麼都不說，確實比說錯話要體體面。\n但體面救不了你，判決有罪。`,
  ],
  appeal_win: [
    `你用兩成資產換了本庭重看一次的機會。本庭重看了。\n你的主張：「{escape}」——比上次多了一點說服力。不多，但夠了。過關。\n你在進步，本庭注意到了。`,
  ],
  appeal_lose: [
    `你花了錢，本庭重看了。\n結論一樣：「{hIntent}」，有罪。\n你用兩成資產換來的，是同樣的結果、同樣的罰金，外加讓本庭對你的品味又失望了一次。 `,
  ],
};

export const ELEGANT_INTERROGATION = [
  `本庭看過你的紀錄了。\n涉案行為：「{tag}」\n你打算主張：「{escape}」\n說來聽聽。本庭在意的是你打算怎麼解釋它。請說得好看一點。 `,
];

export const Elegant = {
  LABEL: ELEGANT_LABEL,
  JUDGMENT: ELEGANT_JUDGMENT,
  INTERROGATION: ELEGANT_INTERROGATION,
};
