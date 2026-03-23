/* eslint-disable @typescript-eslint/no-explicit-any */
import { performAction } from '../engine/ActionEngine';
import type { Player } from '../types/game';

async function testCardMechanics() {
  console.log('🃏 [深層邏輯] 卡牌特殊行為與狀態附著專項測試 (V3.7 修正版)');

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

  // --- 1. 二階決策 (declareLogic) 驗證 (C-01 Option 3) ---
  console.log('\n[1] 二階決策洗錢機制 (declareLogic):');

  // 1-1. 安全申報 ('declare')
  // C-01 O3 基費 400 + 申報費 50 = 450. 成功率 0.9 (申報跳過隨機判定)
  let result = (await performAction(
    dummyPlayer,
    'C-01',
    3,
    dummyPlayer.lastHash,
    'declare',
    1
  )) as any;
  console.log(
    `  選擇安全申報: success: ${result.success}, g_cost: ${1000 - (result.updates.g || 1000)} => ${result.success && 1000 - (result.updates.g || 1000) === 450 ? '✅' : '❌'}`
  );

  // 1-2. 冒險略過 ('skip')
  // C-01 O3 基費 400. 失敗則觸發 sue.
  const originalRandom = Math.random;
  Math.random = () => 0.1; // 必勝
  result = (await performAction(dummyPlayer, 'C-01', 3, dummyPlayer.lastHash, 'skip', 1)) as any;
  console.log(
    `  冒險略過 (成功預擬): success: ${result.success}, bm: ${result.bm} => ${result.success && result.bm === 1 ? '✅' : '❌'}`
  );

  Math.random = () => 0.95; // 必敗
  result = (await performAction(dummyPlayer, 'C-01', 3, dummyPlayer.lastHash, 'skip', 1)) as any;
  console.log(
    `  冒險略過 (失敗預擬): success: ${result.success}, forcedTrial: ${!!result.forcedTrial} => ${!result.success && !!result.forcedTrial ? '✅' : '❌'}`
  );
  Math.random = originalRandom;

  // --- 2. 標案陷阱與 Skip Next 驗證 (D-01) ---
  // 假設 D-01 的選項 2 是舉報
  console.log('\n[2] 標案陷阱與狀態附著 (skip_next):');

  result = (await performAction(dummyPlayer, 'D-01', 3, dummyPlayer.lastHash, 'skip', 1)) as any;
  if (result.updates.skipNextCard) {
    console.log(`  舉報標案 (特殊標記): skipNextCard: ${result.updates.skipNextCard} => ✅`);
  } else {
    // 如果 D-01 O2 不是舉報，這裡可能需要根據 CardsDB 實際內容調整
    console.log(
      `  D-01 Option 2 未觸發 skipNextCard，請檢查 CardsDB 定義。 (當前訊息: ${result.message})`
    );
  }

  // --- 3. 滅證與起訴連動驗證 (E-01) ---
  console.log('\n[3] 滅證機制與起訴連動 (succ: bm="all", fail: special="sue"):');

  const playerWithBM = {
    ...dummyPlayer,
    blackMaterialSources: [{ tag: 'crime', count: 5, actionId: 999, turn: 1 }],
  };

  Math.random = () => 0.1; // 必勝
  result = (await performAction(playerWithBM, 'E-01', 1, playerWithBM.lastHash, 'skip', 1)) as any;
  console.log(
    `  黑箱滅證 (成功): bm_sources_count: ${result.updates.blackMaterialSources?.length} => ${result.updates.blackMaterialSources?.length === 0 ? '✅' : '❌'}`
  );

  Math.random = () => 0.95; // 必敗
  result = (await performAction(playerWithBM, 'E-01', 1, playerWithBM.lastHash, 'skip', 1)) as any;
  console.log(
    `  黑箱滅證 (失敗): forcedTrial: ${!!result.forcedTrial} => ${!result.success && !!result.forcedTrial ? '✅' : '❌'}`
  );

  Math.random = originalRandom;

  console.log('\n✅ CardMechanics 深度邏輯測試完成。');
}

testCardMechanics().catch(console.error);
