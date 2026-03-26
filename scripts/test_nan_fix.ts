import { calculateConvictionPenalty } from '../src/engine/MechanicsEngine';
import { Player } from '../src/types/game';

const mockPlayer: Player = {
  id: 'test-id',
  name: 'Test Player',
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
  genesisHash: '0',
  lastHash: '0',
  totalIncome: 0,
  totalFinesPaid: 0,
  totalTagsCount: 0,
  hasUsedExtraAppeal: false,
};

console.log('--- Unit Test: NaN Check ---');
try {
  console.log('Executing with netIncome = 500 (Valid)...');
  const result = calculateConvictionPenalty(mockPlayer, 500);
  console.log('Result fine:', result.fine);

  console.log('\nExecuting with netIncome = NaN (Invalid)...');
  calculateConvictionPenalty(mockPlayer, NaN);
  console.log('FAIL: Did not throw for NaN!');
} catch (err: any) {
  if (err.message.includes('[Numerical Check Error]')) {
    console.log('SUCCESS: Caught expected Numerical Check Error!');
    console.log('Error Message:', err.message);
  } else {
    console.log('FAIL: Caught unexpected error:', err.message);
  }
}
console.log('--- Test Finished ---');
