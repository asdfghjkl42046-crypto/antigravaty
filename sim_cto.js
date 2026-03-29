const counterCTOCount = 2; // 對手有 LV2 CTO
const isBTypeYZ = true;    // 是挖角卡 (B卡)

// 1. 計算 tagMultiplier
const tagMultiplier = isBTypeYZ ? 1 + counterCTOCount : 1; // 1 + 2 = 3 倍
console.log(`[設定] 此張為挖角商業卡，遭受敵方 CTO LV${counterCTOCount} 防火牆反制`);
console.log(`[狀態] 生成標籤複製倍數 (tagMultiplier): ${tagMultiplier} 倍`);

// 2. 模擬成功結算的標籤推入 (模擬 ActionEngine.ts)
let snapshots = [];
const resolvedTags = [ { text: '惡意挖角', isCrime: true } ];

for (let i = 0; i < tagMultiplier; i++) {
  snapshots.push({ tag: resolvedTags });
}

// 3. 展開雜湊標籤
let hashedTags = [];
for (const s of snapshots) {
  for (const singleTag of s.tag) {
    hashedTags.push(singleTag);
  }
}

// 4. 計算並派發黑材料
let newBMSources = [];
hashedTags.forEach((ht, idx) => {
  const extraForThisTag = 0;
  
  // 🔥 [修正前的錯誤公式]
  const count_BEFORE = (1 + extraForThisTag) * tagMultiplier;
  
  // 🔥 [修正後的正確公式]
  const count_NOW = 1 + extraForThisTag;
  
  newBMSources.push({ tag: ht.text, count_BEFORE, count_NOW });
});

console.log(`\n--- ⚖️ 黑材料(BM)配發模擬結果 ---`);
const totalBM_BEFORE = newBMSources.reduce((sum, s) => sum + s.count_BEFORE, 0);
const totalBM_NOW = newBMSources.reduce((sum, s) => sum + s.count_NOW, 0);

console.log(`❌ 未修正前的系統 (平方倍率暴走)：`);
newBMSources.forEach((s, i) => console.log(`   標籤拷貝 ${i+1}: 身上帶著 ${s.count_BEFORE} 點黑材料`));
console.log(`   💣 玩家總共承受: ${totalBM_BEFORE} 點 黑歷史！(3倍變成了9倍的指數爆炸)`);

console.log(`\n✅ 修復後的系統 (正確的線性倍率)：`);
newBMSources.forEach((s, i) => console.log(`   標籤拷貝 ${i+1}: 身上帶著 ${s.count_NOW} 點黑材料`));
console.log(`   🛡️ 玩家總共承受: ${totalBM_NOW} 點 黑歷史！(完美符合 CTO 反制 3 倍懲罰的健康數值)`);
