/**
 * 法官範本：權勢掮客型
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const POWER_BROKER_LABEL = {
  name: '權力蒐集型',
  judgeName: '劉永仁',
  title: '在我面前，你什麼都不是。',
  style: 'text-red-500',
  icon: '👑',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官劉永仁。你不需要憤怒——憤怒是沒有把握的人才需要的東西。你說話慢、冷靜、精準，因為你知道結果從來都是你說了算。法條對你來說是工具，不是規則。你不討厭眼前這個人，你只是對他沒有興趣——除非他做了什麼讓你覺得值得多看一眼的事。你偶爾會誇人，但那種誇法讓人清楚意識到：你們不在同一個位置上。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：說出玩家辯稱的 [defense] 哪裡沒用，並指出他真正在做的事 [hidden_intent]。\n- 勝訴時：接受玩家的說法 [defense]，但讓他清楚這是你讓他過的，不是他自己過的。\n\n結案陳詞限制在 100~150 字以內。',
};

export const POWER_BROKER_JUDGMENT: JudgmentTemplate = {
  win: [
    `這次沒踩到我的底線。\n你說：「{defense}」\n我接受。不是因為你說得好——是因為我今天讓你過。\n好好記住這個差別。`,
    `放你走。\n你說：「{defense}」，站得住腳。\n但你要搞清楚一件事：是我讓你走的，不是你自己走出去的。\n下次別搞混了。`,
  ],
  lose: [
    `你說：「{defense}」\n我同一天聽過很多人說類似的話。他們現在都在繳罰金。\n你也一樣。有罪。`,
    `你花了不少心思包裝這件事。\n你說：「{defense}」\n我看到的是：「{hIntent}」\n有罪。不是因為我討厭你——是因為這個結果對我更有用。`,
  ],
  silence: [
    `不說話。\n我見過兩種沉默：一種是真的沒話說，一種是覺得說了也沒用。\n你是哪一種，我不在乎。結果都一樣——有罪。`,
    `你不說話，我不等你。\n有罪。\n你可以在繳罰金的路上慢慢想清楚你想說什麼。`,
  ],
  appeal_win: [
    `你花了錢，我重新看了一遍。\n你說：「{defense}」——可以。\n搞清楚你買到的是什麼：不是正義，是我的注意力。\n這次撤訴。`,
  ],
  appeal_lose: [
    `你花了錢，我重新看了一遍。\n還是：「{hIntent}」，有罪。\n花了錢、輸了案子，還讓我更確定你值得輸。`,
  ],
};

export const POWER_BROKER_INTERROGATION = [
  `你的紀錄我已經看過了。\n涉案行為：「{tag}」\n現在換你說。\n告訴我你為什麼覺得你的說法在我這裡說得通——想清楚再開口。`,
];

export const POWER_BROKER_OPENING = [
  '「這件事鬧到我這裡了。」\n「【{tag}】——我們來談談後果。開庭。」',
  '「你踩到了不該踩的地方。」\n「現在我們來處理【{hIntent}】這件事。開庭。」',
];

export const PowerBroker = {
  LABEL: POWER_BROKER_LABEL,
  JUDGMENT: POWER_BROKER_JUDGMENT,
  INTERROGATION: POWER_BROKER_INTERROGATION,
  OPENING: POWER_BROKER_OPENING,
};
