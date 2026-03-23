/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  performAction,
  getIndictmentChance,
  createInitialPlayer,
  calculateConvictionPenalty,
} from '../engine/GameEngine';
import { Player } from '../types/game';

// 模擬玩家
const mockPlayer: Player = {
  id: 'p1',
  name: '測試玩家',
  g: 100,
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

async function testAction() {
  console.log('--- 測試 A-01 選項 3 (應獲得 IP) ---');
  // A-01 選項 3: { g: 80, rp: 2 } ... wait, CardsDB 裡的 A-01-3 竟然沒寫 IP!
  // 讓我們找一個有寫 IP 的卡片。
  // B-08 選項 1: { ip: 30, rp: -8, bm: 1 ... }

  const result = (await performAction(
    mockPlayer,
    'B-08',
    1,
    mockPlayer.lastHash,
    'skip',
    1
  )) as any;
  console.log('ActionResult Message:', result.message);
  console.log('Updates:', JSON.stringify(result.updates, null, 2));

  if (result.updates.ip === undefined) {
    console.error('❌ 錯誤：Updates 中缺少 IP 欄位！');
  } else {
    console.log('✅ 成功：IP 已更新為', result.updates.ip);
  }

  console.log('\n--- 測試 RP < 50 收益不減半 (新規則) ---');
  const poorPlayer = { ...mockPlayer, rp: 40 };
  // D-01 選項 2: type: 'A', succRate: 0.9, succ: { g: 100, rp: 2 }
  // 依據最新指令，資金收益不再減半，預計收益應為 100
  const result2 = (await performAction(
    poorPlayer,
    'D-01',
    2,
    poorPlayer.lastHash,
    'skip',
    1
  )) as any;
  if (result2.updates.g !== undefined) {
    const gain = result2.updates.g - poorPlayer.g;
    console.log(`RP 40 時 D-01-2 收益: ${gain} (預期應為 100)`);
    if (gain === 100) console.log('✅ 收益不減半邏輯正確');
    else console.error('❌ 收益邏輯錯誤');
  }

  // 檢查 BM 回傳
  console.log('\n--- 測試 BM 回傳 ---');
  console.log('BM count in result:', result.bm);
}

testAction();
