/**
 * 法律資料：開局案件
 */
import type { LawCase } from '../../types/game';

export const LAWS_START: Record<string, LawCase> = {
  'START-01': {
    id: 'START-01',
    tag: ['隱蔽型利益輸送'],
    lawName: '《證券交易法》第 171 條；《刑法》第 339 條「詐欺罪」',
    hidden_intent: '利用虛假營收與估值騙取投資人資金，規避融資監管',
    survival_rate: 0.01,
    evidence_list: [
      '不實的營收估值報告',
      '虛構的合作對象意向書',
      '融資合約中對負債的關鍵隱瞞',
      '資金未進入公司帳戶的流向圖',
    ],
    defense_j:
      '那份用戶數據是我們內部系統跑出來的，我沒有叫任何人去改那個數字，我當時看到的就是那個結果。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k:
      '那幾家企業確實有跟我們接觸過，說意向書是虛構的不公平，只是合作最後沒有走到簽約那一步。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '融資合約裡的財務結構是雙方律師談出來的，我沒有刻意隱瞞任何東西，對方有自己的盡職調查團隊。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },
  'START-02': {
    id: 'START-02',
    tag: ['隱蔽型利益輸送', '數據清洗下的倖存者'],
    lawName: '《商業會計法》第 71 條；《刑法》第 342 條「背信罪」',
    hidden_intent: '將公司資產視為私人金庫，透過影子帳簿清洗非法利潤並規避遺產/贈與稅',
    survival_rate: 0.02,
    evidence_list: [
      '兩套完全不同的影子帳簿',
      '將公帑轉入私人避稅天堂的指令',
      '不明原因的家族成員大額分潤',
      '被刻意抹除的歷史會計查核軌跡',
    ],
    defense_j:
      '公司是我們家族三代建起來的，帳務一直都是老會計師在管，我沒有叫他做兩套帳，那是他自己的作業習慣。',
    defense_j_text: "",
    web_judgment_j: "",
    edu_j: "",
    defense_k: '家族成員在公司裡都有實際的職務，那些錢是薪資和分紅，不是我把公司的錢往自己口袋塞。',
    defense_k_text: "",
    web_judgment_k: "",
    edu_k: "",
    defense_l: '海外的資產配置是稅務顧問建議的，他說這是合法的家族財富規劃，我沒有想到這樣會被說成是洗錢。',
    defense_l_text: "",
    web_judgment_l: "",
    edu_l: "",
    web_judgment_win: '',
    web_judgment_lose: '',
  },
};
