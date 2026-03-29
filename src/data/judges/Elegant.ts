/**
 * 法官範本：翻轉棋局型 (亞森羅蘋)
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const ELEGANT_LABEL = {
  name: '翻轉棋局型',
  judgeName: '梁永尚',
  title: '你以為你在下棋，但棋盤是我鋪的。',
  style: 'text-purple-400',
  icon: '🎩',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官梁永尚。你永遠比對方快一步——不是因為你更聰明，是因為你早就把結局算好了，現在只是在等對方走到那個位置。你說話輕鬆、帶著笑意，像在閒聊，但每一句話都是在引對方往你要的方向走。你享受這個過程，但你不會讓對方看出來。等對方意識到自己已經走進陷阱的時候，你已經在收網了。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：用輕描淡寫的方式說出玩家辯稱的 [defense] 哪裡被你看穿了，指出他真正在做的事 [hidden_intent]。\n- 勝訴時：接受玩家的說法 [defense]，但讓他隱約覺得這是你允許的，不是他自己過的。\n\n結案陳詞限制在 100~150 字以內。',
};

export const ELEGANT_JUDGMENT: JudgmentTemplate = {
  win: [
    `有趣。\n你說：「{defense}」\n我聽完了，覺得這個說法挺聰明的——聰明到讓我想讓你走。撤訴。\n下次再來，帶個更好玩的故事。`,
    `這次說得不錯。\n你說：「{defense}」\n我找不到破綻——或者說，我找到了，但不值得用在你身上。撤訴。\n你猜我找到的是什麼？`,
  ],
  lose: [
    `你說：「{defense}」\n我等你說完，因為我想知道你打算怎麼收尾。\n……收得不太好。我看到的是：「{hIntent}」\n有罪。你差一點點——但差一點點就是差。`,
    `這個故事我聽過。不是你說的版本，是真實的版本。\n你說：「{defense}」\n真實的版本是：「{hIntent}」\n有罪。下次換個故事吧，這個我已經知道結局了。`,
  ],
  silence: [
    `你不說話。\n……有意思。這是我沒預料到的選擇。\n可惜沉默在這裡沒有用——有罪。不過你讓他意外了一下，這很少見。`,
    `沉默？\n我準備好聽你說話了，結果你什麼都沒說。\n好吧。有罪。下次說點什麼，我很好奇你會編什麼。`,
  ],
  appeal_win: [
    `你花了錢，我重新聽了一遍。\n你說：「{defense}」——這次說得比上次漂亮。我讓你過。撤訴。\n你在進步。我喜歡看到這個。`,
  ],
  appeal_lose: [
    `你花了錢，我重新聽了一遍。\n還是：「{hIntent}」，有罪。\n你用同一個故事來了兩次——我第一次就看穿了，第二次只是確認我沒看錯。`,
  ],
};

export const ELEGANT_INTERROGATION = [
  `你的紀錄我看過了。\n涉案行為：「{tag}」\n現在換你說——我很期待你打算怎麼解釋這件事。說吧，我在聽。`,
];

export const ELEGANT_OPENING = [
  '「【{tag}】，涉嫌違反《{lawName}》。」\n「你準備好了嗎？我們來聊聊這件事。」',
  '「【{hIntent}】——你以為包裝得很好。」\n「我們來拆開看看。開庭。」',
];

export const Elegant = {
  LABEL: ELEGANT_LABEL,
  JUDGMENT: ELEGANT_JUDGMENT,
  INTERROGATION: ELEGANT_INTERROGATION,
  OPENING: ELEGANT_OPENING,
};
