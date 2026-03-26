/**
 * 遊戲引擎自定義錯誤類別
 * 透過繼承 Error 類別，允許 UI 層使用 instanceof 進行錯誤分類與差異化顯示。
 */

/** 引擎錯誤基類 */
export abstract class BaseEngineError extends Error {
  public abstract readonly category: 'Data' | 'Calculation' | 'Flow';
  constructor(public context: string, public details: string) {
    super(`[${context}] ${details}`);
    this.name = this.constructor.name;
    // 確保正確的 prototype chain (TypeScript 限制)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 
 * 1. DataError: 資料與狀態錯誤
 * 包含：資料損毀 (Corruption)、資料定義 (Definition) 
 */
export class DataError extends BaseEngineError {
  public readonly category = 'Data';
}

/** 
 * 2. CalculationError: 數值與邏輯運算錯誤
 * 包含：邏輯失效 (Logic Failure)、數值檢核 (NaN/Infinity)
 */
export class CalculationError extends BaseEngineError {
  public readonly category = 'Calculation';
}

/** 
 * 3. FlowError: 執行環境與流程控制錯誤
 * 包含：環境不支援 (Environment)、法庭初始化 (Trial Init)
 */
export class FlowError extends BaseEngineError {
  public readonly category = 'Flow';
}
