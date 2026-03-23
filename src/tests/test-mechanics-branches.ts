import { calculateActualRPGain, getIndictmentChance, settleBet } from '../engine/MechanicsEngine';
import type { Player } from '../types/game';

async function testMechanicsBranches() {
  console.log('🧪 [分支覆蓋] MechanicsEngine 專項測試 (V2.88 修訂版)');

  // --- 1. RP 收益機制 (RP < 50 減半) ---
  console.log('\n[1] RP 收益機制分支:');
  const dummyPlayer: Player = {
    id: 'p1',
    name: 'P1',
    g: 1000,
    rp: 100,
    ip: 0,
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
  };

  // 分支 1: RP >= 50
  dummyPlayer.rp = 50;
  let gain = calculateActualRPGain(dummyPlayer, 33);
  console.log(`  RP=50, 獲得33 -> 結果: ${gain} (預期: 33) => ${gain === 33 ? '✅' : '❌'}`);

  // 分支 2: RP < 50
  dummyPlayer.rp = 49;
  gain = calculateActualRPGain(dummyPlayer, 33); // 33 * 0.5 = 16.5 -> roundUp -> 17
  console.log(`  RP=49, 獲得33 -> 結果: ${gain} (預期: 17) => ${gain === 17 ? '✅' : '❌'}`);

  // --- 2. 起訴機率公式 (V2.88 新公式 + 40 階梯) ---
  console.log('\n[2] 起訴機率公式與 40 階梯下限:');

  // 分支 1: 零黑材料 (恆定 0%)
  dummyPlayer.totalTagsCount = 100;
  dummyPlayer.blackMaterialSources = [];
  dummyPlayer.rp = 0;
  let prob = getIndictmentChance(dummyPlayer);
  console.log(`  零黑材料 -> 機率: ${prob}% (預期: 0%) => ${prob === 0 ? '✅' : '❌'}`);

  // 分支 2: 40 階梯下限測試
  dummyPlayer.blackMaterialSources = [{ tag: 'T', count: 1, actionId: 1, turn: 10 }];
  dummyPlayer.rp = 100;

  dummyPlayer.totalTagsCount = 10;
  prob = getIndictmentChance(dummyPlayer, 10);
  console.log(`  1-40標籤 (10) -> 機率: ${prob}% (預期: 10%) => ${prob === 10 ? '✅' : '❌'}`);

  dummyPlayer.totalTagsCount = 45;
  prob = getIndictmentChance(dummyPlayer, 10);
  console.log(`  41-80標籤 (45) -> 機率: ${prob}% (預期: 20%) => ${prob === 20 ? '✅' : '❌'}`);

  // --- 3. 押注機制分支 ---
  console.log('\n[3] 押注機制分支:');
  const p = { ...dummyPlayer, roles: {} }; // Use a copy for bet tests
  const bet1 = settleBet(p, 'win', true);
  console.log(
    `  下注贏家結果: G+${bet1.gGain} (預期: 0), IP+${bet1.ipGain} (預期: 30), RP+${bet1.rpGain} (預期: 0) => ${bet1.gGain === 0 && bet1.ipGain === 30 && bet1.rpGain === 0 ? '✅' : '❌'}`
  );

  const bet2 = settleBet(p, 'win', false);
  console.log(
    `  下注輸家 (無公關) 結果: G+${bet2.gGain} (預期: 0), IP+${bet2.ipGain} (預期: 0), RP+${bet2.rpGain} (預期: -10) => ${bet2.gGain === 0 && bet2.ipGain === 0 && bet2.rpGain === -10 ? '✅' : '❌'}`
  );

  p.roles = { ...p.roles, pr: 3 };
  const bet3 = settleBet(p, 'win', false);
  console.log(
    `  下注輸家 (公關LV3免責) 結果: G+${bet3.gGain} (預期: 0), IP+${bet3.ipGain} (預期: 0), RP+${bet3.rpGain} (預期: 0) => ${bet3.gGain === 0 && bet3.ipGain === 0 && bet3.rpGain === 0 ? '✅' : '❌'}`
  );

  console.log('\n✅ MechanicsEngine 分支覆蓋測試完成。');
}

testMechanicsBranches().catch(console.error);
