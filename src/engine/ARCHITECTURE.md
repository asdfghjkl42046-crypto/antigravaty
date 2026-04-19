# 📂 遊戲引擎架構與職責規範 (ARCHITECTURE.md)

本文件定義了《Antigravaty》專案中各引擎 (Engine) 的權責邊界。**嚴禁越權開發**，所有邏輯變更必須回歸對應的權威檔案。

---

## 🏛️ 權責金字塔 (Responsibility Pyramid)

### 1. EndingEngine (生死權威層)

* **唯一職責**：決定玩家「何時出局」與「結局文案」。
* **憲法條目**：
  * 只有此處可以定義 `BANKRUPTCY_LIMITS` (RP/資金死線)。
  * 只有此處可以修改 `player.isBankrupt` 狀態標籤。
  * 所有結局標題、結算評價字串必須集中於此。

### 2. GameFlowEngine (流程控制層)

* **唯一職責**：決定玩家「能不能做這件事」與「地圖切換」。
* **憲法條目**：
  * 負責所有行動前的過濾攔截 (AP 檢查、破產攔截)。
  * 負責 `phase` (遊戲階段) 的跳轉決策。
  * 禁止在此處撰寫具體的「金錢計算」或「判刑細節」。

### 3. CourtEngine (法務專業層)

* **唯一職責**：決定「法律上的細節」與「判決結果」。
* **憲法條目**：
  * 負責法律標籤 (Tags) 與法條資料庫 (LawCases) 的對位。
  * 負責法官人格對判決機率的影響。
  * 負責結算法務處罰 (刑事名聲損失、罰金)。

### 4. ActionEngine (結算與計算層)

* **唯一職責**：負責「數值計算」與「原始標籤過濾」。
* **憲法條目**：
  * 負責所有數值加成 (Buffs) 的最終 Math。
  * 負責犯罪等級過濾 (如 SR 卡豁免)。
  * 禁止在此處彈出 UI 訊息，禁止在此處決定遊戲是否結束。

---

## 🔄 數據流向規範 (Data Flow)

所有行動必須遵循以下封閉鏈結：
`UI (Scan/Action)` → `GameStore (Dispatch)` → `GameFlowEngine (Check)` → `ActionEngine (Calculate)` → `EndingEngine (Status)`

---

## 🛑 禁令 (Taboos)

1. **禁止硬編碼**：結局字串嚴禁出現在 `components` 或 `store` 檔案中。
2. **禁止手動標記**：嚴禁在任何非 `EndingEngine` 檔案中寫入 `isBankrupt = true`。
3. **禁止重複攔截**：AP 不足的錯誤訊息統一由 `GameFlowEngine` 回報，底層 Engine 只回傳 `success: false` 與空訊息。
