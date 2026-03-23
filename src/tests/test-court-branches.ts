import { CourtEngine } from '../engine/CourtEngine';
import { calculateConvictionPenalty } from '../engine/MechanicsEngine';
import type { Player } from '../types/game';

async function testCourtBranches() {
  console.log('⚖️  [分支覆蓋] CourtEngine 專項測試 (V2.88 修訂版)');

  const dummyPlayer: Player = {
    id: 'p1',
    name: 'PC',
    g: 1000,
    rp: 100,
    ip: 10,
    ap: 5,
    tags: [
      {
        id: 99,
        turn: 1,
        text: '測試法案',
        netIncome: 0,
        hash: 'x',
        isResolved: false,
        timestamp: '',
        isCrime: true,
      },
    ],
    blackMaterialSources: [{ tag: '測試法案', count: 1, actionId: 99, turn: 1 }],
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

  // --- 1. 罰金倍率 (GEMINI.md §2-2) ---
  console.log('\n[1] 罰金倍率測試:');
  dummyPlayer.totalTrials = 1;
  let penalty = calculateConvictionPenalty(dummyPlayer, 200);
  console.log(
    `  被告 1 次 (1.0x) -> 罰金: ${penalty.fine} (預期: 600) => ${penalty.fine === 600 ? '✅' : '❌'}`
  );

  dummyPlayer.totalTrials = 4;
  penalty = calculateConvictionPenalty(dummyPlayer, 200);
  console.log(
    `  被告 4 次 (3.0x) -> 罰金: ${penalty.fine} (預期: 1800) => ${penalty.fine === 1800 ? '✅' : '❌'}`
  );

  dummyPlayer.totalTrials = 7;
  penalty = calculateConvictionPenalty(dummyPlayer, 200);
  console.log(
    `  被告 7 次 (6.0x) -> 罰金: ${penalty.fine} (預期: 3600) => ${penalty.fine === 3600 ? '✅' : '❌'}`
  );

  // --- 2. 撤告機制 (GEMINI.md §4-1) ---
  console.log('\n[2] 撤告機制驗證:');
  dummyPlayer.g = 1000;
  dummyPlayer.ip = 10;
  const result = CourtEngine.applyWithdrawCase(dummyPlayer, '測試法案', 99);
  const updates = result.updates;
  console.log(
    `  撤告 G扣20% (1000->800) -> 餘裕 G: ${updates.g} (預期: 800) => ${updates.g === 800 ? '✅' : '❌'}`
  );
  console.log(
    `  撤告 IP扣5 (10->5) -> 餘裕 IP: ${updates.ip} (預期: 5) => ${updates.ip === 5 ? '✅' : '❌'}`
  );
  console.log(
    `  撤告後 BM -> ${updates.blackMaterialSources?.length} (預期: 0) => ${updates.blackMaterialSources?.length === 0 ? '✅' : '❌'}`
  );
  console.log(
    `  撤告後 Tag Resolved -> ${updates.tags?.[0].isResolved} (預期: true) => ${updates.tags?.[0].isResolved === true ? '✅' : '❌'}`
  );

  console.log('\n✅ CourtEngine 分支覆蓋測試完成。');
}

testCourtBranches().catch(console.error);
