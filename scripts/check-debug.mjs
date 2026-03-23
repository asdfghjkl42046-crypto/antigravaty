import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEBUG_PANEL_PATH = path.join(__dirname, '../src/components/DebugPanel.tsx');

if (fs.existsSync(DEBUG_PANEL_PATH)) {
  console.log('\n\x1b[41m\x1b[37m%s\x1b[0m', ' ⚠️  警告：偵測到開發用 DebugPanel！ ');
  console.log('\x1b[33m%s\x1b[0m', '偵測到路徑：' + DEBUG_PANEL_PATH);
  console.log(
    '\x1b[36m%s\x1b[0m',
    '如果你正準備封裝 (Bundle) 遊戲，請務必先移除 DebugPanel.tsx 並清理 page.tsx 中的入口！\n'
  );
}
