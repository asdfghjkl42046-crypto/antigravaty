import { CourtEngine } from '../engine/CourtEngine';
import type { Player, LawCase } from '../types/game';

async function testSpectatorInfluence() {
  console.log('⚖️ [法庭專項] 旁觀者（支持/陷害）機制測試');

  const dummyPlayer: Player = {
    id: 'p1',
    name: 'PC',
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

  const dummyCase: LawCase = {
    id: 'T-01',
    tag: '測試法案',
    lawName: '測試案件',
    surface_term: '法律外殼',
    hidden_intent: '指控動機',
    evidence_list: [],
    survival_rate: 0.5, // 基礎 50%
    rp_recovery: 20,
    winning_keywords: [],
    soft_keywords: [],
  };

  // 1. 基報測試 (無影響)
  let res = CourtEngine.calculateDefenseResult(dummyPlayer, dummyCase, '測試答辯', 0);
  console.log(`  無影響: rate: ${res.rate} (預期: 0.5) => ${res.rate === 0.5 ? '✅' : '❌'}`);

  // 2. 支持測試 (+10% x 2人)
  res = CourtEngine.calculateDefenseResult(dummyPlayer, dummyCase, '測試答辯', 0.2);
  console.log(
    `  2人支持 (+20%): rate: ${res.rate} (預期: 0.7) => ${res.rate === 0.7 ? '✅' : '❌'}`
  );

  // 3. 陷害測試 (-10% x 3人)
  res = CourtEngine.calculateDefenseResult(dummyPlayer, dummyCase, '測試答辯', -0.3);
  console.log(
    `  3人陷害 (-30%): rate: ${res.rate} (預期: 0.2) => ${Math.abs(res.rate - 0.2) < 0.001 ? '✅' : '❌'}`
  );

  // 4. 邊界測試 (低於 0)
  res = CourtEngine.calculateDefenseResult(dummyPlayer, dummyCase, '測試答辯', -0.8);
  console.log(
    `  過度陷害 (低於 0): rate: ${res.rate} (預期: 0) => ${res.rate === 0 ? '✅' : '❌'}`
  );

  console.log('\n✅ 旁觀者影響機制測試完成。');
}

testSpectatorInfluence().catch(console.error);
