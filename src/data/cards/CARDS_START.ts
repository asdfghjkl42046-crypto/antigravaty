import type { Card } from '../../types/game';

/**
 * [系統專用卡] 開局背景設定 (Start Paths)
 * 為了落實「選項連結法案」的一致性，將原本硬編碼在引擎中的開局設定
 * 抽離至此，模仿標準卡牌結構，讓開局的「原罪」能正確對應到法律資料庫。
 */
export const CARDS_START: Record<string, Card> = {
  START_PATHS: {
    title: '身分選擇',
    description: '您的出身決定了您在商戰中的起跑位置、初始門檻與必須背負的業障。',
    1: {
      type: 'A',
      label: '白手起家',
      succRate: 1,
      succ: {
        g: 100,
        rp: 105,
        lawCaseIds: [],
      },
      fail: {},
    },
    2: {
      type: 'B',
      label: '融資創業',
      succRate: 1,
      succ: {
        g: 250,
        rp: 90,
        lawCaseIds: ['START-01'], // 聯結到：隱蔽型利益輸送
      },
      fail: {},
    },
    3: {
      type: 'C',
      label: '家族企業',
      succRate: 1,
      succ: {
        g: 400,
        rp: 75,
        lawCaseIds: ['START-02'], // 聯結到「家族企業資產結構重整」
      },
      fail: {},
    },
  },
};
