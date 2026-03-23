import type { LawCase } from '../../types/game';

export const LAWS_SYS: Record<string, LawCase> = {
  '【隱蔽型利益輸送】': {
    id: 'SYS-01',
    tag: '【隱蔽型利益輸送】',
    lawName: '《刑法》第 342 條「背信罪」及相關不法利益輸送條例',
    surface_term: '關係企業技術授權',
    hidden_intent: '透過不透明之架構進行利益轉移，損害股東利益並避開監管',
    survival_rate: 0.2,
    evidence_list: ['初始背景資料', '不明資金往來', '關聯交易紀錄'],
    rp_recovery: 20,
    winning_keywords: ['授權', '關係', '優化'],
  },
  '【數據清洗下的倖存者】': {
    id: 'SYS-02',
    tag: '【數據清洗下的倖存者】',
    lawName: '《商業會計法》第 71 條；《刑法》第 215 條「業務登載不實」',
    surface_term: '歷史數據維護調整',
    hidden_intent: '利用數據清洗過程隱匿早期違法營收紀錄或虛報資產',
    survival_rate: 0.15,
    evidence_list: ['清理紀錄', '差異分析報告', '早期財報'],
    rp_recovery: 25,
    winning_keywords: ['清洗', '調整', '歷史'],
  },
  隱匿金流: {
    id: 'SYS-03',
    tag: '隱匿金流',
    lawName: '《洗錢防制法》第 2、11 條',
    surface_term: '海外第三方代付',
    hidden_intent: '刻意規避金融體系監管，透過非正規管道轉移資金以隱匿來源',
    survival_rate: 0.1,
    evidence_list: ['異常對帳單', '代付協議', '跳板帳戶明細'],
    rp_recovery: 30,
    winning_keywords: ['代付', '第三方', '清算'],
  },
};
