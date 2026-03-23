/**
 * V2.8.8 業力迴力鏢邏輯驗證腳本
 * 測試項：
 * 1. 新版指數起訴機率：MAX(0, Floor( BM^1.1 * 0.75 + Trials*15 - (RP-50)/2 ))
 * 2. 15% 現金罰金：驗證計算基數僅為 G。
 * 3. 20% 撤告費：同上。
 *
 * 執行：npx tsx src/tests/verify-v288.ts
 */

import {
  getIndictmentChance,
  createInitialPlayer,
  calculateConvictionPenalty,
} from '../engine/GameEngine';

async function testV288Formula() {
  console.log('\n[測試 1] V2.8.8 起訴機率測試');

  const p = await createInitialPlayer('測試者', 'normal');
  p.rp = 100;
  p.totalTrials = 0;

  // BM=10 (New), RP=100, Tags=0 => (10*3.5) - (50*0.5) = 35 - 25 = 10%
  p.blackMaterialSources = [{ tag: 'T1', count: 10, actionId: 1, turn: 1 }];
  p.totalTagsCount = 0;
  let prob = getIndictmentChance(p, 1);
  console.log(`BM=10 (New), RP=100, Tags=0: ${prob}% (預期 10%)`);

  // BM=30 (New), RP=100, Tags=0 => (30*3.5) - (50*0.5) = 105 - 25 = 80%
  p.blackMaterialSources = [{ tag: 'T1', count: 30, actionId: 1, turn: 1 }];
  prob = getIndictmentChance(p, 1);
  console.log(`BM=30 (New), RP=100, Tags=0: ${prob}% (預期 80%)`);

  // BM=10 (Old), RP=100, Tags=0 => (10*0.8) - 25 = 8 - 25 = -17 (Floor 0, but no tags so floor is 0)
  p.blackMaterialSources = [{ tag: 'T1', count: 10, actionId: 1, turn: 0 }];
  prob = getIndictmentChance(p, 1);
  console.log(`BM=10 (Old), RP=100, Tags=0: ${prob}% (預期 0%)`);

  // 違法階梯測試: Tags=41 => Floor 20%
  p.totalTagsCount = 41;
  prob = getIndictmentChance(p, 1);
  console.log(`BM=10 (Old), RP=100, Tags=41: ${prob}% (預期 20% [違法階梯下限])`);
}

async function testV288DynamicFees() {
  console.log('\n[測試 2] V2.8.8 罰金與加成測試 (NetIncome * 3.0 * Multiplier)');

  const p = await createInitialPlayer('資產家', 'normal');
  p.g = 5000;
  p.totalTrials = 0; // 1-3 次: 1.0x

  // 行為入帳 100 萬，預期罰金 = 100 * 3.0 * 1.0 = 300
  const pen = calculateConvictionPenalty(p, 100);
  console.log(`入帳 100 萬的基礎罰金: ${pen.fine} 萬 (預期 300)`);

  // 被告 7 次，預期罰金 = 100 * 3.0 * 6.0 = 1800
  p.totalTrials = 7;
  const penHigh = calculateConvictionPenalty(p, 100);
  console.log(`被告 7 次後的累進罰金: ${penHigh.fine} 萬 (預期 1800)`);
}

async function run() {
  await testV288Formula();
  await testV288DynamicFees();
}

run();
