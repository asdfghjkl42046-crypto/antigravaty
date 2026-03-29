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
    defense_j: '',
    defense_k: '',
    defense_l: '',
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
    defense_j: '',
    defense_k: '',
    defense_l: '',
  },
};
