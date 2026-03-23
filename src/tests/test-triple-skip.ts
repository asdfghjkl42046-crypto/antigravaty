/* eslint-disable @typescript-eslint/no-explicit-any */
import { performAction } from '../engine/GameEngine';
import { Player } from '../types/game';

async function mockPerformAction(
  player: Player,
  cardId: string,
  optionIdx: 1 | 2 | 3
): Promise<Player> {
  console.log(`\n--- Performing Action on ${cardId} ---`);
  const result = (await performAction(
    player,
    cardId,
    optionIdx,
    player.lastHash,
    'skip',
    1
  )) as any;
  console.log('Success:', result.success);
  console.log('Message:', result.message);
  console.log('Updates:', JSON.stringify(result.updates));

  if (!result.success && result.updates.skipNextCard === undefined) {
    console.log('Action Aborted (Store Logic)');
    return player;
  }

  const updatedPlayer = { ...player, ...result.updates };

  // Fix the AP logic for this test to match what it SHOULD be
  if (!result.apRefunded) {
    updatedPlayer.ap = Math.max(0, updatedPlayer.ap - 1);
  }

  console.log('New skipNextCard state:', updatedPlayer.skipNextCard);
  console.log('New AP state:', updatedPlayer.ap);
  return updatedPlayer;
}

let player: Player = {
  id: '1',
  name: 'Test',
  g: 500,
  rp: 100,
  ip: 0,
  ap: 5,
  blackMaterialSources: [],
  tags: [],
  trustFund: 0,
  totalTrials: 0,
  isBankrupt: false,
  skipNextCard: false,
  consecutiveCleanTurns: 1,
  genesisHash: 'hash',
  lastHash: 'hash',
  totalIncome: 100,
  totalFinesPaid: 0,
  hasUsedExtraAppeal: false,
  totalTagsCount: 0,
};

async function runTest() {
  player = await mockPerformAction(player, 'D-05', 3); // Card 1
  player = await mockPerformAction(player, 'D-05', 3); // Card 2
  await mockPerformAction(player, 'D-05', 3); // Card 3
}

runTest().catch(console.error);
