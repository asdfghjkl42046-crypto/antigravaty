
import { 
  applyAccountantBonus, 
  applyAccountantCourtDiscount, 
  getWithdrawCaseCost, 
  calculateTrustTransfer 
} from './src/engine/RoleEngine';
import { Player } from './src/types/game';

function runTest() {
  console.log("=== 數值對齊與保底機制測試 ===\n");

  const mockPlayer: any = {
    g: 101,
    roles: { accountant: 3 },
    trustFund: 0,
    consecutiveCleanTurns: 2,
    blackMaterialSources: []
  };

  // 1. 會計師分紅測試
  console.log("1. 會計師分紅 (收益 101 萬 + 10% 進位):");
  const bonusG = applyAccountantBonus(mockPlayer as Player, 'A-01', 101);
  console.log(`   結果: ${bonusG} 萬 (預期: 120 萬)\n`);

  // 2. 罰金減免測試
  console.log("2. 罰金減免 (罰金 31 萬 / 2 進位):");
  const discountFine = applyAccountantCourtDiscount(mockPlayer as Player, 31);
  console.log(`   結果: ${discountFine} 萬 (預期: 20 萬)\n`);

  // 3. 規費保底測試
  console.log("3. 規費保底 (資金 100 萬):");
  const lowCost = getWithdrawCaseCost({ ...mockPlayer, g: 100 } as Player);
  console.log(`   結果: ${lowCost.g} 萬 (預期: 100 萬)`);
  
  console.log("3.1 規費計算 (資金 1000 萬):");
  const highCost = getWithdrawCaseCost({ ...mockPlayer, g: 1000 } as Player);
  console.log(`   結果: ${highCost.g} 萬 (預期: 200 萬)\n`);

  // 4. 海外信託測試
  console.log("4. 海外信託 (現金 125 萬):");
  const trust125 = calculateTrustTransfer({ ...mockPlayer, g: 125 } as Player);
  console.log(`   結果: ${trust125} 萬 (預期: 10 萬)`);

  console.log("4.1 海外信託 (現金 9 萬):");
  const trust9 = calculateTrustTransfer({ ...mockPlayer, g: 9 } as Player);
  console.log(`   結果: ${trust9} 萬 (預期: 0 萬)`);
}

runTest();
