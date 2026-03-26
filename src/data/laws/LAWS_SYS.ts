import type { LawCase } from '../../types/game';

export const LAWS_SYS: Record<string, LawCase> = {
  '【隱蔽型利益輸送】': {
    id: 'SYS-01',
    tag: '隱蔽型利益輸送',
    lawName: '《刑法》第 342 條「背信罪」及相關不法利益輸送條例',
    surface_term: '關係企業技術授權',
    hidden_intent: '透過不透明架構轉移利益，損害股東並規避監管',
    escape: '合法關係企業授權與技術移轉',
    survival_rate: 0.2,
    evidence_list: ['初始背景資料', '不明資金往來', '關聯交易紀錄'],
    rp_recovery: 20,
    winning_keywords: ['授權', '關係', '優化'],
  },
  '【數據清洗下的倖存者】': {
    id: 'SYS-02',
    tag: '數據清洗下的倖存者',
    lawName: '《商業會計法》第 71 條；《刑法》第 215 條「業務登載不實」',
    surface_term: '歷史數據維護調整',
    hidden_intent: '清洗數據以隱匿早期違法營收或虛報資產',
    escape: '例行性數據品質維護作業',
    survival_rate: 0.15,
    evidence_list: ['清理紀錄', '差異分析報告', '早期財報'],
    rp_recovery: 25,
    winning_keywords: ['清洗', '調整', '歷史'],
  },
};
