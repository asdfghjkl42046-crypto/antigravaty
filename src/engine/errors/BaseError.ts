/**
 * 遊戲系統錯誤基礎定義
 * 讓畫面可以根據不同類型的錯誤顯示不同的訊息。
 */
export abstract class BaseEngineError extends Error {
  /**
   * 錯誤分類：
   * 1. 資料錯誤：讀取到的資料格式不對
   * 2. 數值計算錯誤：計算出來的數字壞掉了
   * 3. 邏輯出錯：發生了不該發生的情況
   */
  public abstract readonly category: 'Data' | 'Calculation' | 'Flow';

  constructor(
    public context: string,
    public details: string
  ) {
    // 統一格式為 [上下文] 詳細資訊
    super(`[${context}] ${details}`);
    this.name = this.constructor.name;

    // TypeScript 限制：確保正確的 prototype chain 以支援 instanceof
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
