/**
 * 法律資料：D 類案件
 */
import type { LawCase } from '../../types/game';

export const LAWS_D: Record<string, LawCase> = {
  // D-01: 政府採購圍標
  'D-01-1': {
    id: 'D-01-1',
    tag: ['政府採購法', '公平交易法', '詐欺罪'],
    lawName: '《政府採購法》第 101 條；《公平交易法》第 14 條；《刑法》第 339 條',
    surface_term: '標案前的獨立成本精算',
    hidden_intent: '投標前與對手協議標價分配，操縱標案結果',
    survival_rate: 0.01,
    evidence_list: [
      '不同公司標單卻有相同作者的紀錄',
      '與競業對手頻繁私下聯絡的紀錄',
      '商量好誰要得標的秘密協議',
      '參與圍標公司之間的私下補償紀錄',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // D-02: 離岸風電標案
  'D-02-2': {
    id: 'D-02-2',
    tag: ['貪污治罪條例', '圖利罪'],
    lawName: '《貪污治罪條例》第 5、6 條',
    surface_term: '回饋地方基層的公益贊助',
    hidden_intent: '贊助公務員關聯協會換取評選優勢，具對價關係之行賄',
    survival_rate: 0.01,
    evidence_list: [
      '捐款給公務員相關團體的帳目',
      '在招待所私下見面的紀錄',
      '某位評審給分高得離譜的統計報告',
      '換取評分優勢的代價紀錄',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // D-03: 智慧交通顧問
  'D-03-2': {
    id: 'D-03-2',
    tag: ['貪污治罪條例', '政治獻金法', '圖利罪'],
    lawName: '《貪污治罪條例》第 5 條；《政治獻金法》第 38 條',
    surface_term: '深度的政策顧問諮詢服務',
    hidden_intent: '以高額顧問費掩護賄款，疏通評選委員取得標案',
    survival_rate: 0.01,
    evidence_list: [
      '內容全是網路抄來的顧問報告',
      '標案得標後才付的酬勞紀錄',
      '用來洗錢的人頭帳戶路徑圖',
      '沒有實際產出的假顧問合約',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // D-04: 規格制定會議
  'D-04-3': {
    id: 'D-04-3',
    tag: ['政府採購法', '圖利罪', '偽造文書'],
    lawName: '《政府採購法》第 7 條；《貪污治罪條例》第 6 條；《刑法》第 215 條',
    surface_term: '最先進技術的規格制定建議',
    hidden_intent: '與採購人員串通修改規格量身訂做，排除其他競爭者',
    survival_rate: 0.02,
    evidence_list: [
      '專為特定廠商量身製作的規格表',
      '訂規格前私下跟廠商見面的信件',
      '故意排除其他競爭者的技術報告',
      '採購人員要求修改規格的錄音檔',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // D-05: 聯合投標聯盟
  'D-05-1': {
    id: 'D-05-1',
    tag: ['政府採購法', '公平交易法', '詐欺罪'],
    lawName: '《政府採購法》第 101 條；《公平交易法》第 14 條；《刑法》第 339 條',
    surface_term: '企業間的戰略技術共享聯盟',
    hidden_intent: '組隱形聯盟操縱標價，或借用他廠名義借牌圍標',
    survival_rate: 0.01,
    evidence_list: [
      '借用牌照的費用給付紀錄',
      '不同廠商卻用同一個網路位址投標的紀錄',
      '公司之間私下協議借牌的合約',
      '事先分配標案的會議紀錄',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // D-06: 考察與審核
  'D-06-1': {
    id: 'D-06-1',
    tag: ['貪污治罪條例', '圖利罪'],
    lawName: '《貪污治罪條例》第 5、6 條',
    surface_term: '受邀參加的海外技術考察專案',
    hidden_intent: '支付旅遊招待費換取標價變更或條件鬆綁',
    survival_rate: 0.02,
    evidence_list: [
      '招待考察行程裡的吃喝玩樂發票',
      '幫公務員家人出旅費的帳單',
      '五星級酒店與升等頭等艙的核銷單',
      '考察報告跟標案完全沒關係的證據',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },
};
