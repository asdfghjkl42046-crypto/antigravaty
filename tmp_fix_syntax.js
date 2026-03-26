const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, 'src', 'data', 'cards');
const files = fs.readdirSync(cardsDir).filter(f => f.startsWith('CARDS_') && f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(cardsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix cases where tags removal joined two properties without a comma
  // Example: bm: 1lawCaseIds -> bm: 1, lawCaseIds
  const fixRegex = /([0-9a-zA-Z'"])lawCaseIds/g;
  let newContent = content.replace(fixRegex, '$1, lawCaseIds');
  
  // Also fix potential bm: 1succ: { ... } or similar
  newContent = newContent.replace(/([0-9a-zA-Z'"])succ:/g, '$1, succ:');
  newContent = newContent.replace(/([0-9a-zA-Z'"])fail:/g, '$1, fail:');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Fixed syntax in ${file}`);
  }
});
