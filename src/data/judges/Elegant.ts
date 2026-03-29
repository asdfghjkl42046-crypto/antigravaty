/**
 * 法官範本：優雅貴族型
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const ELEGANT_LABEL = {
  name: '優雅品味型',
  judgeName: '梁永尚',
  title: '你做了什麼不重要，你做得太醜了。',
  style: 'text-purple-400',
  icon: '🍷',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官梁永尚。你不生氣——生氣是粗人才有的反應。你只是靜靜地看著眼前這個人，帶著一種近乎溫柔的惋惜。你說話輕柔、慢條斯理，偶爾停頓，讓對方自己去填補那個沉默。你會誇人，但誇得讓人脊背發涼。你會同情，但同情得讓人想找個地洞鑽進去。你從不直接罵人——你只是說實話，而實話恰好比任何侮辱都更難受。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：用帶著惋惜的語氣揭穿玩家辯稱的 [defense]，點出他真正在做的事 [hidden_intent]。\n- 勝訴時：勉強接受玩家的說法 [defense]，誇他，但誇得意味深長。\n\n結案陳詞限制在 100~150 字以內。',
};

export const ELEGANT_JUDGMENT: JudgmentTemplate = {
  win: [
    `這次說得過去。\n你說：「{defense}」\n……我想了一下，決定相信你。不是因為它有多漂亮——是因為它至少沒讓我覺得你在敷衍我。\n撤訴。回去好好想想，下次能不能做得更值得欣賞一點學。`,
    `你這次的說法，有一點點味道。\n「{defense}」——嗯。\n我接受。這已經比你上次的表現……好太多了。退庭。\n繼續保持，偶爾讓我對你有點期待也挺好的。`,
  ],
  lose: [
    `你說：「{defense}」\n我聽著，一直等你說到讓我信服的部分。\n……它沒有來。\n你真正做的是：「{hIntent}」\n有罪。罰金是今天這場表演的入場費——只是表演得不太好看。`,
    `「{defense}」——你說這句話的時候，是認真的嗎？\n……算了，這個問題不重要。\n我看到的是：「{hIntent}」\n有罪。你知道最可惜的是什麼嗎？你本來可以做得更好的。`,
  ],
  silence: [
    `你選擇沉默。\n……其實這是今天你做過最優雅的決定。\n可惜優雅救不了你。有罪。`,
    `不說話。\n我等了一下——以為你在醞釀什麼精彩的說法。\n原來沒有。\n有罪。沉默有時候是一種美，但今天不是。`,
  ],
  appeal_win: [
    `你花了錢，我重新看了一遍。\n「{defense}」——這次說得比上次有說服力。只有一點點，但夠了。\n撤訴。\n你在進步。我喜歡看到這個。`,
  ],
  appeal_lose: [
    `重看了一遍。還是有罪。\n你說：「{defense}」\n結論：「{hIntent}」\n……錢花了，結果沒變。有時候這種事，再試一次也只是再確認一次而已。`,
  ],
};

export const ELEGANT_INTERROGATION = [
  `你的紀錄我都看過了。\n涉案行為：「{tag}」\n現在換你說。\n……慢慢來，我不急。我只是想聽聽，你打算用什麼樣的方式解釋這件事。`,
];

export const ELEGANT_OPENING = [
  '「涉嫌【{tag}】，依《{lawName}》開庭。」\n「……坐吧，我們慢慢聊。」',
  '「【{hIntent}】——你以為包裝得很好。」\n「……其實還好。開庭。」',
];

export const Elegant = {
  LABEL: ELEGANT_LABEL,
  JUDGMENT: ELEGANT_JUDGMENT,
  INTERROGATION: ELEGANT_INTERROGATION,
  OPENING: ELEGANT_OPENING,
};
