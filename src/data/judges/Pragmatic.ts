/**
 * 法官範本：務實中立型
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const PRAGMATIC_LABEL = {
  name: '務實利益型',
  judgeName: '張瑞綺',
  title: '你的罪，我們可以談個價。',
  style: 'text-emerald-500',
  icon: '💰',
  prompt_injection:
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長張瑞綺。你把法庭當生意在經營——罰金是過路費，判決是議價結果，正義是你從來不收的那種貨。你說話市儈、直接、帶著一種見過太多人的油滑；你不憤怒，你只是在算帳。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」、「名聲(RP)」與玩家選擇的抗辯 [defense] 進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家抗辯的 [defense]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [defense] 的解釋，但需表現出你的貪婪或鄙夷。\n\n結案陳詞限制在 100~150 字以內。',
};

export const PRAGMATIC_JUDGMENT: JudgmentTemplate = {
  win: [
    `本庭研究過了，這次沒留下什麼把柄。撤訴。\n你的主張：「{defense}」\n本庭不是全信，但也找不到理由定你的罪。帶著你的錢出去。`,
    `這筆帳算你贏。防壁建得還算紮實。\n你辯護的是：「{defense}」\n本庭接受。下次別讓我覺得太便宜你了。`,
  ],
  lose: [
    `算筆帳吧。\n你主張：「{defense}」\n本庭算出來的是：「{hIntent}」\n既然被抓到了，這筆罰金就是你風險管理的學費。`,
    `風險沒算好，就別怪帳單難看。\n你將行為美化為：「{defense}」\n本庭看穿的是：「{hIntent}」\n罰金就是這筆爛生意的收尾費。`,
  ],
  silence: [
    `不說話？本庭最喜歡沉默的被告了——省時間，直接算錢。判決有罪，罰金全額，散庭。`,
    `你選擇沉默，本庭選擇不客氣。沉默在帳面上就是認罪，罰金一毛不少。`,
  ],
  appeal_win: [
    `20% 手續費已入帳，本庭重新看了一邊。\n你主張的：「{defense}」——這次我就算你過了。\n懂得花錢的人，本庭一向另眼相看。`,
  ],
  appeal_lose: [
    `你花了兩成資產來敲本庭的門，帶來的卻是同一套說詞。\n本庭的結論還是：「{hIntent}」\n這筆沉沒成本你自己吞。原判維持，重審費不退。`,
  ],
};

export const PRAGMATIC_INTERROGATION = [
  `被告，本庭見過不少為了生存而踩線的案例。\n涉案行為：「{tag}」\n請在選項中選擇答辯內容。\n給本庭一個讓帳目說得通的理由，別拿法條搪塞。`,
];

export const PRAGMATIC_OPENING = [
  '「為了維持現實世界的最低底線，本庭針對被告之【{tag}】嫌疑案件，正式宣告提審。」',
  '「別談理想，我們只談實質損失。就這起【{hIntent}】指控，我們開始審理。」',
];

export const Pragmatic = {
  LABEL: PRAGMATIC_LABEL,
  JUDGMENT: PRAGMATIC_JUDGMENT,
  INTERROGATION: PRAGMATIC_INTERROGATION,
  OPENING: PRAGMATIC_OPENING,
};
