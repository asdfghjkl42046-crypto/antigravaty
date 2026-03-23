import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tests = [
  'test-mechanics-branches.ts',
  'test-court-branches.ts',
  'test-ending-branches.ts',
  'test-survival-branches.ts',
  'test-card-mechanics.ts',
  'test-roulette-odds.ts',
  'test-role-upgrades.ts',
  'test-action-flow.ts',
  'test-all-cards.ts',
  'test-court-full-flow.ts',
];

async function runAllTests() {
  console.log('🚀 開始執行全分支覆蓋測試套件...\n');

  let failed = 0;

  // 1. 執行後端邏輯測試 (透過 tsx)
  for (const file of tests) {
    try {
      console.log(`=========================================`);
      console.log(`▶ 執行 ${file}`);
      execSync(`npx tsx ${path.join(__dirname, file)}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../../'),
      });
    } catch (error) {
      console.error(`❌ ${file} 執行失敗:`, error);
      failed++;
    }
  }

  console.log(`\n=========================================`);
  if (failed === 0) {
    console.log(`✅ 完美！所有組件與分支測試皆順利通過！`);
    process.exit(0);
  } else {
    console.error(`❌ 發現 ${failed} 個測試模組未通過，請檢查上述輸出。`);
    process.exit(1);
  }
}

runAllTests().catch(console.error);
