import { applyRoleUpgrade } from '../engine/RoleEngine';
import type { Player } from '../types/game';

async function testRoleUpgrades() {
  console.log('📈 [深層邏輯] 角色升級與資源開銷測試');

  let dummyPlayer: Player = {
    id: 'p1',
    name: 'PC',
    g: 1000,
    rp: 50,
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
    roles: { lawyer: 0 },
  };

  console.log('\n[1] 升級成功與資源扣除 (100 IP + 100萬 G):');

  const result = applyRoleUpgrade(dummyPlayer, 'lawyer');
  console.log(
    `  LV0 -> LV1 成功: ${result.success} (預期: true) => ${result.success ? '✅' : '❌'}`
  );

  // 套用變更
  if (result.updates) {
    dummyPlayer = { ...dummyPlayer, ...result.updates };
  }

  console.log(`  剩餘 IP: ${dummyPlayer.ip} (預期 100) => ${dummyPlayer.ip === 100 ? '✅' : '❌'}`);
  console.log(`  剩餘 G: ${dummyPlayer.g} (預期 900) => ${dummyPlayer.g === 900 ? '✅' : '❌'}`);
  console.log(
    `  律師等級: ${dummyPlayer.roles?.lawyer} (預期 1) => ${dummyPlayer.roles?.lawyer === 1 ? '✅' : '❌'}`
  );

  console.log('\n[2] 資金/IP 不足:');
  dummyPlayer.ip = 90; // 不足 100
  let failResult = applyRoleUpgrade(dummyPlayer, 'lawyer');
  console.log(
    `  IP=90 時升級成功: ${failResult.success} (預期: false) => ${!failResult.success ? '✅' : '❌'}`
  );

  dummyPlayer.ip = 200;
  dummyPlayer.g = 90; // 不足 100
  failResult = applyRoleUpgrade(dummyPlayer, 'lawyer');
  console.log(
    `  G=90 時升級成功: ${failResult.success} (預期: false) => ${!failResult.success ? '✅' : '❌'}`
  );

  console.log('\n[3] 滿等限制 (上限 LV3):');
  // 復原資金並強設為 LV3
  dummyPlayer.g = 1000;
  dummyPlayer.ip = 1000;
  dummyPlayer.roles = { lawyer: 3 };

  failResult = applyRoleUpgrade(dummyPlayer, 'lawyer');
  console.log(
    `  LV3 時升級成功: ${failResult.success} (預期: false) => ${!failResult.success ? '✅' : '❌'}`
  );

  console.log('\n✅ RoleUpgrades 測試完成。');
}

testRoleUpgrades().catch(console.error);
