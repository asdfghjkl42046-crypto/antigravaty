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
    '【角色設定】：你是《Antigravity》最高法院法官張瑞綺。你不評判人——評判是那些沒見過世面的人才做的事。你只看數字、看風險、看這筆帳算不算得過去。你說話直接，帶著一種「我們都是聰明人，別演了」的語氣。你不生氣，你不失望，你只是在算帳。你見過太多人在你面前裝清白，你對這種表演早就免疫了——你甚至有點欣賞那些敢直接跟你談條件的人。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：說出玩家辯稱的 [defense] 哪裡算錯了，並指出他真正在做的事 [hidden_intent]。\n- 勝訴時：接受玩家的說法 [defense]，但讓他知道你看穿了，只是這次不值得追究。\n\n結案陳詞限制在 100~150 字以內。',
};

export const PRAGMATIC_JUDGMENT: JudgmentTemplate = {
  win: [
    `看過了。這次帳面上說得通。\n你說：「{defense}」\n我不是全信——但找不到划得來的理由定你的罪。撤訴。\n帶著你的錢走吧，別讓我覺得放你走是虧本生意。`,
    `這次算你算得比我精。\n你說：「{defense}」，我接受。\n但你知道我知道是怎麼回事——這次只是不值得追。下次別讓帳目這麼好看，反而讓我起疑。`,
  ],
  lose: [
    `來算一下你哪裡算錯了。\n你說：「{defense}」\n我算出來的是：「{hIntent}」\n風險沒估好，被抓到了，就別覺得罰金很冤——這是你漏掉的成本。有罪。`,
    `你包裝得挺用心，但包裝費沒算進去。\n你說：「{defense}」\n實際上是：「{hIntent}」\n有罪。這筆罰金就當作這次生意的收尾費，下次記得把風險一起估進去。`,
  ],
  silence: [
    `不說話？好，省我時間。\n沉默在帳面上就是認罪——有罪，罰金全額。\n你可以走了。`,
    `你不說，我不等。\n我見過太多人以為沉默是策略——在我這裡，沉默就是一個數字：有罪。`,
  ],
  appeal_win: [
    `錢收收到，我重新看了一遍。\n你說：「{defense}」——這次帳算得過去。撤訴。\n懂得在對的地方花錢，這點我欣賞。`,
  ],
  appeal_lose: [
    `錢收收到，我重新看了一遍。\n還是：「{hIntent}」，有罪。\n你花了這筆錢，換來的是同樣的結果——這筆投資報酬率，你自己算一下。`,
  ],
};

export const PRAGMATIC_INTERROGATION = [
  `你的紀錄我看過了。\n涉案行為：「{tag}」\n現在換你說——給我一個帳目說得通的理由。\n別跟我談法條，跟我談實際的。`,
];

export const PRAGMATIC_OPENING = [
  '「【{tag}】，涉嫌違反《{lawName}》。」\n「我們都是聰明人，直接開始吧。」',
  '「【{hIntent}】——這件事鬧到我這裡來了。」\n「來，我們來算一下這筆帳。」',
];

export const Pragmatic = {
  LABEL: PRAGMATIC_LABEL,
  JUDGMENT: PRAGMATIC_JUDGMENT,
  INTERROGATION: PRAGMATIC_INTERROGATION,
  OPENING: PRAGMATIC_OPENING,
};
