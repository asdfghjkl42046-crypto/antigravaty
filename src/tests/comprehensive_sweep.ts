import { webcrypto } from 'node:crypto';
if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto = webcrypto;
}

import {
  performAction,
  initializeGameSession,
  CourtEngine,
  getTotalBlackMaterials,
  sortTurnOrder,
} from '../engine/GameEngine';
import { CARDS_DB } from '../data/cards/CardsDB';
import { Player, Tag } from '../types/game';

// 建立一個可以「強制隨機結果」的測試用 performAction 封裝
// 注意：我們需要修改 ActionEngine 才能強制失敗，但在這裡我們可以透過模擬多輪或檢查邏輯
// 為了真正實現「窮舉」，我們直接測試 ActionEngine 的內部結算邏輯。

async function runComprehensiveSweep() {
  console.log(`\n>>> 啟動全量卡牌分支窮舉測試 <<<`);

  const { players: initialPlayers, judgePersonality } = await initializeGameSession(
    [{ name: 'TestBot', path: 'normal' }],
    sortTurnOrder
  );
  const basePlayer = initialPlayers[0];

  const cardIds = Object.keys(CARDS_DB);
  let totalScanned = 0;
  let errorsFound = 0;

  for (const cardId of cardIds) {
    const card = CARDS_DB[cardId];
    // 遍歷 3 個選項
    for (const optIdx of [1, 2, 3] as const) {
      const opt = (card as any)[optIdx];
      if (!opt) continue;

      // 遍歷 申報/略過
      for (const choice of ['declare', 'skip'] as const) {
        // 為了測試 N+1，我們測試 0 位 CTO 與 2 位 CTO 的情況
        for (const ctoCount of [0, 2]) {
          try {
            // 執行模擬
            const result = await performAction(
              { ...basePlayer },
              cardId,
              optIdx,
              basePlayer.lastHash,
              choice,
              1,
              ctoCount
            );

            // 建立更新後的玩家物件
            const updatedPlayer: Player = {
              ...basePlayer,
              ...result.updates,
              tags: [...basePlayer.tags, ...result.hashedTags],
              lastHash: result.finalHash,
            };

            // 模擬法庭映射檢查
            if (result.hashedTags.length > 0) {
              result.hashedTags.forEach((t: Tag) => {
                if (!t.lawCaseIds || t.lawCaseIds.length === 0) {
                  throw new Error(
                    `[Data Error] ${cardId} Option ${optIdx} choice ${choice}: Tag ${t.text} has no lawCaseIds`
                  );
                }
              });

              // 模擬起訴啟動
              const testTagId = result.hashedTags[0].id;
              try {
                CourtEngine.prepareTrial(
                  [updatedPlayer],
                  updatedPlayer.id,
                  'website',
                  judgePersonality,
                  testTagId,
                  true,
                  'Testing Sweep'
                );
              } catch (e: any) {
                throw new Error(
                  `[Trial Prep Failed] ${cardId} Option ${optIdx} choice ${choice}: ${e.message}`
                );
              }
            }

            totalScanned++;
          } catch (err: any) {
            console.error(
              `[CRITICAL] Error at Card:${cardId}, Option:${optIdx}, Choice:${choice}, CTO:${ctoCount}`
            );
            console.error(`          Message: ${err.message}`);
            errorsFound++;
          }
        }
      }
    }
  }

  console.log(`\n>>> 掃描完成 <<<`);
  console.log(`總計掃描分支數: ${totalScanned}`);
  console.log(`發現錯誤數: ${errorsFound}`);

  if (errorsFound > 0) {
    process.exit(1);
  }
}

runComprehensiveSweep();
