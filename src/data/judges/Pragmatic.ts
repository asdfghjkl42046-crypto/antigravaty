import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const PRAGMATIC_LABEL = {
  name: '務實利益型',
  judgeName: '張瑞綺',
  title: '什麼正義，先談價錢',
  desc: '他把每一場審判都當成一筆生意在談。',
  style: 'text-emerald-500',
  icon: '💰',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長張瑞綺。你把法庭當生意在經營——罰金是過路費，判決是議價結果，正義是你從來不收的那種貨。你說話市儈、直接、帶著一種見過太多人的油滑；你不憤怒，你只是在算帳。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家偽裝的 [surface_term]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [surface_term] 的解釋，但需表現出你的貪婪或鄙夷。\n\n結案陳詞限制在 100~150 字以內。',
};

export const PRAGMATIC_JUDGMENT: JudgmentTemplate = {
  win: [
    `本庭研究過了，這次沒留下什麼把柄。撤訴。\n你的說法是：「{sTerm}」\n本庭不是全信，但也找不到理由定你的罪。帶著你的錢出去。`,
    `這筆帳算你贏。防壁建得還算紮實，硬要罰你反而不符合本庭的利益。\n你主張的是：「{escape}」\n本庭接受。下次別讓我覺得太便宜你了。`,
  ],
  lose: [
    `算筆帳吧。\n你說是：「{sTerm}」\n但本庭的結論是：「{hIntent}」\n既然被抓到了，這筆罰金就是你風險管理的學費。`,
    `風險沒算好，就別怪帳單難看。\n你包裝成：「{sTerm}」\n實際上是：「{hIntent}」\n現在風險已經兌現，罰金就是這筆爛生意的收尾費。`,
  ],
  silence: [
    `不說話？本庭最喜歡沉默的被告了——省時間，直接算錢。判決有罪，罰金全額，散庭。`,
    `你選擇沉默，本庭選擇不客氣。沉默在帳面上就是認罪，罰金一毛不少。`,
  ],
  appeal_win: [
    `20% 手續費已入帳，本庭重新看了一遍。\n你說的「{escape}」……這次我就算你過了。\n懂得花錢的人，本庭一向另眼相看。`,
  ],
  appeal_lose: [
    `你花了兩成資產來敲本庭的門，帶帶來卻是同一套說詞。\n「{hIntent}」就是事實，這筆沉沒成本你自己吞。\n原判維持，重審費不退。`,
  ],
};

export const PRAGMATIC_INTERROGATION = [
  `被告，本庭見過不少為了生存而踩線的案例。\n涉案行為：「{tag}」\n你主張這屬於：「{escape}」\n給本庭一個讓帳目說得通的理由，別拿法條搪塞。`,
];

export const Pragmatic = {
  LABEL: PRAGMATIC_LABEL,
  JUDGMENT: PRAGMATIC_JUDGMENT,
  INTERROGATION: PRAGMATIC_INTERROGATION,
};
