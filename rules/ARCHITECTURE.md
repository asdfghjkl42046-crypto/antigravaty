# 專案目錄架構與解耦鐵則 (ARCHITECTURE.md)

> ⚠️ 【最高權限架構指令】 ⚠️
> 此文件獨立於遊戲玩法規則 (`GEMINI.md`) 之外。
> 無論遊戲玩法如何更動，所有 AI 代理 (包含任何版本的 Gemini) 在新建、撰寫或修改程式碼時，**必須絕對遵守以下資料夾職責邊界**。
> 嚴禁將不同職責之程式碼互相混合、越界呼叫或將邏輯寫在錯誤的層級！

---

## 1. 檔案歸屬強制規定

### `src/app/` (路由與全域配置層)

- 僅允許存放 Next.js 頁面入口 (`page.tsx`, `layout.tsx`) 與全域樣式 (`globals.css`)。
- 嚴禁在此撰寫複雜的 React 狀態或任何遊戲核心邏輯。

### `src/components/` (視圖層 - Dumb Components)

- 只負責畫面渲染 (UI) 與基礎互動。
- 所有複雜運算、邏輯推演，在觸發事件後必須委派呼叫 `engine` 或 `store` 處理。

### `src/engine/` (大腦運算層)

- 遊戲的心臟。所有的機率運算、法庭勝率判定、狀態檢查、結局判定，全數封裝於 `*Engine.ts` 類別中。
- **🔴 紅色警戒**：嚴禁在此資料夾內匯入任何 React 函式館 (如 UI components, hooks 等)，確保引擎為「純 JavaScript / TypeScript 物件」。*(此規則已由 ESLint 物理鎖定)*

### `src/data/` (靜態資料字典)

- 用來存放卡牌、法條、大法官性格範本等純資料陣列檔案 (`cards/`, `laws/`, `judges/`)。
- 嚴禁攜帶動態邏輯或函式運算。

### `src/store/` (全域狀態樞紐)

- 專屬於 Zustand 等狀態管理員 (`gameStore.ts`)，純粹負責收發全域變數狀態。
- 狀態更新前所需的「思考與推演」，應由 `engine` 先算好再交給 `store` 覆寫。

### `src/tests/` (測試沙盒)

- 所有的自動化測試、邏輯驗證與機率模擬腳本，皆須放置於此。

### `src/types/` 與 `src/lib/` (底層基礎設施)

- `types/` 負責 TypeScript Interfaces 與 Type 定義。
- `lib/` 負責存放無關業務邏輯的底層輔助函式 (如字串處理、Tailwind 合併工具)。

---

## 2. 物理防線與驗證

- **ESLint 攔截**：若 AI 在 `src/engine/` 中誤用 React，ESLint `no-restricted-imports` 會強制編譯失敗並丟出錯誤。此時 AI 應立刻停手並將狀態轉交給 `Store`。
- **測試為王**：若更動任何 `Engine.ts` 計算邏輯，必須先通過 `src/tests/` 內的驗證腳本才能宣告完成。
