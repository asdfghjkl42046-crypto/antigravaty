/* eslint-disable @typescript-eslint/no-explicit-any */
import { performAction } from '../engine/GameEngine';
import { Player, ActionResult } from '../types/game';
import { CARDS_DB } from '../data/cards/CardsDB';

const mockPlayer: Player = {
  id: 'p1',
  name: '測試玩家',
  g: 1000,
  rp: 100,
  ip: 0,
  ap: 5,
  blackMaterialSources: [
    { tag: '犯罪1', count: 1, actionId: 101, turn: 1 },
    { tag: '犯罪2', count: 3, actionId: 102, turn: 1 },
  ],
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

async function testESeries() {
  console.log("--- 1. 測試 E-01 選項 1 (bm: 'all', 成功率 60%) ---");
  let result: ActionResult | undefined = undefined;
  for (let i = 0; i < 50; i++) {
    result = (await performAction(mockPlayer, 'E-01', 1, mockPlayer.lastHash, 'skip', 1)) as any;
    if (result?.success) break;
  }

  if (result && result.success) {
    console.log('ActionResult Message:', result.message);
    console.log(
      'Updates.blackMaterialSources (Should be []):',
      result.updates?.blackMaterialSources
    );
    if (result.updates?.blackMaterialSources?.length === 0) {
      console.log('✅ 成功：黑材料已全部移除。');
    } else {
      console.error('❌ 失敗：黑材料未被移除！');
    }
  }

  console.log("\n--- 2. 測試 E-01 失敗 (special: 'sue') ---");
  let failResult: ActionResult | undefined = undefined;
  for (let i = 0; i < 50; i++) {
    failResult = (await performAction(
      mockPlayer,
      'E-01',
      1,
      mockPlayer.lastHash,
      'skip',
      1
    )) as any;
    if (!failResult?.success) break;
  }

  if (failResult && !failResult.success) {
    console.log('Fail Message:', failResult.message);
    console.log('ForcedTrial:', failResult.forcedTrial);
    if (failResult.forcedTrial) {
      console.log('✅ 成功：失敗觸發了強制起訴。');
    } else {
      console.error('❌ 失敗：失敗未觸發強制起訴！');
    }
  }
}

testESeries();
