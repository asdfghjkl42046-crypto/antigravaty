/**
 * 遊戲引擎專用錯誤回報中心
 * 負責統一處理數據異常 (NaN, undefined) 與邏輯中斷，確保問題能被開發者及時發現。
 */

/** 數據損壞錯誤：用於 blackMaterialSources 或 player 屬性缺失 */
export function throwDataCorruptionError(context: string, details: string): never {
  const msg = `[Data Corruption] ${context}: ${details}`;
  console.error(msg);
  throw new Error(msg);
}

/** 邏輯失效錯誤：用於計算結果出現 NaN 或不合邏輯的數值 */
export function throwLogicFailureError(context: string, details: string): never {
  const msg = `[Logic Failure] ${context}: ${details}`;
  console.error(msg);
  throw new Error(msg);
}

/** 資料定義錯誤：用於卡牌 (CARDS_DB) 或法典 (LAW_CASES_DB) 資料格式錯誤 */
export function throwDataDefinitionError(context: string, details: string): never {
  const msg = `[Data Definition Error] ${context}: ${details}`;
  console.error(msg);
  throw new Error(msg);
}

/** 環境錯誤：用於某些 Browser API (如 crypto.subtle) 在目前環境無法使用的情況 */
export function throwEnvironmentError(context: string, details: string): never {
  const msg = `[Environment Error] ${context}: ${details}`;
  console.error(msg);
  throw new Error(msg);
}
/** 庭審初始化錯誤：用於找不到被告、強制起訴卻無證據或無罪名標籤的情況 */
export function throwTrialInitializationError(context: string, details: string): never {
  const msg = `[Trial Initialization Error] ${context}: ${details}`;
  console.error(msg);
  throw new Error(msg);
}

/** 數值檢核錯誤：用於攔截 NaN, Infinity 或非法計算結果 */
export function throwNumericalCheckError(context: string, details: string): never {
  const msg = `[Numerical Check Error] ${context}: ${details}`;
  console.error(msg);
  throw new Error(msg);
}
