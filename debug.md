# Antigravity 開發偵錯手冊 (debug.md)

本文件記載專案內部的偵錯工具、測試流程與應急指令。所有開發人員應在進行邏輯修改後，參考本手冊進行基礎驗證。

---

## 1. 介面偵錯工具：DebugPanel
位於遊戲介面右側（開發環境下顯示），提供以下即時操作：

### 核心操作
- **數值篡改**：可直接修改玩家的 `Money`, `IP`, `RP`, `AP`, `BM`。
- **強制結局**：
  - `Saint`: 達成「神格化」結局。
  - `Bankrupt`: 觸發「破產」結局。
  - `Dragonhead`: 觸發「龍頭」結局。
- **回合控制**：
  - `Turn Skip`: 快速跳過回合。
  - `Hard Reset`: 清除 `localStorage` 並重新載入。

---

## 2. 掃描系統模擬指令 (Scan Emulation)
在 `ScanScreen` 的手動輸入框中輸入以下保留字，可模擬特定掃描結果：

- `WASH`: 強制重抽所有手牌，不消耗 AP。
- `ROLE_UP_[KEY]`: 模擬掃描人才卡進行升級。
  - 範例: `ROLE_UP_LAWYER`
- `[CARD_ID]`: 直接輸入卡片 ID (如 `A011`) 模擬地點掃描。

---

## 3. 系統檢查腳本 (Command Line)
在終端機運行以下指令進行靜態檢查：

```powershell
# 檢查 Debug Panel 狀態
node ./scripts/check-debug.mjs

# 運行代碼檢查與排版
npm run lint
npm run format
```

---

## 4. 法庭與判決測試邊界
進行法庭測試時，請確保追蹤以下路徑：

- **觸發來源**：`MechanicsEngine.resolveLawViolation` -> `gameStore.triggerTrial`。
- **機率計算**：`MechanicsEngine.calculateSpectatorInfluence`。
- **法官行為**：`src/data/judges/` 下的各法官 `prompt_injection` 是否正確注入。

---

## 5. 常見問題排查 (QA)
- **畫面卡死在結算彈窗**：檢查 `gameStore.clearResolution` 是否有正常執行 `checkGlobalVictoryOrContinue`。
- **AP 扣除異常**：確認 `ActionEngine.execute` 中的 AP 消費邏輯與 `RoleEngine` 的折扣是否有衝突。

---
*最後更新：2026-04-27*
