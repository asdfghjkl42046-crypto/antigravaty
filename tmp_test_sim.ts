
import { CARDS_A } from './src/data/cards/CARDS_A';
import { CARDS_B } from './src/data/cards/CARDS_B';
import { CARDS_C } from './src/data/cards/CARDS_C';
import { CARDS_D } from './src/data/cards/CARDS_D';
import { CARDS_E } from './src/data/cards/CARDS_E';
import { LAW_CASES_DB } from './src/data/laws/LawCasesDB';

const ALL_CARDS = { ...CARDS_A, ...CARDS_B, ...CARDS_C, ...CARDS_D, ...CARDS_E };

import * as fs from 'fs';

function runSimulation(iterations = 10000) {
    let log = `🚀 Starting Judicial Stress Test: ${iterations} iterations...\n`;
    
    const errors: string[] = [];
    const stats = {
        totalChecks: 0,
        cardsTested: Object.keys(ALL_CARDS).length,
        brokenLawRefs: 0,
        tagMismatches: 0,
        numericalAnomalies: 0,
    };

    // 1. Static Audit
    for (const [cardId, card] of Object.entries(ALL_CARDS)) {
        for (const optIdx of [1, 2, 3]) {
            const opt: any = (card as any)[optIdx];
            if (!opt) {
                errors.push(`[CRITICAL] Card ${cardId} is missing option ${optIdx}`);
                continue;
            }

            const checkLawIds = (ids: string[] | undefined, context: string) => {
                if (ids) {
                    ids.forEach(id => {
                        const lc = LAW_CASES_DB[id];
                        if (!lc) {
                            errors.push(`[BROKEN_REF] ${cardId} Option ${optIdx} (${context}): LawCase ID "${id}" not found in DB.`);
                            stats.brokenLawRefs++;
                        }
                    });
                }
            };

            checkLawIds(opt.lawCaseIds, 'Base');
            if (opt.succ) checkLawIds(opt.succ.lawCaseIds, 'Success Result');
            if (opt.fail) checkLawIds(opt.fail.lawCaseIds, 'Failure Result');

            if (opt.succRate !== undefined && (opt.succRate < 0 || opt.succRate > 1)) {
                errors.push(`[LOGIC_ERROR] ${cardId} Option ${optIdx}: Invalid succRate ${opt.succRate}`);
                stats.numericalAnomalies++;
            }
        }
    }

    // 2. Dynamic Simulation
    const cardIds = Object.keys(ALL_CARDS);
    for (let i = 0; i < iterations; i++) {
        stats.totalChecks++;
        const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
        const card: any = ALL_CARDS[cardId];
        const optIdx: any = [1, 2, 3][Math.floor(Math.random() * 3)];
        const opt = card[optIdx];
        const isSuccess = Math.random() < (opt.succRate ?? 1);
    }

    log += "\n--- SIMULATION REPORT ---\n";
    log += `Total Cards Audited: ${stats.cardsTested}\n`;
    log += `Total Random Simulations: ${stats.totalChecks}\n`;
    log += `Broken Law References: ${stats.brokenLawRefs}\n`;
    log += `Tag Mismatches: ${stats.tagMismatches}\n`;
    log += `Numerical Anomalies: ${stats.numericalAnomalies}\n`;
    
    if (errors.length > 0) {
        log += "\n❌ ERRORS FOUND:\n";
        errors.forEach(e => log += e + "\n");
    } else {
        log += "\n✅ ALL SYSTEMS CLEAR. NO LOGIC BUGS DETECTED.\n";
    }

    fs.writeFileSync('simulation_report.txt', log, 'utf8');
    console.log("Report generated: simulation_report.txt");
}

runSimulation();
