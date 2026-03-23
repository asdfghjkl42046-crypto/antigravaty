/**
 * 規格對齊與邏輯驗證腳本 (verify-v27.ts)
 * 測試項：
 * 1. 冪次起訴機率：驗證 GEMINI.md V2.7 §1-3 公式。
 * 2. 敗訴罰金：驗證淨利 * 3.0 以及 1x/3x/6x 被告次數機制。
 * 3. 即死判定與破產：驗證 RP <= 20 即死、G<=0 且無信託即破產的邏輯。
 * 4. 聖皇判定：驗證 G>=6000 且 RP>95 但需要滿足 saintBonusActive 的機制。
 *
 * 執行：npx tsx src/tests/verify-v27.ts
 */

import {
  getIndictmentChance,
  createInitialPlayer,
  calculateConvictionPenalty,
  checkBankruptcy,
} from '../engine/GameEngine';
import { checkVictory } from '../engine/EndingEngine';

async function testV27IndictmentChance() {
  console.log('\n[測試 1] V2.8 延遲起訴機率 (Floor(BM^0.7 * 8.6 - (RP-50)/2))');

  const p = await createInitialPlayer('測試者', 'normal');
  p.rp = 100;

  // BM=3, RP=100
  p.blackMaterialSources = [{ tag: 'T1', count: 3, actionId: 1, turn: 1 }];
  const c1 = getIndictmentChance(p, 1);
  console.log(`BM=3, RP=100: ${c1}% (應為 0%)`);

  // BM=18, RP=100
  p.blackMaterialSources = [{ tag: 'T1', count: 18, actionId: 1, turn: 1 }];
  const c2 = getIndictmentChance(p, 1);
  console.log(`BM=18, RP=100: ${c2}% (應為 38%)`);

  const isCorrect = c1 === 0 && c2 === 38;
  console.log(isCorrect ? '✅ 公式正確' : '❌ 公式計算錯誤');
  return isCorrect;
}
async function testV27Penalty() {
  console.log('\n[測試 2] 敗訴罰金 (淨額*3.0, 依被告次數給予1x/3x/6x倍率)');

  const p = await createInitialPlayer('被告', 'normal');
  const netIncome = 50; // 卡牌當時入帳金額

  // 1次被控 (1.0x) => 50 * 3.0 = 150
  p.totalTrials = 1;
  const f1 = calculateConvictionPenalty(p, netIncome);
  console.log(`第 1 次 (1.0x): ${f1.fine} 萬 (應為 150)`);

  // 5次被控 (3.0x) => 150 * 3 = 450
  p.totalTrials = 5;
  const f2 = calculateConvictionPenalty(p, netIncome);
  console.log(`第 5 次 (3.0x): ${f2.fine} 萬 (應為 450)`);

  // 8次被控 (6.0x) => 150 * 6 = 900
  p.totalTrials = 8;
  const f3 = calculateConvictionPenalty(p, netIncome);
  console.log(`第 8 次 (6.0x): ${f3.fine} 萬 (應為 900)`);

  const isCorrect = f1.fine === 150 && f2.fine === 450 && f3.fine === 900;
  console.log(isCorrect ? '✅ 公式正確' : '❌ 公式錯誤');
}

async function testV27SurvivalAndVictory() {
  console.log('\n[測試 3] 生存與隱藏結局判定');

  const p = await createInitialPlayer('玩家', 'normal');

  // RP 即死
  p.rp = 20;
  p.g = 1000;
  console.log(`RP=20, G=1000 破產狀態: ${checkBankruptcy(p)} (應為 true)`);

  // 信託續命
  p.rp = 50;
  p.g = -100;
  p.trustFund = 0;
  console.log(`RP=50, G=-100, Trust=0 破產狀態: ${checkBankruptcy(p)} (應為 true)`);

  p.trustFund = 50;
  console.log(`RP=50, G=-100, Trust=50 破產狀態: ${checkBankruptcy(p)} (應為 false, 靠信託續命)`);

  // 聖皇判定
  p.g = 5000;
  p.trustFund = 1500; // total 6500
  p.rp = 96;
  console.log(`聖皇無Bonus 結局判定: ${checkVictory(p, 50, false)} (應不為 saint)`);
  console.log(`聖皇有Bonus 結局判定: ${checkVictory(p, 50, true)} (應為 saint)`);
}

async function run() {
  await testV27IndictmentChance();
  await testV27Penalty();
  await testV27SurvivalAndVictory();
}

run();
