import type { LawCase } from '../../types/game';

export const LAWS_START: Record<string, LawCase> = {
  'START-01': {
    id: 'START-01',
    tag: ['隱蔽型利益輸送'],
    lawName: '《證券交易法》第 171 條；《刑法》第 339 條「詐欺罪」',
    surface_term: '融資型開發特許協議',
    hidden_intent: '利用虛假營收與估值騙取投資人資金，規避融資監管',
    escape: '本開發協議符合產業界融資評估之慣例，並非惡意吸金',
    survival_rate: 0.01,
    evidence_list: [
      '不實的營收估值報告',
      '虛構的合作對象意向書',
      '融資合約中對負債的關鍵隱瞞',
      '資金未進入公司帳戶的流向圖',
    ],
    winning_keywords: ['估值慣例', '特許協議', '市場期望'],
  },
  'START-02': {
    id: 'START-02',
    tag: ['隱蔽型利益輸送', '數據清洗下的倖存者'],
    lawName: '《商業會計法》第 71 條；《刑法》第 342 條「背信罪」',
    surface_term: '家族企業資產結構重整',
    hidden_intent: '將公司資產視為私人金庫，透過影子帳簿清洗非法利潤並規避遺產/贈與稅',
    escape: '家族辦公室對企業資金的正常稅務規劃與流動性調整',
    survival_rate: 0.02,
    evidence_list: [
      '兩套完全不同的影子帳簿',
      '將公帑轉入私人避稅天堂的指令',
      '不明原因的家族成員大額分潤',
      '被刻意抹除的歷史會計查核軌跡',
    ],
    winning_keywords: ['家族規劃', '稅務調整', '結構重整'],
  },
};
