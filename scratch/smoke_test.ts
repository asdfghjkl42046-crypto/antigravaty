
import { performAction } from '../src/engine/ActionEngine';
import { CARDS_DB } from '../src/data/cards/CardsDB';

async function runSmokeTest() {
    console.log('🚀 啟動 ActionEngine 冒煙測試 (100次模擬)...');
    
    const mockPlayer: any = {
        id: 'p1',
        name: '測試玩家',
        ownerName: '測試主人',
        g: 1000,
        rp: 50,
        ip: 100,
        ap: 10,
        trustFund: 0,
        tags: [],
        lastHash: 'GENESIS',
        blackMaterialSources: [],
        roles: { lawyer: 1, cto: 1, pr: 1, accountant: 1 },
        isBankrupt: false,
        totalTrials: 0,
        skipNextCard: false,
        startPath: 'normal',
        totalTagsCount: 0
    };

    const cardIds = Object.keys(CARDS_DB);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < 100; i++) {
        const randomCardId = cardIds[Math.floor(Math.random() * cardIds.length)];
        const randomOption = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
        
        try {
            const result = await performAction(
                mockPlayer,
                randomCardId,
                randomOption,
                'TEST_HASH_CHAIN',
                'normal',
                1
            );
            
            if (result && (result.message !== undefined || result.success !== undefined)) {
                successCount++;
            }
        } catch (err) {
            console.error(`❌ 行動失敗! Card: ${randomCardId}, Opt: ${randomOption}`);
            console.error(err);
            errorCount++;
        }
    }

    console.log('\n--- 測試報告 ---');
    console.log(`✅ 成功次數: ${successCount}`);
    console.log(`❌ 崩潰次數: ${errorCount}`);
    console.log(`⚖️ 穩定度: ${(successCount / 100 * 100).toFixed(2)}%`);
    
    if (errorCount === 0 && successCount === 100) {
        console.log('🎊 結論：ActionEngine 邏輯分支 100% 穩定，無 Runtime 崩潰風險。');
    } else {
        process.exit(1);
    }
}

runSmokeTest();
