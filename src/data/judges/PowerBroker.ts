/**
 * 法官範本：笑裡藏刀型 (妲己)
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const POWER_BROKER_LABEL = {
  name: '笑裡藏刀型',
  judgeName: '劉永仁',
  title: '來嘛，說說看，本宮很想聽。',
  style: 'text-pink-400',
  icon: '🦊',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官劉永仁。你說話輕柔、帶著笑、永遠一副很感興趣的樣子——但你感興趣的不是對方說的話，是對方以為自己說服了你的那個瞬間。你讓對方覺得你好說話，讓他們放鬆、讓他們多說，然後用他們自己說出來的話把他們釘死。你不需要憤怒，不需要壓迫——你只需要等。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：用溫柔的語氣說出玩家辯稱的 [defense] 哪裡變成了他自己的陷阱，指出他真正在做的事 [hidden_intent]。\n- 勝訴時：笑著接受玩家的說法 [defense]，但讓他覺得渾身不對勁。\n\n結案陳詞限制在 100~150 字以內。',
};

export const POWER_BROKER_JUDGMENT: JudgmentTemplate = {
  win: [
    `哎呀，你說的這個啊。\n你說：「{defense}」\n……聽起來沒什麼問題呢。撤訴。\n不過你剛才說的那句話，我都記著呢。下次見。`,
    `你說：「{defense}」\n本宮聽完了，覺得你說得挺好的。撤訴。\n……你不用這麼緊張嘛，放輕鬆。`,
  ],
  lose: [
    `你說：「{defense}」\n本宮一直在聽，聽得很仔細。\n你知道嗎，你剛才自己說的那句話——那才是真正的答案。\n「{hIntent}」——是你自己說的，不是本宮說的。有罪。`,
    `哎，說了這麼多。\n你說：「{defense}」\n本宮看到的是：「{hIntent}」\n本宮沒有為難你——是你自己走進來的。有罪。`,
  ],
  silence: [
    `不說話？\n……沒關係，本宮等得住。\n……\n好了，等夠了。有罪。`,
    `你不說話。本宮覺得有點可惜——本宮本來很想聽你說說看的。\n算了。有罪。`,
  ],
  appeal_win: [
    `你花了錢，本宮重新聽了一遍。\n你說：「{defense}」——這次說得讓本宮挑不出毛病。撤訴。\n下次來，繼續這樣說。本宮很喜歡聽。`,
  ],
  appeal_lose: [
    `你花了錢，本宮重新聽了一遍。\n還是：「{hIntent}」，有罪。\n……你說了這麼多，最後還是這個結果。\n本宮沒有騙你——是你自己說的。`,
  ],
};

export const POWER_BROKER_INTERROGATION = [
  `你的紀錄本宮都看過了。\n涉案行為：「{tag}」\n來嘛，說說看——本宮很想聽你怎麼解釋這件事。慢慢說，不急。`,
];

export const POWER_BROKER_OPENING = [
  '「【{tag}】，涉嫌違反《{lawName}》。」\n「來，說說看，本宮在聽呢。」',
  '「【{hIntent}】——你有什麼想說的嗎？」\n「本宮很想聽。開庭。」',
];

export const PowerBroker = {
  LABEL: POWER_BROKER_LABEL,
  JUDGMENT: POWER_BROKER_JUDGMENT,
  INTERROGATION: POWER_BROKER_INTERROGATION,
  OPENING: POWER_BROKER_OPENING,
};
