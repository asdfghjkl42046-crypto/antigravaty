import fs from 'fs';
import path from 'path';

// 簡單的 regex 用來抓取 ts 檔案中的 lawCaseIds
// 匹配 ['A-01-1', 'A-01-2'] 這種格式
const idRegex = /lawCaseIds:\s*\[([^\]]+)\]/g;
const stringIdRegex = /'([^']+)'|"([^"]+)"/g;

// 匹配 LAWS_X.ts 中的 Key (例如 'A-01-1': { )
const lawKeyRegex = /'([A-E]-\d{2}-\d)':\s*{/g;

const cardDir = './src/data/cards';
const lawDir = './src/data/laws';

const cardFiles = fs.readdirSync(cardDir).filter(f => f.endsWith('.ts'));
const lawFiles = fs.readdirSync(lawDir).filter(f => f.endsWith('.ts') && f.startsWith('LAWS_'));

const allLawIdsInCards = new Set();
const allDefinedLawIds = new Set();

// 1. 蒐集卡牌中引用的 ID
cardFiles.forEach(file => {
  const content = fs.readFileSync(path.join(cardDir, file), 'utf-8');
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    const idsPart = match[1];
    let idMatch;
    while ((idMatch = stringIdRegex.exec(idsPart)) !== null) {
      allLawIdsInCards.add(idMatch[1] || idMatch[2]);
    }
  }
});

// 2. 蒐集法律檔案中定義的 ID
lawFiles.forEach(file => {
  const content = fs.readFileSync(path.join(lawDir, file), 'utf-8');
  let match;
  while ((match = lawKeyRegex.exec(content)) !== null) {
    allDefinedLawIds.add(match[1]);
  }
});

// 3. 比對缺失
const missingIds = Array.from(allLawIdsInCards).filter(id => !allDefinedLawIds.has(id));

console.log('--- 掃描報告 ---');
console.log(`總共引用法律 ID: ${allLawIdsInCards.size}`);
console.log(`總共定義法律 ID: ${allDefinedLawIds.size}`);

if (missingIds.length > 0) {
  console.log('❌ 發現缺失的 ID:');
  missingIds.sort().forEach(id => console.log(` - ${id}`));
} else {
  console.log('✅ 所有卡牌引用的法律 ID 均已定義！');
}
