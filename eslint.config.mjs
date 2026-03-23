import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  // 🔴 物理防禦機制 (解耦防線)：強制切斷 Engine 對視圖庫的依賴
  {
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'next/*', '@/components/*'],
              message:
                '\n[🛑 架構警報 🛑]\n嚴禁在 Engine (大腦運算層) 匯入 React、Hooks 或 UI 元件！\n👉 AI 專屬修復指南 (避免浪費思考 Tokens)：\n1. 【狀態儲存】：請去 src/store/gameStore.ts 新增變數，並透過 Zustand 的 set() 更新。\n2. 【畫面互動】：請在 src/components/ 保持純 UI 渲染。當玩家點擊按鈕，請呼叫 Store 中的 actions，再由 Store 調用 Engine 進行純數學運算。\n3. 【引擎職責】：Engine 必須是 100% 的純粹函式 (Pure Functions)，僅「接收參數 -> 執行機率/結算 -> 回傳結果」，不可觸碰任何畫面狀態。\n請立刻抽離您的 React 實作！',
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
