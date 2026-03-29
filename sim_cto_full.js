// ====== 模擬環境設定 ======
const ALL_PLAYERS = [
  { id: 'Player_A', name: '玩家A (剛好也是滿級CTO老闆)', ctoLevel: 3 }, 
  { id: 'Player_B', name: '玩家B (對手)', ctoLevel: 3 },   
  { id: 'Player_C', name: '玩家C (對手)', ctoLevel: 3 },   
  { id: 'Player_D', name: '玩家D (對手)', ctoLevel: 0 },   
];
const currentPlayerId = 'Player_A';

// --- 防呆驗證：自身的 CTO 會不會害到自己？ ---
const counterCTOCount = ALL_PLAYERS.filter(p => p.id !== currentPlayerId && p.ctoLevel >= 3).length;

console.log(`👉 【疑問解答】：自身的 CTO 會害到自己嗎？`);
console.log(`   [原始碼驗證] RoleEngine.ts 第 236 行： p.id !== currentPlayerId`);
console.log(`   [驗證結果]：絕對不會！系統會自動排除玩家自己的 ID，所以您不管養了多高等的 CTO，出去做壞事時都不會加倍自己的懲罰。\n`);

console.log(`====== 模擬情境設定 ======`);
console.log(`場上總共有 ${ALL_PLAYERS.length} 位玩家。`);
console.log(`行動者：玩家A (自己擁有 CTO LV3，此為驗證不自傷機制)`);
console.log(`擁有 CTO LV3 的【其他對手】人數：${counterCTOCount} 位 (玩家B、玩家C)\n`);


// ====== 行動卡結算模擬 (ActionEngine.ts) ======
const isBTypeYZ = true; 
const tagMultiplier = isBTypeYZ ? 1 + counterCTOCount : 1; 

console.log(`[發生事件] 玩家A 執行了惡意挖角，觸發對手反制！`);
console.log(`[產生倍率] 基礎 1 倍 + 對手人數 ${counterCTOCount} 倍 = 總複製倍數 ${tagMultiplier} 倍\n`);

// 模擬產生的「基礎標籤」
const resolvedSuccTags = [ { text: '惡意挖角', isCrime: true } ];
const BASE_BM_PER_TAG = 1;

console.log(`[基礎設定] 卡牌原始設定僅產生 ${resolvedSuccTags.length} 個標籤：「${resolvedSuccTags[0].text}」。`);
console.log(`[基礎設定] 只要拿到這 1 個標籤，原始預設就是增加 ${BASE_BM_PER_TAG} 點黑材料 (BM)。\n`);

// 展開標籤階段
let hashedTags = [];
for(let i=0; i<tagMultiplier; i++) {
  hashedTags.push(resolvedSuccTags[0]); // 模擬陣列倍增
}

// 結算指派
let newBMSources_BUG = [];
let newBMSources_FIXED = [];

hashedTags.forEach((ht) => {
  const count_BUG = BASE_BM_PER_TAG * tagMultiplier;
  newBMSources_BUG.push({ count: count_BUG });
  
  const count_FIXED = BASE_BM_PER_TAG;
  newBMSources_FIXED.push({ count: count_FIXED });
});

// ====== 結果計算 ======
console.log(`====== 🏁 模擬結算結果 🏁 ======`);
const totalBM_BUG = newBMSources_BUG.reduce((sum, s) => sum + s.count, 0);
const totalBM_FIXED = newBMSources_FIXED.reduce((sum, s) => sum + s.count, 0);

console.log(`❌ 修正前的平方暴走版：`);
console.log(`   產生實體標籤數: 陣列裡被塞了 ${hashedTags.length} 個「惡意挖角」`);
console.log(`   每一個標籤身上背的黑材料: ${newBMSources_BUG[0].count} 點 (重點就在這，標籤已經變多了，數值又被亂乘了一次 ${tagMultiplier})`);
console.log(`   💣 玩家A最終獲得黑材料 (BM) 總計: ${totalBM_BUG} 點！(1點原始懲罰變成了可怕的 9 點)\n`);

console.log(`✅ 修復後的健康版：`);
console.log(`   產生實體標籤數: 陣列裡一樣被合法塞了 ${hashedTags.length} 個「惡意挖角」`);
console.log(`   每一個標籤身上背的黑材料: ${newBMSources_FIXED[0].count} 點 (回歸正常的 1 點基本單位)`);
console.log(`   🛡️ 玩家A最終獲得黑材料 (BM) 總計: ${totalBM_FIXED} 點！`);
console.log(`   (完美的 3 倍懲罰，符合 1 位行動者 + 2 位敵方 LV3 CTO 的數學模型)`);
