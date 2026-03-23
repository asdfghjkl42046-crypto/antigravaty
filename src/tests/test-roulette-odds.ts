import { CourtEngine } from '../engine/CourtEngine';
import type { Player } from '../types/game';

async function testRouletteOdds() {
  console.log('🎰 [機率校準] 黑材料大輪盤分佈測試');

  // 構造 4 位玩家，他們的黑材料比例分別為 1 : 2 : 3 : 4 (總計 10)
  // 理論中獎率：10%, 20%, 30%, 40%
  const players: Player[] = [
    {
      id: 'pA',
      name: 'Player A',
      g: 0,
      rp: 0,
      ip: 0,
      ap: 0,
      tags: [],
      blackMaterialSources: [{ tag: 't1', count: 1, actionId: 1, turn: 1 }],
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
    },
    {
      id: 'pB',
      name: 'Player B',
      g: 0,
      rp: 0,
      ip: 0,
      ap: 0,
      tags: [],
      blackMaterialSources: [{ tag: 't1', count: 2, actionId: 1, turn: 1 }],
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
    },
    {
      id: 'pC',
      name: 'Player C',
      g: 0,
      rp: 0,
      ip: 0,
      ap: 0,
      tags: [],
      blackMaterialSources: [{ tag: 't1', count: 3, actionId: 1, turn: 1 }],
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
    },
    {
      id: 'pD',
      name: 'Player D',
      g: 0,
      rp: 0,
      ip: 0,
      ap: 0,
      tags: [],
      blackMaterialSources: [{ tag: 't1', count: 4, actionId: 1, turn: 1 }],
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
    },
  ];

  const iterations = 5000;
  const results: Record<string, number> = { pA: 0, pB: 0, pC: 0, pD: 0 };

  console.log(`\n執行大輪盤抽樣 ${iterations} 次...`);

  for (let i = 0; i < iterations; i++) {
    const defendant = CourtEngine.spinRussianRoulette(players);
    if (defendant) {
      results[defendant.id]++;
    }
  }

  const expectedRatios = { pA: 0.1, pB: 0.2, pC: 0.3, pD: 0.4 };
  const tolerance = 0.05; // 容許誤差 5%

  let allPassed = true;
  for (const p of players) {
    const actualRatio = results[p.id] / iterations;
    const expectedRatio = expectedRatios[p.id as keyof typeof expectedRatios];
    const diff = Math.abs(actualRatio - expectedRatio);
    const passed = diff <= tolerance;
    if (!passed) allPassed = false;

    console.log(
      `  ${p.name}: 實抽 ${(actualRatio * 100).toFixed(2)}% | 理論 ${(expectedRatio * 100).toFixed(0)}% => 誤差 ${(diff * 100).toFixed(2)}% ${passed ? '✅' : '❌'}`
    );
  }

  // 特例：無人有黑材料
  const cleanPlayers: Player[] = players.map((p) => ({ ...p, blackMaterialSources: [] }));
  const noDefendant = CourtEngine.spinRussianRoulette(cleanPlayers);
  console.log(`\n  無人有黑材料時回傳 null => ${noDefendant === null ? '✅' : '❌'}`);

  console.log(
    `\n${allPassed ? '✅' : '❌'} RouletteOdds 測試${allPassed ? '全數通過' : '存在偏差過大項目'}`
  );
}

testRouletteOdds().catch(console.error);
