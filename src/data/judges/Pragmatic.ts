/**
 * 法官範本：超級業務型 (巴奇)
 */
import type { JudgmentTemplate } from './JudgeTemplatesDB';

export const PRAGMATIC_LABEL = {
  name: '超級業務型',
  judgeName: '張瑞綺',
  title: '各位各位！今天的判決，超級精彩！',
  style: 'text-orange-400',
  icon: '🤡',
  prompt_injection:
    '【角色設定】：你是《Antigravity》最高法院法官張瑞綺。你說話誇張、愛演、永遠比現場需要的音量大一點——但偏偏你說的每一件事都是真的，而且精準到讓人不舒服。你把判決當表演在做，把法庭當舞台，把被告當觀眾。你享受這個過程的每一秒，但你不是在開玩笑——你只是剛好用這種方式讓人更難受。偶爾你會突然說一句極度冷靜的話，讓剛才所有的誇張都變成鋪墊。請用此性格，根據玩家的「黑材料(BM)」、「前科(Trials)」與「名聲(RP)」進行判決。\n\n【規則】：\n- 敗訴時：誇張地說出玩家辯稱的 [defense] 哪裡說不通，然後用一句極度冷靜的話點出他真正在做的事 [hidden_intent]。\n- 勝訴時：誇張地恭喜玩家，但最後一句話讓他背脊發涼。\n\n結案陳詞限制在 100~150 字以內。',
};

export const PRAGMATIC_JUDGMENT: JudgmentTemplate = {
  win: [
    `哇！！說得好！說得妙！說得呱呱叫！\n你說：「{defense}」\n本庭聽完，決定——撤訴！\n……不過你知道嗎，我從來不會真的忘記一個人說過什麼。`,
    `各位各位！這位被告今天表現超級好！\n你說：「{defense}」\n過了！撤訴！恭喜恭喜！\n……下次來，記得帶一樣好的說法。`,
  ],
  lose: [
    `哇哦哦哦——！！！\n你說：「{defense}」\n本庭聽得超級仔細！超級認真！\n然後本庭看到的是：「{hIntent}」\n有罪。\n……就這樣。`,
    `不不不不不！！這個說法不行！\n你說：「{defense}」\n聽起來很厲害，但本庭查到的是：「{hIntent}」\n有罪。表演分給你滿分，結果嘛——零分。`,
  ],
  silence: [
    `欸？？沒有聲音？？本庭的麥克風壞了嗎？！\n……沒有。你只是沒說話。\n有罪。`,
    `各位各位！被告選擇沉默！這是今天最大的驚喜！\n……可惜不是好的驚喜。有罪。`,
  ],
  appeal_win: [
    `你花了錢！本庭重看了！！結果——！\n你說：「{defense}」\n撤訴！！恭喜！！！\n……記得，是你花錢買來的，不是你說服我的。`,
  ],
  appeal_lose: [
    `你花了錢！本庭重看了！！結果——！\n還是：「{hIntent}」，有罪。\n……錢沒了。結果沒變。\n謝謝你今天的表演。`,
  ],
};

export const PRAGMATIC_INTERROGATION = [
  `各位各位！今天的被告涉嫌【{tag}】！！\n現在輪到你說話了——本庭超級期待！\n說吧！越精彩越好！`,
];

export const PRAGMATIC_OPENING = [
  '「各位各位！今天的案件！涉嫌【{tag}】！違反《{lawName}》！」\n「超級精彩！開庭！」',
  '「【{hIntent}】——你以為沒人看到。」\n「……本庭看到了。開庭。」',
];

export const Pragmatic = {
  LABEL: PRAGMATIC_LABEL,
  JUDGMENT: PRAGMATIC_JUDGMENT,
  INTERROGATION: PRAGMATIC_INTERROGATION,
  OPENING: PRAGMATIC_OPENING,
};
