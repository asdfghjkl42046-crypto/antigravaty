/* eslint-disable @typescript-eslint/no-explicit-any */
import { performAction } from '../engine/GameEngine';
import { Player } from '../types/game';

const mockPlayer: Player = {
  id: 'p1',
  name: '測試玩家',
  g: 1000,
  rp: 100,
  ip: 0,
  ap: 5,
  blackMaterialSources: [],
  tags: [],
  trustFund: 0,
  totalTrials: 0,
  isBankrupt: false,
  skipNextCard: false,
  consecutiveCleanTurns: 0,
  genesisHash: 'GENESIS',
  lastHash: 'GENESIS',
  totalIncome: 0,
  totalFinesPaid: 0,
  hasUsedExtraAppeal: false,
  totalTagsCount: 0,
};

async function testSkipNext() {
  console.log('--- 1. 執行 D-01 選項 3 (觸發 skipNextCard) ---');
  const result1 = (await performAction(
    mockPlayer,
    'D-01',
    3,
    mockPlayer.lastHash,
    'skip',
    1
  )) as any;
  console.log('Result 1 Message:', result1.message);
  console.log('Updates.skipNextCard:', result1.updates.skipNextCard);

  if (result1.updates.skipNextCard !== true) {
    console.error('❌ 失敗：D-01 選項 3 未觸發 skipNextCard 標記！');
    return;
  }

  // 更新模擬玩家狀態
  const updatedPlayer = { ...mockPlayer, ...result1.updates };
  console.log('\n--- 2. 執行下一張卡片 (應被跳過) ---');
  const result2 = (await performAction(
    updatedPlayer,
    'A-01',
    1,
    updatedPlayer.lastHash,
    'skip',
    1
  )) as any;
  console.log('Result 2 Message:', result2.message);
  console.log('Result 2 Success:', result2.success);
  console.log('Updates After Skip (skipNextCard should be false):', result2.updates.skipNextCard);

  if (result2.success === true) {
    console.error('❌ 錯誤：skipNextCard 為 true，但動作仍成功執行了！');
  } else {
    console.log('✅ 成功：動作已被跳過。');
  }
}

testSkipNext();
