import { BaseEngineError } from './BaseError';

/**
 * 2. 數值計算錯誤
 */
export abstract class CalculationError extends BaseEngineError {
  public readonly category = 'Calculation';
}

/** 邏輯出錯：發生了不該發生的情況 */
export class LogicFailureError extends CalculationError {
  constructor(context: string, details: string) {
    super(`Logic Failure @ ${context}`, details);
  }
}

/** 數字異常：計算出來的數字壞掉了 */
export class NumericalCheckError extends CalculationError {
  constructor(context: string, details: string) {
    super(`Numerical Check Error @ ${context}`, details);
  }
}
