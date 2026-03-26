import { CourtEngine } from '../engine/CourtEngine';
import { Player } from '../types/game';

async function testCourtInitialization() {
  console.log('⚖️ [法庭初始化驗證] CourtEngine 異常攔截測試');

  const dummyPlayers: Player[] = [
    {
      id: 'p1',
      name: '玩家1',
      g: 1000,
      rp: 50,
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
    },
  ];

  // --- 1. 測試：找不到被告 ---
  console.log('\n[1] 測試找不到被告:');
  try {
    CourtEngine.prepareTrial(dummyPlayers, 'p2', 'website', 'traditionalist');
    console.log('  ❌ 錯誤：未攔截到不存在的被告 ID');
  } catch (e: any) {
    console.log(`  ✅ 成功攔截報錯: ${e.message}`);
  }

  // --- 2. 測試：強制起訴但全場無黑料 ---
  console.log('\n[2] 測試強制起訴但全場無黑料:');
  try {
    // isInevitable = true
    CourtEngine.prepareTrial(dummyPlayers, 'p1', 'website', 'traditionalist', undefined, true);
    console.log('  ❌ 錯誤：未攔截到全場無黑料的強制起訴');
  } catch (e: any) {
    console.log(`  ✅ 成功攔截報錯: ${e.message}`);
  }

  // --- 3. 測試：常規起訴但全場無黑料 (應該回傳 null 而非報錯) ---
  console.log('\n[3] 測試常規起訴但全場無黑料:');
  const res = CourtEngine.prepareTrial(
    dummyPlayers,
    'p1',
    'website',
    'traditionalist',
    undefined,
    false
  );
  if (res === null) {
    console.log('  ✅ 成功：常規流程回傳 null 表示取消起訴');
  } else {
    console.log('  ❌ 錯誤：常規流程未正確回傳 null');
  }

  console.log('\n✨ [法庭初始化驗證] 所有測試完成。');
}

testCourtInitialization().catch(console.error);
