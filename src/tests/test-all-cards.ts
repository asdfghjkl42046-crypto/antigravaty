/* eslint-disable @typescript-eslint/no-explicit-any */
import { CARDS_DB } from '../data/cards/CardsDB';
import type { Player } from '../types/game';
import { performAction } from '../engine/ActionEngine';

async function testAllCards() {
  console.log('🃏 [全選項窮舉] 遍歷所有卡牌與所有選項...');

  let dummyPlayer: Player = {
    id: 'p1',
    name: 'PC',
    g: 1000,
    rp: 100,
    ip: 200,
    ap: 5,
    tags: [],
    blackMaterialSources: [],
    trustFund: 0,
    isBankrupt: false,
    consecutiveCleanTurns: 0,
    totalTrials: 0,
    totalFinesPaid: 0,
    skipNextCard: false,
    genesisHash: '',
    lastHash: '',
    totalIncome: 0,
    hasUsedExtraAppeal: false,
    totalTagsCount: 0,
    roles: {},
  };

  let totalCards = 0;
  let totalOptions = 0;
  let successfulResolves = 0;

  console.log(`\n開始窮舉 ${Object.values(CARDS_DB).length} 張卡牌...`);

  for (const [cardId, card] of Object.entries(CARDS_DB)) {
    totalCards++;

    for (const optIdx of [1, 2, 3] as const) {
      const opt = (card as unknown as Record<number, unknown>)[optIdx];
      if (!opt) continue;
      totalOptions++;

      try {
        // 重置測試物件
        dummyPlayer = {
          id: 'p1',
          name: 'PC',
          g: 1000,
          rp: 100,
          ip: 200,
          ap: 5,
          tags: [],
          blackMaterialSources: [],
          trustFund: 0,
          isBankrupt: false,
          consecutiveCleanTurns: 0,
          totalTrials: 0,
          totalFinesPaid: 0,
          skipNextCard: false,
          genesisHash: '',
          lastHash: '',
          totalIncome: 0,
          hasUsedExtraAppeal: false,
          totalTagsCount: 0,
          roles: {},
        };
        const res = (await performAction(
          dummyPlayer,
          cardId,
          optIdx,
          dummyPlayer.lastHash,
          'skip',
          1
        )) as any;

        if (res && res.success !== undefined) {
          successfulResolves++;
        } else {
          console.error(`❌ 卡牌 ${cardId} 選項 ${optIdx} 解析失敗（回傳格式異常）`);
        }
      } catch (err) {
        console.error(`❌ 卡牌 ${cardId} 選項 ${optIdx} 發生崩潰:`, err);
        throw err;
      }
    }
  }

  console.log(`\n📊 總結報告：`);
  console.log(`總檢測卡牌數: ${totalCards}`);
  console.log(`總檢測選項數: ${totalOptions}`);
  console.log(`合法解析數: ${successfulResolves}`);

  if (totalOptions === successfulResolves && totalOptions > 0) {
    console.log(`\n✅ 完美！所有卡片選項皆可被合法結算，無任何崩潰或死角。`);
  } else {
    throw new Error('❌ 全選項窮舉測試未完全通過。');
  }
}

testAllCards().catch((e) => {
  console.error(e);
  process.exit(1);
});
