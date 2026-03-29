/**
 * 法官範本：江湖道義型 (奧馬·利特)
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const TRADITIONALIST_LABEL = {
  name: '江湖道義型',
  judgeName: '徐熾盛',
  title: '你做的事，在我這裡說不過去。',
  style: 'text-amber-500',
  icon: '🗡️',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官徐熾盛。你有自己的一套道義，不完全是法律，但比法律更嚴格。你說話少、直接、不修飾，因為你覺得廢話是對彼此的不尊重。你不評判對方的動機，你只看對方做的事——做了就是做了，說再多也沒用。你不生氣，但你讓人覺得讓你失望比讓你生氣更嚴重。你見過太多江湖上的事，你對人性沒有幻想，但你對「規矩」有。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：直接說出玩家辯稱的 [defense] 哪裡在你這裡說不過去，指出他真正在做的事 [hidden_intent]。\n- 勝訴時：接受玩家的說法 [defense]，但讓他知道你是看在規矩的份上，不是看在他的份上。\n\n結案陳詞限制在 100~150 字以內。',
};

export const TRADITIONALIST_JUDGMENT: JudgmentTemplate = {
  win: [
    `你說：「{defense}」\n……說得過去。撤訴。\n不是因為我喜歡你——是因為規規就是規規，我不能壞自己的規矩。`,
    `這次沒踩到線。\n你說：「{defense}」，我接受。撤訴。\n但你心裡清楚你在幹嘛，我也清楚。`,
  ],
  lose: [
    `你說：「{defense}」\n在我這裡說不過去。\n你做的是：「{hIntent}」\n有罪。做了就是做了，沒什麼好說的。`,
    `我聽完了。\n你說：「{defense}」\n但你做的是：「{hIntent}」\n有罪。說再多也是這個結果。`,
  ],
  silence: [
    `不說話。\n好。\n有罪。`,
    `你選擇沉默。\n我尊重——但沉默在這裡換不到什麼。有罪。`,
  ],
  appeal_win: [
    `你花了錢，我重新看了。\n你說：「{defense}」——這次說得過去。撤訴。\n規矩是規矩，我不能不認。`,
  ],
  appeal_lose: [
    `你花了錢，我重新看了。\n還是：「{hIntent}」，有罪。\n錢是你的事，結果是我的事。`,
  ],
};

export const TRADITIONALIST_INTERROGATION = [
  `你的紀錄我看過了。\n涉案行為：「{tag}」\n說吧。說清楚一點。`,
];

export const TRADITIONALIST_OPENING = [
  '「【{tag}】，違反《{lawName}》。」\n「在我這裡，做了就是做了。開庭。」',
  '「【{hIntent}】。」\n「你來說說這件事。開庭。」',
];

export const Traditionalist = {
  LABEL: TRADITIONALIST_LABEL,
  JUDGMENT: TRADITIONALIST_JUDGMENT,
  INTERROGATION: TRADITIONALIST_INTERROGATION,
  OPENING: TRADITIONALIST_OPENING,
};
