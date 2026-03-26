const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, 'src', 'data', 'cards');
const files = fs.readdirSync(cardsDir).filter(f => f.startsWith('CARDS_') && f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(cardsDir, file);
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Remove tags on their own line
  const lineBasedRegex = /^[ \t]*tags:[ \t]*\[[^\]]*\],?[ \t]*\r?\n/gm;
  let newContent = content.replace(lineBasedRegex, '');
  
  // 2. Remove tags that are inline (e.g., inside succ: { ... })
  // We look for "tags: [...], " or ", tags: [...]" to keep the object valid
  const inlineRegex1 = /,?[ \t]*tags:[ \t]*\[[^\]]*\],?[ \t]*/g;
  newContent = newContent.replace(inlineRegex1, (match) => {
      // If it has a comma, we might be leaving a double comma or a comma at the end/start.
      // But standard JS/TS allows trailing commas in objects.
      return '';
  });

  // Cleanup potential double commas like ", ," caused by removal
  newContent = newContent.replace(/,([ \t]*),/g, ',');
  // Cleanup ", }" at the end of objects
  newContent = newContent.replace(/,[ \t]*\}/g, ' }');
  // Cleanup "{ ," at the start of objects
  newContent = newContent.replace(/\{[ \t]*,/g, '{ ');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Successfully cleaned tags from ${file}`);
  } else {
    console.log(`No tags changes for ${file}.`);
  }
});
