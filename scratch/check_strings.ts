import { SYSTEM_STRINGS } from '../src/data/SystemStrings';
import { PLAYER_UI_STRINGS } from '../src/data/ui/PlayerStrings';

console.log('--- 系統文案執行期檢查 ---');

console.log('1. 檢查 SystemStrings.UI_LABELS:');
console.log('   IP:', SYSTEM_STRINGS.UI_LABELS.IP);
console.log('   RP:', SYSTEM_STRINGS.UI_LABELS.RP);
console.log('   AP:', SYSTEM_STRINGS.UI_LABELS.AP);

console.log('\n2. 檢查 PlayerStrings (應連動至 SystemStrings):');
console.log('   STATS.RP:', PLAYER_UI_STRINGS.STATS.RP);
console.log('   SIDEBAR.TOTAL_CAPITAL:', PLAYER_UI_STRINGS.SIDEBAR.TOTAL_CAPITAL);

console.log('\n3. 檢查是否存在 Undefined (循環引用檢測):');
const checkUndefined = (obj: any, path: string = '') => {
  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    if (obj[key] === undefined) {
      console.error(`[ERROR] 發現 Undefined 欄位: ${currentPath}`);
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // 避免遞迴太深，只檢查兩層
      if (path.split('.').length < 3) checkUndefined(obj[key], currentPath);
    }
  }
};

checkUndefined(SYSTEM_STRINGS);
console.log('\n--- 檢查結束 ---');
