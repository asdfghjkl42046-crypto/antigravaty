const fs = require('fs');
const path = require('path');

const files = ['LAWS_B.ts', 'LAWS_C.ts', 'LAWS_D.ts', 'LAWS_E.ts', 'LAWS_A.ts'];
const baseDir = 'c:/Users/asdfg/Desktop/antigravaty/src/data/laws';

files.forEach(filename => {
    const filePath = path.join(baseDir, filename);
    let content = fs.readFileSync(filePath, 'utf8');

    const caseRegex = /'([A-E]-\d+-\d+)':\s*\{([\s\S]*?)\},/g;
    
    const newContent = content.replace(caseRegex, (match, id, body) => {
        // A-01-1 is the special case we already updated manually, let's just re-re-guard it or skip it if it's already perfect.
        // Actually, the user wants "都改" into that form, so I'll just let the script handle it, 
        // but A-01-1's text is special. I'll skip A-01-1 to avoid reverting my manual update.
        if (id === 'A-01-1') return match;

        const getField = (fieldName) => {
            const regex = new RegExp(`${fieldName}:\\s*(['"\`][\\s\\S]*?['"\`])`, 's');
            const m = body.match(regex);
            return m ? m[1] : null;
        };

        const tag = body.match(/tag:\s*(\[.*?\])/)?.[1] || "['妨害電腦使用']";
        const survivalRate = body.match(/survival_rate:\s*(0\.\d+)/)?.[1] || "0.02";
        
        let indictment = getField('indictment');
        if (!indictment || indictment === "''" || indictment === '""' || indictment === "``") {
            const hiddenIntent = getField('hidden_intent');
            if (hiddenIntent) indictment = hiddenIntent;
        }
        if (!indictment) indictment = "''";

        const defenseK = getField('defense_k') || "''";
        const defenseL = getField('defense_l') || "''";

        return `  '${id}': {
    id: '${id}',
    tag: ${tag},
    indictment: ${indictment},
    survival_rate: ${survivalRate},
    defense_k: ${defenseK},
    defense_k_text: ${defenseK},
    web_judgment_k: '',
    edu_k: '',
    defense_l: ${defenseL},
    defense_l_text: ${defenseL},
    web_judgment_l: '',
    edu_l: '',
    web_judgment_win: '',
    web_judgment_lose: '',
  },`;
    });

    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filename}`);
});
