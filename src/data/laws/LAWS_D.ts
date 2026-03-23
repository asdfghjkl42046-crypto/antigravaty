import type { LawCase } from '../../types/game';

export const LAWS_D: Record<string, LawCase> = {
  // D-01: 政府採購圍標
  'D-01-1': {
    id: 'D-01-1',
    tag: '政府採購法/非法圍標/詐欺罪',
    lawName: '《政府採購法》第 101 條；《刑法》第 339 條',
    surface_term: '獨立成本核算策略',
    hidden_intent: '於投標前與競爭對手協議標價分配，操縱標案結果之非法圍標行為',
    survival_rate: 0.1,
    evidence_list: ['事先協議通訊', '金流補償證明', '標單高度相似'],
    rp_recovery: 40,
    winning_keywords: ['獨立', '作業', '巧合'],
  },

  // D-02: 離岸風電標案
  'D-02-2': {
    id: 'D-02-2',
    tag: '貪污治罪條例/交付賄賂罪/圖利罪',
    lawName: '《貪污治罪條例》第 5、6 條',
    surface_term: '地方協會公益贊助',
    hidden_intent: '透過贊助公務員關聯協會以換取評選優勢，具備對價關係之行賄圖利',
    survival_rate: 0.05,
    evidence_list: ['贊助金匯款紀錄', '私下溝通訊息', '評選分數異常波動'],
    rp_recovery: 50,
    winning_keywords: ['公開', '透明', '無對價'],
  },

  // D-03: 智慧交通顧問
  'D-03-2': {
    id: 'D-03-2',
    tag: '行賄罪/政治獻金法/圖利罪',
    lawName: '《貪污治罪條例》第 5 條；《政治獻金法》第 38 條',
    surface_term: '政策諮詢服務協議',
    hidden_intent: '以高額顧問費掩護賄款，疏通評選委員以獲取政府標案',
    survival_rate: 0.1,
    evidence_list: ['無實質產出合約', '關係人轉帳紀錄', '顧問合約書'],
    rp_recovery: 45,
    winning_keywords: ['契約', '行情', '勞務'],
  },

  // D-04: 規格制定會議
  'D-04-3': {
    id: 'D-04-3',
    tag: '政府採購法/圖利罪/綁標',
    lawName: '《政府採購法》第 7 條；《貪污治罪條例》第 6 條',
    surface_term: '技術領先規格導向',
    hidden_intent: '與採購人員串通修改規格達成量身訂做，排除其他競爭者之非法綁標',
    survival_rate: 0.08,
    evidence_list: ['規格變更對比', '內部溝通郵件', '技術必要性鑑定'],
    rp_recovery: 40,
    winning_keywords: ['必要', '多家', '獨立'],
  },

  // D-05: 聯合投標聯盟
  'D-05-1': {
    id: 'D-05-1',
    tag: '政府採購法/借牌投標/妨害電腦使用',
    lawName: '《政府採購法》第 101 條；《刑法》第 360 條',
    surface_term: '戰略技術合作聯盟',
    hidden_intent: '組成隱形聯盟操縱標價，或借用他廠名義投標之借牌圍標行為',
    survival_rate: 0.1,
    evidence_list: ['內部分配協議', '標單一致性紀錄', '隱形聯盟文件'],
    rp_recovery: 40,
    winning_keywords: ['獨立', '公開', 'JV'],
  },

  // D-06: 考察與審核
  'D-06-1': {
    id: 'D-06-1',
    tag: '交付賄賂罪/圖利罪/背信罪',
    lawName: '《貪污治罪條例》第 5、6 條',
    surface_term: '商務考察與技術展示',
    hidden_intent: '支付旅遊或招待費用以換取標價變更或條件鬆綁之行賄圖利',
    survival_rate: 0.15,
    evidence_list: ['旅遊食宿發票', '費用科目明細', '核準公文對比'],
    rp_recovery: 35,
    winning_keywords: ['正當', '比例', '考察'],
  },
};
