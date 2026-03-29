/**
 * 法律資料：E 類案件
 */
import type { LawCase } from '../../types/game';

export const LAWS_E: Record<string, LawCase> = {
  // E-01: 證據湮滅
  'E-01-1': {
    id: 'E-01-1',
    tag: ['湮滅證據罪'],
    lawName: '《刑法》第 165 條',
    hidden_intent: '被調查時偷偷把關鍵硬碟銷毀滅證。',
    survival_rate: 0.01,
    evidence_list: [
      '專業資料粉碎工具的執行紀錄',
      '監視器拍到針對性銷毀硬體的畫面',
      '調查展開後突然刪除大量檔案的日誌',
      '技術部門收到緊急銷毀指令的對話紀錄',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // E-02: 證人調解
  'E-02-1': {
    id: 'E-02-1',
    tag: ['教唆偽證罪', '妨害司法罪'],
    lawName: '《刑法》第 168 條',
    hidden_intent: '付錢給證人，叫他在庭上說假話或翻供。',
    survival_rate: 0.02,
    evidence_list: [
      '要求證人改口供的秘密協議表',
      '給證人家屬莫名其妙的「生活補助費」紀錄',
      '證人與被告律師私下見面的紀錄',
      '通訊軟體裡商量偽證的秘密對話存根',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },
  'E-02-3': {
    id: 'E-02-3',
    tag: ['教唆偽證罪', '強制罪'],
    lawName: '《刑法》第 168 條；《刑法》第 304 條',
    hidden_intent: '把證人送出國躲起來，讓他沒辦法出庭作證。',
    survival_rate: 0.01,
    evidence_list: [
      '證人接受海外安置之機票與酒店收據',
      '要求證人更改供詞之秘密協議書',
      '監視器拍到移除關鍵證物之畫面',
      '與證人間涉及利益交換之加密通訊',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // E-03: 數位足跡清理
  'E-03-2': {
    id: 'E-03-2',
    tag: ['妨害電腦使用罪', '湮滅證據罪'],
    lawName: '《刑法》第 358、360 條；第 165 條',
    hidden_intent: '案發後偷偷清掉伺服器紀錄，消滅犯罪痕跡。',
    survival_rate: 0.01,
    evidence_list: [
      '伺服器日誌被故意覆蓋掉的痕跡',
      '案發時系統權限被偷偷改動的紀錄',
      '在終端機輸入強制刪除指令的軌跡',
      '備份檔案被針對性移除的紀錄',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // E-04: 合約修改
  'E-04-1': {
    id: 'E-04-1',
    tag: ['偽造私文書罪', '使公務員登載不實罪'],
    lawName: '《刑法》第 210、214、216 條',
    hidden_intent: '叫公證人把合約日期改掉，偽造文件。',
    survival_rate: 0.02,
    evidence_list: [
      '鑑定出合約紙張年份對不上的報告',
      '合約日期跟電腦存檔時間有落差的紀錄',
      '拜託公證人配合改日期的通訊對話',
      '電子合約的原始數位指紋對不上',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // E-05: 資產隱藏
  'E-05-2': {
    id: 'E-05-2',
    tag: ['洗錢防制法', '稅捐稽徵法'],
    lawName: '《洗錢防制法》第 14 條；《稅捐稽徵法》第 41 條',
    hidden_intent: '透過多層海外公司把錢藏起來，躲避追查。',
    survival_rate: 0.01,
    evidence_list: ['金流路徑圖', '紙上公司文件', '跨境匯款紀錄'],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },

  // E-06: 郵件備份
  'E-06-3': {
    id: 'E-06-3',
    tag: ['妨害電腦使用罪', '湮滅證據罪'],
    lawName: '《刑法》第 165、358 條',
    hidden_intent: '被調查時偷偷刪掉敏感信件，銷毀證據。',
    survival_rate: 0.01,
    evidence_list: [
      '郵件系統被針對性清空的痕跡',
      '刪除特定敏感關鍵字郵件的紀錄',
      '備份磁帶被物理損壞的照片證明',
      '技術主管收到高層指示要刪除郵件的信件',
    ],
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },
};
