
import { sha256, alignToTenCeil } from '../src/engine/MathEngine';
import { getRoleLevel, applyPRDiscount, applyAccountantBonus } from '../src/engine/RoleEngine';
import { removeBlackMaterialsByTag } from '../src/engine/PlayerEngine';
import { CourtEngine } from '../src/engine/CourtEngine';
import * as MechanicsEngine from '../src/engine/MechanicsEngine';
import { Player } from '../src/types/game';

async function runFullEngineTest() {
    console.log('🏗️ 啟動「全引擎邏輯穩定性」冒煙測試...');
    
    const mockPlayer: any = {
        id: 'p1',
        name: '測試玩家',
        g: 1000,
        rp: 50,
        ip: 100,
        ap: 10,
        trustFund: 500,
        tags: [{ id: 1, text: '洗錢防制法', isCrime: true, turn: 1, lawCaseIds: ['C-01'] }],
        lastHash: 'GENESIS',
        blackMaterialSources: [{ tag: '洗錢防制法', count: 5, turn: 1, actionId: 1 }],
        roles: { lawyer: 3, cto: 3, pr: 3, accountant: 3 },
        isBankrupt: false
    };

    let errorCount = 0;

    // 1. 測試 MathEngine (雜湊鏈穩定性)
    try {
        console.log('-> 測試 MathEngine...');
        const h1 = await sha256('TEST_DATA_1');
        const h2 = await sha256(h1 + 'TEST_DATA_2');
        if (!h2 || h2.length !== 64) throw new Error('Hash 鏈長度異常');
        if (alignToTenCeil(123.456) !== 130) throw new Error('進位邏輯異常');
    } catch (e) { console.error('MathEngine 失敗'); errorCount++; }

    // 2. 測試 RoleEngine (全天賦疊加)
    try {
        console.log('-> 測試 RoleEngine...');
        const discount = applyPRDiscount(mockPlayer, -20);
        if (discount >= 0) throw new Error('PR 折扣方向錯誤');
        const bonus = applyAccountantBonus(mockPlayer, 'A-01', 100);
        if (bonus <= 100) throw new Error('會計師獎勵未生效');
    } catch (e) { console.error('RoleEngine 失敗'); errorCount++; }

    // 3. 測試 PlayerEngine (邊界標籤清理)
    try {
        console.log('-> 測試 PlayerEngine...');
        const updatedBM = removeBlackMaterialsByTag(mockPlayer, '不存在的標籤', 999);
        if (updatedBM.length !== mockPlayer.blackMaterialSources.length) throw new Error('無效清理導致數據丟失');
    } catch (e) { console.error('PlayerEngine 失敗'); errorCount++; }

    // 4. 測試 CourtEngine (隨機起訴輪盤)
    try {
        console.log('-> 測試 CourtEngine...');
        const victim = CourtEngine.spinRussianRoulette([mockPlayer]);
        if (victim && victim.id !== 'p1') throw new Error('輪盤選取錯誤');
    } catch (e) { console.error('CourtEngine 失敗'); errorCount++; }

    console.log('\n--- 最終報告 ---');
    if (errorCount === 0) {
        console.log('✅ 全引擎邏輯區擬 100% 通過。齒輪已完美對齊。');
        console.log('✨ 現在，我們準備好去讀取「最核心的故事」了。');
    } else {
        console.error(`❌ 發現 ${errorCount} 個邏輯缺陷，必須立即修復。`);
        process.exit(1);
    }
}

runFullEngineTest();
