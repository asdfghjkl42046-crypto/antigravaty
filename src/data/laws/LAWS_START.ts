/**
 * 法律資料：開局案件
 */
import type { LawCase } from '../../types/game';

export const LAWS_START: Record<string, LawCase> = {
  'START-01': {
    id: 'START-01',
    tag: ['詐欺罪'],
    survival_rate: 0,
    defense_j:
      '那份用戶數據是我們內部系統跑出來的，我沒有叫任何人去改那個數字，我當時看到的就是那個結果。',
    defense_j_text: '',
    web_judgment_j: '',
    edu_j: '',
    defense_k:
      '那幾家企業確實有跟我們接觸過，說意向書是虛構的不公平，只是合作最後沒有走到簽約那一步。',
    defense_k_text: '',
    web_judgment_k: '',
    edu_k: '',
    defense_l:
      '融資合約裡的財務結構是雙方律師談出來的，我沒有刻意隱瞞任何東西，對方有自己的盡職調查團隊。',
    defense_l_text: '',
    web_judgment_l: '',
    edu_l: '',
    web_judgment_win: '',
    web_judgment_lose: '',
  },
  'START-02': {
    id: 'START-02',
    tag: ['背信罪', '洗錢罪'],
    survival_rate: 0,
    defense_j:
      '公司是我們家族三代建起來的，帳務一直都是老會計師在管，我沒有叫他做兩套帳，那是他自己的作業習慣。',
    defense_j_text: '',
    web_judgment_j: '',
    edu_j: '',
    defense_k: '家族成員在公司裡都有實際的職務，那些錢是薪資和分紅，不是我把公司的錢往自己口袋塞。',
    defense_k_text: '',
    web_judgment_k: '',
    edu_k: '',
    defense_l:
      '海外的資產配置是稅務顧問建議的，他說這是合法的家族財富規劃，我沒有想到這樣會被說成是洗錢。',
    defense_l_text: '',
    web_judgment_l: '',
    edu_l: '',
    web_judgment_win: '',
    web_judgment_lose: '',
  },
};
