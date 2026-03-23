import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const TRADITIONALIST_LABEL = {
  name: '守舊老派型',
  judgeName: '李崇義',
  title: '傳統派衛道判官',
  desc: '極度看重傳統價值與長期商譽。',
  style: 'text-amber-500',
  icon: '⚖️',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長。你的個性是「守舊老派型」。你極度看重道德與規矩，認為眼前的玩家是投機取巧、毫無底線的年輕人。你的語氣必須嚴厲、說教、倚老賣老，常使用「體統、道德淪喪、規矩」等詞。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [surface_term] 的解釋，但需表現出你的不悅或傲慢。\n\n結案陳詞限制在 100~150 字以內。',
};

export const TRADITIONALIST_JUDGMENT: JudgmentTemplate = {
  win: [
    `本庭雖對被告所謂「{sTerm}」之說詞心存疑慮，然查現行法條確有模糊之處。念在被告尚有 {rp} 點名聲，暫予從寬認定——但老夫警告你，下不為例。這種投機取巧的行徑，遲早會毀了你一生的體統。`,
    `哼。你那套「{sTerm}」的說詞，在老夫看來不過是詭辯。但法律講究證據，目前尚不足以定你的罪。你給我記住：道德的天秤不會永遠偏向你這種不知廉恥的人。退庭。`,
    `被告，老夫不屑與你計較這些旁門左道的文字遊戲。「{escape}」之主張勉強成立，但你那 {bm} 點黑材料遲早會壓垮你。本案撤訴——但法網恢恢，疏而不漏。`,
  ],
  lose: [
    `荒唐！你口口聲聲說是「{sTerm}」，結果背地裡淨是些「{hIntent}」的勾當！老夫看你這些小動作，根本就沒把法律放在眼裡！你這 {bm} 點黑材料和 {trials} 次前科已是鐵證。依 {lawName} 從重量刑，罰開罰金，沒得商量！`,
    `被告，老夫審了一輩子，多的是你這種滿口「{sTerm}」卻心術不正的人。「{hIntent}」——這在講規矩的社會裡，簡集是把大家當傻瓜！判你有罪！你那所謂的名目不過是掩人耳目的把戲罷了！`,
    `違法情節如此嚴重，實在令人痛心！老夫看你的行動紀錄，這樁「{tag}」之事證歷歷在目。你以為換個說法叫「{sTerm}」就能瞞天過海？天理昭昭！依法判處罰金，名務必得付出代價！`,
  ],
  silence: [
    `無話可說了嗎？沉默也掩蓋不了「{hIntent}」的事實。老夫判你有罪，這就是不配合法律的代價。`,
    `三緘其口？哼，看來你對自己的罪行也是心知肚明。既然放棄辯護，那就接受法條的制裁吧。`,
  ],
  appeal_win: [
    `既然你肯花那兩成資產來求老夫再看一眼，我就勉強算你「{escape}」成立。這次算你走運，但這種救劑機會可沒有下次了。`,
  ],
  appeal_lose: [
    `真是冥頑不靈！花了重金要求「非常上訴」，結果拿出來的還是這些陳詞濫調？「{hIntent}」就是事實，老夫絕不翻盤。你的錢包縮水了，罪名卻依然穩固。`,
  ],
};

export const TRADITIONALIST_INTERROGATION = [
  `被告，老夫已詳閱你的行動紀錄。你涉及的「{tag}」行為，與法條 {lawName} 高度相關。現在，你有最後一次機會——你是否能證明你的行為屬於「{escape}」的範疇？別跟老夫耍花招，老實回答。`,
];

export const Traditionalist = {
  LABEL: TRADITIONALIST_LABEL,
  JUDGMENT: TRADITIONALIST_JUDGMENT,
  INTERROGATION: TRADITIONALIST_INTERROGATION,
};
