/**
 * 系統錯誤回報中心
 * 負責集中處理所有錯誤。
 */

export * from './BaseError';
export * from './DataErrors';
export * from './CalculationErrors';
export * from './FlowErrors';

import { DataCorruptionError, DataDefinitionError } from './DataErrors';
import { LogicFailureError, NumericalCheckError } from './CalculationErrors';
import { EnvironmentError, TrialInitializationError } from './FlowErrors';

/** [資料類] 拋出資料損毀錯誤 */
export function throwDataCorruptionError(context: string, details: string): never {
  throw new DataCorruptionError(context, details);
}

/** [計算類] 拋出邏輯失效錯誤 */
export function throwLogicFailureError(context: string, details: string): never {
  throw new LogicFailureError(context, details);
}

/** [資料類] 拋出資料定義錯誤 (如找不到 ID) */
export function throwDataDefinitionError(context: string, details: string): never {
  throw new DataDefinitionError(context, details);
}

/** [流程類] 拋出系統環境錯誤 */
export function throwEnvironmentError(context: string, details: string): never {
  throw new EnvironmentError(context, details);
}

/** [流程類] 拋出法庭/事件初始化失敗錯誤 */
export function throwTrialInitializationError(context: string, details: string): never {
  throw new TrialInitializationError(context, details);
}

/** [計算類] 拋出數值檢核異常 (如 NaN) */
export function throwNumericalCheckError(context: string, details: string): never {
  throw new NumericalCheckError(context, details);
}
