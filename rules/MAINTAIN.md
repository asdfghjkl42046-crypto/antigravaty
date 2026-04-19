# 《創業冒險：系統維護與自檢手冊》 (MAINTAIN.md)

> 🛠️ 【系統健康指令】 🛠️
> 當專案發生意料之外的錯誤、型別報錯或測試失敗時，AI 必須查閱此手冊。

---

## 🔍 全域檢查工具 (Self-Check Tools)

在任何修改完成後，或使用者下達「全面掃蕩」指令時，AI 必須執行以下操作：

1. **型別與語法檢查**：

   ```powershell
   npm run check
   ```

   - 此指令會同時執行 `npx tsc --noEmit` 與 `eslint`。
   - 報錯處理：AI 必須逐一讀取錯誤檔案位置，並根據 `PROTOCOL.md` 提供修復報告。

2. **程式碼格式化**：

   ```powershell
   npx prettier --write .
   ```

   - 此指令會處理全專案的縮排與符號規格，解決「一個一個存檔太慢」的問題。

---

## 📜 維護提示詞 (Persistence Prompts)

當使用者重新開啟對話時，輸入以下內容可快速恢復開發狀態：

- **「啟動全域掃蕩」**：要求 AI 執行 `npm run check` 並回報目前的系統健康狀況。
- **「檢查規則目錄」**：要求 AI 閱讀 `rules/` 底下所有 Markdown 並遵守職責邊界。
- **「開啟報告流程」**：要求 AI 在接下來的所有修改中先提供診斷报告。

---

## 🌐 PWA 維護指引

App 已啟用 PWA（Progressive Web App）支援，Android 與 iOS 雙平台皆可安裝至主畫面。

### 修改 App 名稱
需同步更新兩個檔案：
1. **`public/manifest.json`**：修改 `name` 與 `short_name` 欄位。
2. **`src/app/layout.tsx`**：修改 `metadata.title` 與 `metadata.appleWebApp.title`。

### 修改 App 圖標
1. 準備 512x512 PNG 圖片。
2. 覆蓋 `public/assets/logo.png`。
3. `manifest.json` 與 `layout.tsx` 中的路徑已指向此檔，無需額外修改。

---

## 🎨 CSS 質感系統規範

`globals.css` 中已建立標準化的 Noir 質感 Utility Classes：

| 類別名稱 | 用途 |
|---|---|
| `.bg-paper-texture` | 法庭文書的手作紙感 |
| `.bg-leather-texture` | ParchmentBook 的皮革封面 |
| `.bg-noir-pinstripe` | 數據看板的條紋西裝感 |
| `.bg-scan-grid` | 終端掃描格線 |

動態樣式接口（透過 CSS 變數驅動）：

| 類別名稱 | CSS 變數 | 用途 |
|---|---|---|
| `.dynamic-page` | `--page-rotate-y`, `--page-z`, `--page-tz` | 3D 翻書物理效果 |
| `.dynamic-color` | `--dynamic-bg`, `--dynamic-color` | 動態主題色 |
| `.dynamic-rotate-z` | `--rotate-z` | 2D 旋轉（如火漆印章） |

> ⚠️ 新增組件時，**嚴禁**在 JSX 中重複定義內聯背景圖。請優先使用上述 Utility Classes。

