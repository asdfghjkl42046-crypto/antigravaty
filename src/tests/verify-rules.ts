/**
 * 規格對齊與邏輯驗證腳本 (verify-rules.ts)
 * 測試項：
 * 1. AP 排序：驗證剩餘 AP 為第一順位，G 為第二順位，RP 為第三順位。
 * 2. 敗訴罰金：驗證 G * 0.15 基數。
 * 3. 起訴機率：驗證 V2.8.8 公式 (BM^1.1 * 0.75 + Trials*15)。
 *
 * 執行：npx tsx src/tests/verify-rules.ts
 */

import {
  sortTurnOrder,
  calculateConvictionPenalty,
  getIndictmentChance,
} from '../engine/GameEngine';
import type { Player } from '../types/game';

function mockPlayer(name: string): Player {
  return {
    id: name,
    name: name,
    g: 1000,
    rp: 100,
    ip: 0,
    ap: 5,
    roles: { lawyer: 0, pr: 0, accountant: 0, cto: 0 },
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
  };
}

async function testAPSorting() {
  console.log('\n[測試 1] AP 排序邏輯 (AP > G > RP)');

  const p1 = mockPlayer('玩家 A');
  p1.ap = 2;
  p1.g = 500;
  p1.rp = 100;

  const p2 = mockPlayer('玩家 B');
  p2.ap = 3;
  p2.g = 100;
  p2.rp = 100;

  const p3 = mockPlayer('玩家 C');
  p3.ap = 2;
  p3.g = 800;
  p3.rp = 100;

  const players = [p1, p2, p3];
  const sorted = sortTurnOrder(players, 2); // Round 2

  console.log('排序結果：', sorted.map((p) => `${p.name} (AP:${p.ap}, G:${p.g})`).join(' -> '));

  const isCorrect =
    sorted[0].name === '玩家 B' && // Highest AP
    sorted[1].name === '玩家 C' && // AP Equal, Higher G
    sorted[2].name === '玩家 A'; // Lowest G among AP 2

  console.log(isCorrect ? '✅ 排序正確' : '❌ 排序錯誤');
}

async function testPenalty() {
  console.log('\n[測試 2] 敗訴罰金 (netIncome * 3.0 * TrialBonus)');

  const p = mockPlayer('被告');
  // 假設該次行為入帳 100 萬
  const netIncome = 100;

  // V2.7: baseFine = 100 * 3.0 = 300
  // 總被告 0 次 (第一次被判定)：1.0 倍
  const result = calculateConvictionPenalty(p, netIncome);
  console.log(`netIncome=100 -> 罰金: ${result.fine} 萬 (應為 300)`);

  const isCorrect = result.fine === 300;
  console.log(isCorrect ? '✅ 公式正確' : '❌ 公式錯誤');
}

async function testIndictmentChance() {
  console.log('\n[測試 3] 起訴機率 (BM^0.7 * 20 - (RP-50)/10)');

  const p = mockPlayer('測試者');
  p.rp = 100;
  p.blackMaterialSources = [{ tag: 'T1', count: 10, actionId: 1, turn: 1 }]; // Total BM = 10, Turn = 1

  // Calculation: (10^0.7 * 20) - (100 - 50) / 10
  // 10^0.7 ≈ 5.0118
  // 5.0118 * 20 ≈ 100.237
  // 100.237 - 5 = 95.237 -> Floor -> 95%
  const c1 = getIndictmentChance(p, 1);
  console.log(`BM=10, RP=100: ${c1}% (應為 10%)`);

  p.rp = 50;
  // 100.237 - 0 = 100.237 -> Math.floor -> 100%
  const c2 = getIndictmentChance(p, 1);
  console.log(`BM=10, RP=50: ${c2}% (應為 35%)`);

  const isCorrect = c1 === 10 && c2 === 35;
  console.log(isCorrect ? '✅ 公式正確' : '❌ 公式錯誤');
}

async function run() {
  await testAPSorting();
  await testPenalty();
  await testIndictmentChance();
}

run();
