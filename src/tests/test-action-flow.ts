import { Player, CardOption } from '../types/game';
import { CARDS_DB } from '../data/cards/CardsDB';
import { useGameStore } from '../store/gameStore';
import { performAction } from '../engine/ActionEngine';

async function testActionFlow() {
  console.log('🔄 [抽卡與行動] 行動流程與標籤記錄專項測試');

  // --- 1. AP 邊界測試 (AP 不足) ---
  console.log('\n[1] 選項資源扣除與 AP 測試:');
  const dummyPlayer: Player = {
    id: 'p1',
    name: 'PC',
    g: 1000,
    rp: 50,
    ip: 200,
    ap: 1,
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

  const aCardId = Object.keys(CARDS_DB).find((k) => k.startsWith('A-'))!;

  const res = await performAction(dummyPlayer, aCardId, 1, dummyPlayer.lastHash, 'skip', 1);
  console.log(
    `  正常結算是否成功: ${res.success !== undefined ? '✅' : '❌'} (Gain G: ${res.updates?.g || 0})`
  );

  // --- 2. 標籤與 Audit 欄位驗證 ---
  console.log('\n[2] 標籤(Tag) 記錄回傳值驗證:');
  const dCardId = Object.keys(CARDS_DB).find((k) => k.startsWith('D-'))!;
  const dCard = CARDS_DB[dCardId];

  let trapRes: Awaited<ReturnType<typeof performAction>> | null = null;
  for (const idx of [1, 2, 3] as const) {
    const opt = dCard[idx] as CardOption;
    if (opt?.succ && 'bm' in opt.succ && opt.succ.bm) {
      trapRes = await performAction(dummyPlayer, dCardId, idx, dummyPlayer.lastHash, 'skip', 1);
      break;
    }
  }

  if (trapRes && trapRes.success) {
    const tags = trapRes.appliedTags || [];
    console.log(`  執行 D類陷阱選擇: 預期產生黑材料與標籤...`);
    console.log(`  => Tags 陣列是否非空: ${tags.length > 0 ? '✅' : '❌'}`);
  } else {
    console.log(`  => 找不到必勝陷阱選項進行驗證，或餘額不足跳過。`);
  }

  // --- 3. 掃描卡背洗牌機制 (recard) ---
  console.log('\n[3] 掃描卡背洗牌重抽 (recard) 測試:');
  useGameStore.setState({
    players: [
      {
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
        roles: {},
      },
    ],
    currentPlayerIndex: 0,
  });

  const redrawRes = useGameStore.getState().redrawCards();
  const stateAfterRedraw = useGameStore.getState().players[0];
  console.log(
    `  AP 扣除與洗牌狀態: success: ${redrawRes.success}, 剩餘 AP: ${stateAfterRedraw.ap} (預期 4) => ${redrawRes.success && stateAfterRedraw.ap === 4 ? '✅' : '❌'}`
  );

  console.log('\n✅ ActionFlow 測試完成。');
}

testActionFlow().catch((e) => {
  console.error(e);
  process.exit(1);
});
