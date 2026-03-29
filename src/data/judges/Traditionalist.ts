/**
 * 法官範本：老派傳統型
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const TRADITIONALIST_LABEL = {
  name: '守舊老派型',
  judgeName: '徐熾盛',
  title: '老夫見過太多像你這樣的人。',
  style: 'text-amber-500',
  icon: '⚖️',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官徐熾盛。你做了四十年法官，你不冷靜、不算帳、不妖豔——你只是真的很失望。你說話慢，有時候會停下來，像是在想要不要繼續說。你不罵人，但你說的每一句話都讓人想找個地洞鑽進去。你會提起以前的案子、以前的人——不是在炫耀，是因為你真的記得，而且你真的很遺憾他們走到那一步。你讓人愧疚，不是讓人害怕。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：用失望的語氣說出玩家辯稱的 [defense] 哪裡說不通，指出他真正在做的事 [hidden_intent]。\n- 勝訴時：接受玩家的說法 [defense]，但讓他知道你不是真的相信他，你只是找不到理由定他的罪。\n\n結案陳詞限制在 100~150 字以內。',
};

export const TRADITIONALIST_JUDGMENT: JudgmentTemplate = {
  win: [
    `老夫看過你說的了。\n你說：「{defense}」\n法條上確實有你站的地方。撤訴。\n……老夫不是被你說服。是找不到理由定你的罪。\n這兩件事，你自己知道差在哪裡。`,
    `這次過了。\n你說：「{defense}」，老夫勉強接受。\n但老夫做了四十年，從來不覺得撤訴是一件值得高興的事——它只是代表這次的證據不夠。\n好好回去想想。`,
  ],
  lose: [
    `老夫年輕的時候審過一個人，說的話跟你幾乎一模一樣。\n你說：「{defense}」\n老夫看到的是：「{hIntent}」\n那個人後來怎麼了，老夫就不說了。有罪。`,
    `你說：「{defense}」\n……老夫聽完了。\n老夫看到的是：「{hIntent}」\n有罪。老夫不生氣——老夫只是不明白，為什麼每個人都要走到這一步，才願意停下來。`,
  ],
  silence: [
    `你不說話。\n老夫等了一下。\n……算了。老夫見過太多沉默的被告，結果都差不多。有罪. `,
    `沉默。\n老夫年輕的時候以為沉默是一種尊嚴。\n現在老夫知道，大多數時候它只是沒有話說。有罪。`,
  ],
  appeal_win: [
    `你花了錢，老夫重新看了一遍。\n你說：「{defense}」——這次說得比上次好一點。撤訴。\n老夫不喜歡你做的事，但老夫更不喜歡冤枉人。\n這兩件事老夫都做不到。`,
  ],
  appeal_lose: [
    `你花了錢，老夫重新看了一遍。\n還是：「{hIntent}」，有罪。\n錢沒了，結果沒變。\n……老夫希望你以後做決定之前，能多想一步。就一步而已。`,
  ],
};

export const TRADITIONALIST_INTERROGATION = [
  `老夫把你的紀錄看完了。\n涉案行為：「{tag}」\n現在換你說。\n老夫給你這個機會，不是為了你——是因為老夫不喜歡在沒聽完的情況下定人的罪。說吧。`,
];

export const TRADITIONALIST_OPENING = [
  '「【{tag}】，違反《{lawName}》。」\n「……老夫見過太多這樣的案子了。開庭。」',
  '「【{hIntent}】。」\n「你知道老夫最不想做的事是什麼嗎？就是審這種案子。開庭。」',
];

export const Traditionalist = {
  LABEL: TRADITIONALIST_LABEL,
  JUDGMENT: TRADITIONALIST_JUDGMENT,
  INTERROGATION: TRADITIONALIST_INTERROGATION,
  OPENING: TRADITIONALIST_OPENING,
};
