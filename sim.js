const netIncome = 1000;
const trials = 0;
const startBonusFineReduction = 0.2; // 開局賄賂命中法官，全場8折
const isPreexisting = false;
const isAppeal = false;

// 1. 基礎倍率
let baseMultiplier = 1.0;
let fineBeforeDiscount = Math.ceil(netIncome * baseMultiplier);

// 2. 累犯加重倍率
let trialMultiplier = 1.0;
if (isAppeal) {
  trialMultiplier = 2.0;
} else if (!isPreexisting) {
  if (trials >= 7) trialMultiplier = 6.0;
  else if (trials >= 4) trialMultiplier = 3.0;
}
fineBeforeDiscount = Math.ceil(fineBeforeDiscount * trialMultiplier);

// 3. 特權減免 (就是我們剛剛除蟲重構的地方)
const rawDiscount = startBonusFineReduction;
const discountRate = isPreexisting ? 0 : rawDiscount;
const fineMultiplier = 1.0 - discountRate; // 1.0 - 0.2 = 0.8!!

// 計算最終罰金
let fine = Math.ceil(fineBeforeDiscount * fineMultiplier);

console.log('--- ⚖️ 法庭判決模擬 (開局賄賂 8 折) ---');
console.log('不法所得:', netIncome, '萬');
console.log('基礎罰金(未打折):', fineBeforeDiscount, '萬');
console.log('特權最終倍率:', fineMultiplier, 'x');
console.log('✅ 實際需繳交罰金:', fine, '萬');
console.log('👉 玩家成功省下了:', fineBeforeDiscount - fine, '萬!');
