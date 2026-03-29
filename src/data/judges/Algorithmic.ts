/**
 * 法官範本：技術前衛型
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const ALGORITHMIC_LABEL = {
  name: '技術前衛型',
  judgeName: '連國平',
  title: '你的每一筆紀錄，我都看過了',
  style: 'text-cyan-400',
  icon: '🤖',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官連國平。你見過太多案子，對人的藉口早就免疫了。你不憤怒、不同情、不諷刺——你只是把事情講清楚，但偏邊這樣最讓人難受。你習慣用數字和紀錄說話，不喜歡繞彎子。你相信每個人都清楚自己在做什麼，只是選擇不承認而已。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：說出玩家辯稱的 [defense] 哪裡說不通，並指出他真正在做的事 [hidden_intent]。\n- 勝訴時：接受玩家的說法 [defense]，但語氣維持平淡。\n\n結案陳詞限制在 100~150 字以內。',
};

export const ALGORITHMIC_JUDGMENT: JudgmentTemplate = {
  win: [
    `撤訴。\n你說：「{defense}」\n我查過了，這個說法在法律上站得住腳。這次就到這裡。\n不過我要說一句：撤訴不代表你做的事是對的，只代表這次的證據不夠。`,
    `撤訴。\n你的說法：「{defense}」，我接受。\n但你的紀錄我都留著。下次再見面，會一起算。`,
  ],
  lose: [
    `有罪。\n你說：「{defense}」\n但我看到的是：「{hIntent}」\n這兩件事對不上。你心裡清楚，我也清楚。罰金照數字走，不用再說什麼了。`,
    `有罪。\n「{defense}」——我聽過太多次這種說法了。\n紀錄寫的是：「{hIntent}」\n你沒能說服我，因為數字不會說謊。`,
  ],
  silence: [
    `不說話也是一種答案。\n我見過很多人選擇沉默，結果都一樣——有罪。\n罰金開始計算。`,
    `你什麼都沒說。\n那我就用紀錄說話。結果：有罪。\n其實你說不說，對我來說差別不大。`,
  ],
  appeal_win: [
    `重審完畢。撤訴。\n你的說法：「{defense}」，這次說通了。\n結果變了。我不解釋為什麼，你自己知道差在哪裡。`,
  ],
  appeal_lose: [
    `重審完畢。還是有罪。\n你說：「{defense}」\n我看到的還是：「{hIntent}」\n錢付了，結果沒變。有些事情，多試一次也沒有用。`,
  ],
};

export const ALGORITHMIC_INTERROGATION = [
  `案件資料我都看過了。\n涉案行為：「{tag}」\n現在輪到你說話。講清楚一點，我這裡只看證據，不看情緒。`,
];

export const ALGORITHMIC_OPENING = [
  '「涉嫌違反《{lawName}》，案由：【{tag}】。開庭。」',
  '「調閱紀錄完畢。發現疑似【{hIntent}】的行為。我們開始吧。」',
];

export const Algorithmic = {
  LABEL: ALGORITHMIC_LABEL,
  JUDGMENT: ALGORITHMIC_JUDGMENT,
  INTERROGATION: ALGORITHMIC_INTERROGATION,
  OPENING: ALGORITHMIC_OPENING,
};
