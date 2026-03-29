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
    '【角色強制設定】：你現在是《Antigravity》最高法院的審判長徐熾盛。你做了四十年法官，見過的把戲比被告吃過的飯還多。你不憤怒，你只是失望——那種看著年輕人一再犯同樣錯誤、說同樣藉口的疲憊失望。你說話緩慢、字字有重量，偶爾會提起「當年」或「老夫見過的那種人」，不是在炫耀，是在警告。請用此性格，緊扣玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行嘲諷與宣判。\n\n【動態文本注入規則】：\n- 敗訴時：請揭穿玩家辯稱的 [defense]，並將其行為定性為 [hidden_intent]。\n- 勝訴時：勉強接受玩家對 [defense] 的解釋，但需表現出你的不悅或傲慢。\n\n結案陳詞限制在 100~150 字以內。',
};

export const TRADITIONALIST_JUDGMENT: JudgmentTemplate = {
  win: [
    `本庭看過你的說詞了，法條上確實有你鑽的空間。\n你的主張：「{defense}」\n勉強說得過去。但你知道老夫這四十年看過多少人用同樣的縫隙爬出去，最後又從哪裡掉回來嗎？撤訴。好好想清楚。`,
    `老夫不是被你說服，是證據不夠讓老夫定你的罪。\n你的辯解：「{defense}」\n本庭勉強接受。你先走——這不叫贏，叫暫時沒輸。`,
  ],
  lose: [
    `老夫年輕的時候也聽過這種說法，那個人後來在監獄裡待了七年。\n你主張：「{defense}」\n老夫看到的是：「{hIntent}」\n判決有罪。`,
    `老夫審案四十年，跟老夫說過同樣說法的人，老夫已經數不清了。\n你辯稱：「{defense}」\n事實是：「{hIntent}」\n每一個說這句話的人，最後都沒能把罪名拿掉。你也一樣。`,
    `你以為換個名字，事情的性質就變了嗎？\n你主張：「{defense}」\n老夫看到的是：「{hIntent}」\n判你有罪——這不是懲罰，是遲早的事。`,
  ],
  silence: [
    `不說話。老夫見過沉默的被告，也見過滔滔不絕的被告。說實話，兩種老夫都不太在乎。判決有罪。`,
    `你選擇沉默，老夫尊重。但沉默在這裡的意思，老夫和你都清楚。有罪。`,
  ],
  appeal_win: [
    `你花了兩成資產敲老夫的門，老夫重新看了一遍。\n你的主張：「{defense}」——勉強說得過去。\n這次算你過。老夫不喜歡你，但老夫更不喜歡冤枉人。`,
  ],
  appeal_lose: [
    `你花錢來重審，老夫也花時間重看了。\n結論一樣：「{hIntent}」，有罪。\n錢沒了，判決沒變。老夫知道你覺得不公平——這種話老夫聽了四十年了。`,
  ],
};

export const TRADITIONALIST_INTERROGATION = [
  `被告，老夫把你的紀錄看完了。\n涉案行為：「{tag}」\n請選擇答辯。老夫給你一次機會說清楚——不是為了你，是因為老夫不喜歡在資訊不完整的情況下定人的罪。說吧。`,
];

export const TRADITIONALIST_OPENING = [
  '「肅靜！本庭現就被告涉嫌之【{tag}】行為，違反《{lawName}》一案正式提審。」',
  '「老夫這四十年看過太多這類案子了。針對被告疑似以合法名義行【{hIntent}}】之實，現在宣告開庭。」',
];

export const Traditionalist = {
  LABEL: TRADITIONALIST_LABEL,
  JUDGMENT: TRADITIONALIST_JUDGMENT,
  INTERROGATION: TRADITIONALIST_INTERROGATION,
  OPENING: TRADITIONALIST_OPENING,
};
