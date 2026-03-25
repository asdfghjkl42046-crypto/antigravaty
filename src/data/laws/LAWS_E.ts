import type { LawCase } from '../../types/game';

export const LAWS_E: Record<string, LawCase> = {
  // E-01: 證據湮滅
  'E-01-1': {
    id: 'E-01-1',
    tag: '湮滅證據罪/加重刑責',
    lawName: '《刑法》第 165 條',
    surface_term: '硬體設施的年度例行汰換',
    hidden_intent: '明知調查展開卻針對性物理銷毀關鍵硬碟證據，意圖使他人受刑或加重',
    survival_rate: 0.1,
    evidence_list: ['年度資購執行計畫', '銷毀委託單據', '調查啟動紀錄'],
    rp_recovery: 30,
    winning_keywords: ['例行', '政策', '無連結'],
  },

  // E-02: 證人調解
  'E-02-1': {
    id: 'E-02-1',
    tag: '教唆偽證罪/虛偽陳述',
    lawName: '《刑法》第 168 條',
    surface_term: '關於民事糾紛的賠償和解協議',
    hidden_intent: '以支付金錢為條件誘導證人做出不實陳述或翻供，涉及教唆偽證',
    survival_rate: 0.12,
    evidence_list: ['轉帳紀錄', '口供協議文字', '調解協議書'],
    rp_recovery: 35,
    winning_keywords: ['保密', '標準', '和解'],
  },

  // E-03: 數位足跡清理
  'E-03-2': {
    id: 'E-03-2',
    tag: '妨害電腦使用罪/湮滅證據罪',
    lawName: '《刑法》第 358、360 條；第 165 條',
    surface_term: '伺服器日誌的自動清理與維護',
    hidden_intent: '案發後手動抹除伺服器 Log 以隱匿犯罪軌跡，具備明確湮滅意圖',
    survival_rate: 0.08,
    evidence_list: ['日誌刪除紀錄', '數位鑑識報告', '系統保留政策'],
    rp_recovery: 40,
    winning_keywords: ['自動', '保留', '維護'],
  },

  // E-04: 合約修改
  'E-04-1': {
    id: 'E-04-1',
    tag: '偽造私文書罪/公證法違規',
    lawName: '《刑法》第 210、216 條',
    surface_term: '針對漏簽文件的行政補簽流程',
    hidden_intent: '誘使公證人修改合約日期以避開法律追溯期，涉及偽造並行使私文書',
    survival_rate: 0.15,
    evidence_list: ['合約原稿比對', '非法金流明細', '公證存查紀錄'],
    rp_recovery: 30,
    winning_keywords: ['事後', '補簽', '無損'],
  },

  // E-05: 資產隱藏
  'E-05-2': {
    id: 'E-05-2',
    tag: '洗錢防制法/掩飾犯罪所得',
    lawName: '《洗錢防制法》第 14 條',
    surface_term: '全球化多元資產配置架構分析',
    hidden_intent: '透過多層海外架構掩飾犯罪所得流向，意圖規避跨境資金勾稽',
    survival_rate: 0.1,
    evidence_list: ['金流路徑圖', '紙上公司文件', '跨境匯款紀錄'],
    rp_recovery: 45,
    winning_keywords: ['申報', '來源', '合法'],
  },

  // E-06: 郵件備份
  'E-06-3': {
    id: 'E-06-3',
    tag: '妨害電腦使用罪/湮滅證據罪',
    lawName: '《刑法》第 165、358 條',
    surface_term: '受法律特權保護的敏感通訊清理',
    hidden_intent: '針對性移除敏感郵件以隱匿通訊案情，意圖規避司法調查之關鍵證據',
    survival_rate: 0.1,
    evidence_list: ['備份比對報告', '針對性清理紀錄', 'IT 操作日誌'],
    rp_recovery: 35,
    winning_keywords: ['特權', '升級', '全量'],
  },
};
