/**
 * [Legacy] 遊戲引擎錯誤回報中心
 * 此檔案已棄用，請優先改用 EngineErrorClasses.ts。
 * 為了向下相容既有程式碼，目前保留同名函式但內部改為拋出新的 Error 對象。
 */

import { DataError, CalculationError, FlowError } from './EngineErrorClasses';

export function throwDataCorruptionError(context: string, details: string): never {
  throw new DataError(`Data Corruption @ ${context}`, details);
}

export function throwLogicFailureError(context: string, details: string): never {
  throw new CalculationError(`Logic Failure @ ${context}`, details);
}

export function throwDataDefinitionError(context: string, details: string): never {
  throw new DataError(`Data Definition Error @ ${context}`, details);
}

export function throwEnvironmentError(context: string, details: string): never {
  throw new FlowError(`Environment Error @ ${context}`, details);
}

export function throwTrialInitializationError(context: string, details: string): never {
  throw new FlowError(`Trial Initialization Error @ ${context}`, details);
}

export function throwNumericalCheckError(context: string, details: string): never {
  throw new CalculationError(`Numerical Check Error @ ${context}`, details);
}
