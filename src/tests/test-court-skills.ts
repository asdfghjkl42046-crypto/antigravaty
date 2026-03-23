import { createInitialPlayer, CourtEngine } from '../engine/GameEngine';
import { LAW_CASES_DB } from '../data/laws/LawCasesDB';

async function testCourtSkills() {
  console.log('🧪 正在測試法庭防禦邏輯 (關鍵詞 & 王牌律師救濟)...');

  const player = await createInitialPlayer('測試企業', 'normal');
  const lawCase = LAW_CASES_DB['LC-A01'];

  // --- 測試 1: 關鍵詞自動勝訴 ---
  console.log('\n[測試 1] 關鍵詞自動勝訴判定:');
  const result1 = CourtEngine.calculateDefenseResult(
    player,
    lawCase,
    '我們當時正在進行緊急維護，這是有紀錄的。'
  );
  console.log(`  輸入文本: "我們當時正在進行緊急維護..."`);
  console.log(`  預期結果: 勝訴 (關鍵詞匹配)`);
  console.log(`  實際結果: ${result1.isSuccess ? '✅ 勝訴' : '❌ 敗訴'}`);

  // --- 測試 2: 王牌律師 LV1 首次判定驗證 ---
  console.log('\n[測試 2] 王牌律師 LV1 (首次判定不加成):');
  player.roles = { ...(player.roles || {}), lawyer: 1 };
  player.rp = 0;
  // baseSurvival 为 0.25 (LC-A01)
  const result2 = CourtEngine.calculateDefenseResult(player, lawCase, '純屬巧合。');
  console.log(`  預計首次勝率: 0.25 (25%)`);
  console.log(`  實際結果: ${result2.isSuccess ? '✅ 勝訴' : '❌ 敗訴'} (率: ${result2.rate})`);

  // --- 測試 3: 王牌律師 LV1 (單次加成驗證) ---
  console.log('\n[測試 3] 王牌律師 LV1 單次加成 (1000次抽樣):');
  // 總預期勝率 = 0.25 (基礎) + 0.3 (律師彈性加成) = 0.55 (約 55%)
  let successes = 0;
  for (let i = 0; i < 1000; i++) {
    const r = CourtEngine.calculateDefenseResult(player, lawCase, '我無話可說。');
    if (r.isSuccess) {
      successes++;
    }
  }
  console.log(`  律師加成機制 (25% 基礎 + 30% 律師加成)`);
  console.log(`  預期總勝率: ~55.0%`);
  console.log(`  實際總勝率: ${((successes / 1000) * 100).toFixed(1)}%`);

  // --- 測試 4: 無律師技能 ---
  console.log('\n[測試 4] 無律師技能 (1000次抽樣):');
  player.roles = { ...(player.roles || {}), lawyer: 0 };
  let successesNoSkill = 0;
  for (let i = 0; i < 1000; i++) {
    const r = CourtEngine.calculateDefenseResult(player, lawCase, '無。');
    if (r.isSuccess) successesNoSkill++;
  }
  console.log(`  無額外加成`);
  console.log(`  預期勝率: 25%`);
  console.log(`  實際勝率: ${((successesNoSkill / 1000) * 100).toFixed(1)}%`);

  console.log('\n✅ 測試完成');
}

testCourtSkills().catch(console.error);
