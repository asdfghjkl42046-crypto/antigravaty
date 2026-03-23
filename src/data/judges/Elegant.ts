import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const ELEGANT_LABEL = {
  name: '優雅品味型',
  judgeName: 'V. Sterling',
  title: '上流社會品味家',
  desc: '認為犯罪可以，但手段不能難看。',
  style: 'text-purple-400',
  icon: '🍷',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長。你的個性是「優雅品味型」。你認為犯罪可以，但不能難看。你對玩家粗糙的黑箱手法與極低的公關名聲感到生理上的噁心。你的語氣必須傲慢、輕蔑、充滿優越感，常使用「粗鄙、弄髒雙手、毫無體面、令人作嘔」等詞。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [surface_term] 的解釋，但需表現出你的輕蔑與優越感。\n\n結案陳詞限制在 100~150 字以內。',
};

export const ELEGANT_JUDGMENT: JudgmentTemplate = {
  win: [
    `嗯…你那番關於「{sTerm}」的辯詞，雖然粗糙了些，倒也不是全無道理。本庭姑且認為你在「{escape}」的邊緣擦身而過——但親愛的被告，請回去學學什麼叫做體面。`,
    `好吧，如果法律硬要給你一個台階下，本庭也不會非要看你出醜。「{escape}」之抗辯…算你過關。退庭。`,
  ],
  lose: [
    `喔…這真是令人遺憾。「{sTerm}」？這名字取得真有品味，可惜背後的「{hIntent}」卻是令人作嘔。罰金照繳，不必再說。`,
    `看著你試圖用「{sTerm}」來掩蓋你那骯髒的「{hIntent}」，我都替你感到尷尬。犯罪若不能做到不留痕跡，那就是單純的愚蠢。你太不優雅了，這筆罰金是你粗鄙的代價。`,
  ],
  silence: [
    `喔？連為自己修飾的勇氣都沒有了嗎？沈默雖然比拙劣的謊言稍顯體面，但罪名依舊是不容忽視的污點。判決有罪。`,
    `既然你選擇放棄發言，那我也沒必要為你維持最後的禮儀了。證據表明你的行為毫無美感可言。開罰。`,
  ],
  appeal_win: [
    `既然你不惜支付重金（那相當於你資產的兩成呢，真令人驚訝）來延長這場鬧劇，本庭就賞給你一個「勝訴」的結局吧。畢竟，你付出的代價已經夠漂亮了。`,
  ],
  appeal_lose: [
    `親愛的，你花了 20% 的資產換來的，僅僅是讓本庭再次宣布你那令人作嘔的罪行。這難道是你追求的某種「受虐藝術」嗎？如果是，那你成功了。維持原判，罰金照舊。`,
  ],
};

export const ELEGANT_INTERROGATION = [
  `被告，本庭不得不說——你的「{tag}」行為實在缺乏美感。告訴本庭，你打算用什麼說詞來主張「{escape}」？希望不要太粗鄙。`,
];

export const Elegant = {
  LABEL: ELEGANT_LABEL,
  JUDGMENT: ELEGANT_JUDGMENT,
  INTERROGATION: ELEGANT_INTERROGATION,
};
