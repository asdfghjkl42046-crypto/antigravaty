
import { performAction } from '../src/engine/ActionEngine';
import { CARDS_DB } from '../src/data/cards/CardsDB';
import { Player } from '../src/types/game';

/**
 * 遊戲平衡性分析器
 * 目的：模擬 1000 次遊戲行動，提取核心數值期望值。
 */
async function analyzeBalance() {
    console.log('📊 啟動《創業冒險》數值平衡性分析儀...');
    
    const mockPlayer: any = {
        id: 'p1',
        name: '分析對象',
        g: 1000,
        rp: 50,
        ip: 100,
        ap: 10,
        tags: [],
        lastHash: 'GENESIS',
        blackMaterialSources: [],
        roles: { lawyer: 1, cto: 1, pr: 1, accountant: 1 },
        isBankrupt: false
    };

    const cardIds = Object.keys(CARDS_DB);
    
    // 統計數據
    const stats = {
        totalActions: 1000,
        totalGainedG: 0,
        totalLostG: 0,
        totalBM: 0,
        ctoEffectCount: 0,
        ctoExtraBM: 0,
        categoryStats: {} as Record<string, { g: number, bm: number, count: number }>
    };

    for (let i = 0; i < stats.totalActions; i++) {
        const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
        const category = cardId.split('-')[0];
        const option = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
        
        // 模擬是否有對手 CTO 干擾 (50% 機率)
        const hasEnemyCTO = Math.random() > 0.5;
        const enemyCTOCount = hasEnemyCTO ? 1 : 0;

        try {
            const result = await performAction(
                mockPlayer,
                cardId,
                option,
                'CHAIN_HEAD',
                'normal',
                1,
                enemyCTOCount
            );

            // 數據累加
            const gDiff = result.diffs?.g || 0;
            const bmDiff = result.diffs?.bm || 0;

            if (gDiff > 0) stats.totalGainedG += gDiff;
            else stats.totalLostG += Math.abs(gDiff);

            stats.totalBM += bmDiff;

            // 分類統計
            if (!stats.categoryStats[category]) {
                stats.categoryStats[category] = { g: 0, bm: 0, count: 0 };
            }
            stats.categoryStats[category].g += gDiff;
            stats.categoryStats[category].bm += bmDiff;
            stats.categoryStats[category].count++;

            // CTO 專屬統計
            if (hasEnemyCTO && bmDiff > 0) {
                stats.ctoEffectCount++;
                // 根據策劃者說法，CTO 會讓標籤加倍
                stats.ctoExtraBM += (bmDiff / 2); 
            }

        } catch (err) {
            // 忽略測試中的數值拋錯
        }
    }

    console.log('\n==== 🔍 數值平衡分析報告 ====');
    console.log(`平均每次行動收益: ${((stats.totalGainedG - stats.totalLostG) / stats.totalActions).toFixed(2)} 萬`);
    console.log(`平均每次行動風險: ${(stats.totalBM / stats.totalActions).toFixed(2)} BM`);
    
    console.log('\n--- 📁 各類別卡片表現 ---');
    Object.entries(stats.categoryStats).forEach(([cat, s]) => {
        console.log(`[${cat} 類] 平均 G: ${(s.g / s.count).toFixed(2)}, 平均 BM: ${(s.bm / s.count).toFixed(2)} (樣本: ${s.count})`);
    });

    console.log('\n--- 🥷 CTO 威脅評估 ---');
    console.log(`對手 CTO 觸發頻率: ${((stats.ctoEffectCount / stats.totalActions) * 100).toFixed(2)}%`);
    console.log(`對手 CTO 導致的額外法律風險: +${stats.ctoExtraBM.toFixed(0)} BM (佔總風險 ${(stats.ctoExtraBM / stats.totalBM * 100).toFixed(2)}%)`);

    console.log('\n⚖️ 策劃建議：');
    const riskRatio = stats.totalBM / (stats.totalGainedG / 100);
    if (riskRatio > 0.5) {
        console.log('⚠️ 注意：法律風險與收益不成比例，玩家可能會過快進入法庭循環。');
    } else {
        console.log('✅ 經濟與法律風險平衡良好。');
    }
}

analyzeBalance();
