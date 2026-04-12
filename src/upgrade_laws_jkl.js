const fs = require('fs');
const path = require('path');

const lawsDir = 'c:\\\\Users\\\\asdfg\\\\Desktop\\\\antigravaty\\\\src\\\\data\\\\laws';
const files = ['LAWS_A.ts', 'LAWS_B.ts', 'LAWS_C.ts', 'LAWS_D.ts', 'LAWS_E.ts', 'LAWS_START.ts', 'LawCasesDB.ts'];

files.forEach(f => {
  const p = path.join(lawsDir, f);
  if (!fs.existsSync(p)) return;
  
  let content = fs.readFileSync(p, 'utf-8');
  
  content = content.replace(/(defense_j:\s*'[^']*',)\r?\n/g, '$1\n    defense_j_text: "",\n    web_judgment_j: "",\n    edu_j: "",\n');
  content = content.replace(/(defense_k:\s*'[^']*',)\r?\n/g, '$1\n    defense_k_text: "",\n    web_judgment_k: "",\n    edu_k: "",\n');
  content = content.replace(/(defense_l:\s*'[^']*',?)\r?\n/g, '$1\n    defense_l_text: "",\n    web_judgment_l: "",\n    edu_l: "",\n');
  
  fs.writeFileSync(p, content);
});

console.log('done');
