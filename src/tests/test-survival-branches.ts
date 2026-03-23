import { checkBankruptcy } from '../engine/EndingEngine';
import { calculateTrustTransfer } from '../engine/RoleEngine';
import type { Player } from '../types/game';

async function testSurvivalBranches() {
  console.log('🛡️  [分支覆蓋] 生存與破產專項測試');

  const dummyPlayer: Player = {
    id: 'p1',
    name: '玩家1',
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
    roles: {},
  };

  // --- 1. 破產與即死判定 (checkBankruptcy) ---
  console.log('\n[1] 破產與即死判定分支:');

  // 分支 1: RP <= 20 即死
  dummyPlayer.g = 5000;
  dummyPlayer.trustFund = 1000;
  dummyPlayer.rp = 20; // 觸發即死
  let bankrupt = checkBankruptcy(dummyPlayer);
  console.log(
    `  RP=20 (資金充足) -> 判定: ${bankrupt} (預期: true) => ${bankrupt === true ? '✅' : '❌'}`
  );

  // 分支 2: G <= 0 且無信託 -> 破產
  dummyPlayer.rp = 50;
  dummyPlayer.g = 0;
  dummyPlayer.trustFund = 0;
  bankrupt = checkBankruptcy(dummyPlayer);
  console.log(
    `  G=0, 信託=0 -> 判定: ${bankrupt} (預期: true) => ${bankrupt === true ? '✅' : '❌'}`
  );

  // 分支 3: G <= 0 且有信託 -> 信託續命
  dummyPlayer.g = -500;
  dummyPlayer.trustFund = 100;
  bankrupt = checkBankruptcy(dummyPlayer);
  console.log(
    `  G=-500, 信託=100 -> 判定: ${bankrupt} (預期: false) => ${bankrupt === false ? '✅' : '❌'}`
  );

  // 分支 4: 正常存活
  dummyPlayer.g = 10;
  dummyPlayer.trustFund = 0;
  bankrupt = checkBankruptcy(dummyPlayer);
  console.log(
    `  G=10, RP=50 -> 判定: ${bankrupt} (預期: false) => ${bankrupt === false ? '✅' : '❌'}`
  );

  // --- 2. 信託資產自動轉移 (calculateTrustTransfer) ---
  console.log('\n[2] 會計師 LV3 信託資產轉移分支:');

  // 分支 1: 無會計師 LV3
  dummyPlayer.roles = { accountant: 2 };
  dummyPlayer.consecutiveCleanTurns = 5;
  dummyPlayer.g = 1000;
  dummyPlayer.trustFund = 0;
  let transfer = calculateTrustTransfer(dummyPlayer);
  console.log(
    `  無 LV3 會計師 -> 轉移額: ${transfer} (預期: 0) => ${transfer === 0 ? '✅' : '❌'}`
  );

  dummyPlayer.roles = { accountant: 3 };

  // 分支 2: 清白回合不足 2
  dummyPlayer.consecutiveCleanTurns = 1;
  transfer = calculateTrustTransfer(dummyPlayer);
  console.log(
    `  連續清白回合 < 2 -> 轉移額: ${transfer} (預期: 0) => ${transfer === 0 ? '✅' : '❌'}`
  );

  // 分支 3: 符合條件，轉移 10%
  dummyPlayer.consecutiveCleanTurns = 2;
  dummyPlayer.g = 1005; // 10% = 100.5 -> roundUp = 101
  transfer = calculateTrustTransfer(dummyPlayer);
  console.log(
    `  符合條件 G=1005 -> 轉移額: ${transfer} (預期: 101) => ${transfer === 101 ? '✅' : '❌'}`
  );

  // 分支 4: 資金過低 (不會轉出復數或導致 0)
  dummyPlayer.g = 0;
  transfer = calculateTrustTransfer(dummyPlayer);
  console.log(`  資金=0 -> 轉移額: ${transfer} (預期: 0) => ${transfer === 0 ? '✅' : '❌'}`);

  // 分支 5: 信託資金達上限 (上限 1000 萬)
  dummyPlayer.g = 2000; // 10% = 200
  dummyPlayer.trustFund = 900;
  transfer = calculateTrustTransfer(dummyPlayer);
  console.log(
    `  信託距離上限剩 100，應轉 200 -> 實際轉移額: ${transfer} (預期: 100) => ${transfer === 100 ? '✅' : '❌'}`
  );

  dummyPlayer.trustFund = 1000;
  transfer = calculateTrustTransfer(dummyPlayer);
  console.log(`  信託已滿上限 -> 轉移額: ${transfer} (預期: 0) => ${transfer === 0 ? '✅' : '❌'}`);

  console.log('\n✅ 生存與破產分支覆蓋測試完成。');
}

testSurvivalBranches().catch(console.error);
