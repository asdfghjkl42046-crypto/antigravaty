import { BaseEngineError } from './BaseError';

/**
 * 1. 資料相關錯誤
 */
export abstract class DataError extends BaseEngineError {
  public readonly category = 'Data';
}

/** 資料損毀：遊戲資料不完整或壞掉了 */
export class DataCorruptionError extends DataError {
  constructor(context: string, details: string) {
    super(`Data Corruption @ ${context}`, details);
  }
}

/** 資料設定錯誤：找不到資料或設定有誤 */
export class DataDefinitionError extends DataError {
  constructor(context: string, details: string) {
    super(`Data Definition Error @ ${context}`, details);
  }
}
