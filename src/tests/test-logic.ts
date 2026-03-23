/**
 * V1.0 法律邏輯自動化驗證測試 (A-01 ~ A-18 穩定版)
 * 驗證目標：
 * 1. Hard Link (winning_keywords) -> 直接 100% 勝訴
 * 2. Soft Link (soft_keywords) -> 基礎勝率 +20%
 * 3. 封頂機制 -> 勝率不可超過 1.0 (Math.min)
 *
 * 執行指令：npx tsx src/tests/test-logic.ts
 */

import { LAW_CASES_DB } from '../data/laws/LawCasesDB';
import { CourtEngine } from '../engine/CourtEngine';
import { Player } from '../types/game';

async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('   《創業冒險：現代法律篇》V1.0 法律關鍵字驗證系統');
  console.log('═'.repeat(60) + '\n');

  // 建立標準測試玩家 (RP=100 以利觀察加成)
  const player: Player = {
    id: 'test-player',
    name: '法庭測試員',
    g: 5000,
    rp: 100, // RP 100 -> +50% 加成
    ip: 0,
    ap: 5,
    // roles: undefined (測試開局無人狀態)
    tags: [],
    blackMaterialSources: [],
    trustFund: 0,
    isBankrupt: false,
    consecutiveCleanTurns: 0,
    totalTrials: 0,
    totalFinesPaid: 0,
    skipNextCard: false,
    genesisHash: 'test-genesis',
    lastHash: 'test-last',
    totalIncome: 0,
    hasUsedExtraAppeal: false,
    totalTagsCount: 0,
  };

  let passCount = 0;
  let failCount = 0;

  const caseIds = Object.keys(LAW_CASES_DB).sort();

  for (const caseId of caseIds) {
    const lawCase = LAW_CASES_DB[caseId];
    console.log(`\n📂 測試案件 [${caseId}]：${lawCase.tag}`);

    // --- 測試 1：Hard Link (100% 勝訴) ---
    if (lawCase.winning_keywords && lawCase.winning_keywords.length > 0) {
      const keyword = lawCase.winning_keywords[0];
      const result = CourtEngine.calculateDefenseResult(
        player,
        lawCase,
        `這是關於${keyword}的辯護`
      );

      if (result.isSuccess && result.rate === 1.0) {
        console.log(`  ✅ [Hard Link] 命中 "${keyword}"：判定通過 (100%)`);
        passCount++;
      } else {
        console.error(`  ❌ [Hard Link] 命中 "${keyword}"：判定失敗 (Rate: ${result.rate})`);
        failCount++;
      }
    }

    // --- 測試 2：Soft Link (+20% 權重) ---
    if (lawCase.soft_keywords && lawCase.soft_keywords.length > 0) {
      const softKeyword = lawCase.soft_keywords[0];
      const result = CourtEngine.calculateDefenseResult(
        player,
        lawCase,
        `關於${softKeyword}的說明`
      );

      // 計算預期機率：Base (lawCase.survival_rate || 0.2) + Soft (+0.2)
      const expectedBase = lawCase.survival_rate || 0.2;
      const expectedFinal = Math.min(expectedBase + 0.2, 1.0);

      // 容許浮點數誤差 0.001
      if (Math.abs(result.rate - expectedFinal) < 0.001) {
        console.log(
          `  ✅ [Soft Link] 命中 "${softKeyword}"：增益通過 (Rate: ${result.rate.toFixed(2)})`
        );
        passCount++;
      } else {
        console.error(
          `  ❌ [Soft Link] 命中 "${softKeyword}"：增益錯誤 (實際: ${result.rate}, 預期: ${expectedFinal})`
        );
        failCount++;
      }
    }

    // --- 測試 3：封頂機制 (不命中時是否正確運算) ---
    const wrongResult = CourtEngine.calculateDefenseResult(
      player,
      lawCase,
      '這是一段完全無關的內容'
    );
    const expectedWrong = Math.min(lawCase.survival_rate || 0.2, 1.0);

    if (Math.abs(wrongResult.rate - expectedWrong) < 0.001) {
      console.log(`  ✅ [Base Rate] 無命中測試通過 (Rate: ${wrongResult.rate.toFixed(2)})`);
      passCount++;
    } else {
      console.error(
        `  ❌ [Base Rate] 無命中測試失敗 (實際: ${wrongResult.rate}, 預期: ${expectedWrong})`
      );
      failCount++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`   測試總結：通過 ${passCount} | 失敗 ${failCount}`);
  console.log('═'.repeat(60) + '\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
