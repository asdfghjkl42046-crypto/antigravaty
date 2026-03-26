import {
  getLawyerDefenseBonus,
  applyPRDiscount,
  applyPRCourtDiscount,
  applyAccountantBonus,
  applyAccountantCourtDiscount,
  calculateTrustTransfer,
  getCTOAutoIncome,
  getCTOAntiTheftCount
} from '../engine/RoleEngine';
import { Player } from '../types/game';

const mockPlayer: Player = {
  id: 'test-p1',
  name: 'Test Boss',
  g: 1000,
  ip: 100,
  rp: 50,
  ap: 5,
  tags: [],
  roles: {},
  startPath: 'normal',
  consecutiveCleanTurns: 0,
  trustFund: 0,
  lastHash: 'HASH-0'
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
}

async function runSkillSweep() {
  console.log('>>> 啟動技能觸發全量窮舉審計 (Skill Audit Sweep) <<<');

  // --- 1. 律師 (Lawyer) ---
  console.log('\n[TEST] 律師技能組合...');
  const pLawyer0 = { ...mockPlayer, roles: { lawyer: 0 } };
  const pLawyer1 = { ...mockPlayer, roles: { lawyer: 1 } };
  assert(getLawyerDefenseBonus(pLawyer0) === 0, 'LV0 律師勝率加成應為 0');
  assert(getLawyerDefenseBonus(pLawyer1) === 0.3, 'LV1 律師勝率加成應為 +30%');

  // --- 2. 會計師 (Accountant) ---
  console.log('[TEST] 會計師技能組合...');
  const pAcc0 = { ...mockPlayer, roles: { accountant: 0 }, g: 1000 };
  const pAcc1 = { ...mockPlayer, roles: { accountant: 1 }, g: 1000 };
  const pAcc2 = { ...mockPlayer, roles: { accountant: 2 }, g: 1000 };
  const pAcc3 = { ...mockPlayer, roles: { accountant: 3 }, g: 1000, consecutiveCleanTurns: 2, trustFund: 0 };

  assert(applyAccountantBonus(pAcc0, 'A-01', 100) === 100, 'LV0 會計師不應有利潤加成');
  assert(applyAccountantBonus(pAcc1, 'A-01', 100) === 110, 'LV1 會計師應有 10% 利潤加成');
  assert(applyAccountantCourtDiscount(pAcc0, 300) === 300, 'LV0 會計師不應有罰金減免');
  assert(applyAccountantCourtDiscount(pAcc2, 300) === 150, 'LV2 會計師應有 50% 罰金減免');
  assert(calculateTrustTransfer(pAcc3) === 100, 'LV3 會計師應能將 10% 現金轉入信託 (1000 * 0.1)');

  // --- 3. 公關經理 (PR) ---
  console.log('[TEST] 公關經理技能組合...');
  const pPR0 = { ...mockPlayer, roles: { pr: 0 } };
  const pPR1 = { ...mockPlayer, roles: { pr: 1 } };
  const pPR2 = { ...mockPlayer, roles: { pr: 2 } };

  assert(applyPRDiscount(pPR0, -20) === -20, 'LV0 公關不應有 RP 損失減免');
  // 注意：applyPRDiscount 內部對負值進行處理
  assert(applyPRDiscount(pPR1, -20) === -10, 'LV1 公關應有 50% RP 損失減免');
  assert(applyPRCourtDiscount(pPR2, 40) === 20, 'LV2 公關應有 50% 法庭 RP 罰則減免');

  // --- 4. 技術長 (CTO) ---
  console.log('[TEST] 技術長技能組合...');
  const pCTO0 = { ...mockPlayer, roles: { cto: 0 } };
  const pCTO2 = { ...mockPlayer, roles: { cto: 2 } };
  
  assert(getCTOAutoIncome(pCTO0) === 0, 'LV0 CTO 不應有自動收入');
  assert(getCTOAutoIncome(pCTO2) === 100, 'LV2 CTO 應有 100G 自動收入');

  // CTO 標籤倍增測試 (1+N)
  const allPlayers = [
    { ...mockPlayer, id: 'p1', roles: { cto: 3 } },
    { ...mockPlayer, id: 'p2', roles: { cto: 3 } },
    { ...mockPlayer, id: 'p3', roles: { cto: 0 } }
  ] as Player[];
  const n = getCTOAntiTheftCount(allPlayers, 'p3'); // p3 行動，p1, p2 有 CTO LV3
  assert(n === 2, '應偵測到 2 名技術長');
  const multiplier = 1 + n;
  assert(multiplier === 3, '標籤倍率應為 3 倍');

  console.log('\n>>> 技能全量窮舉審計通過！所有數值邏輯符合預期。 <<<');
}

runSkillSweep().catch(e => {
  console.error(`[CRITICAL AUDIT ERROR] ${e.message}`);
  process.exit(1);
});
