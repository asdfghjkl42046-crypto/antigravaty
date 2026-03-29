import { BaseEngineError } from './BaseError';

/**
 * 3. 系統流程錯誤
 */
export abstract class FlowError extends BaseEngineError {
  public readonly category = 'Flow';
}

/** 環境錯誤：瀏覽器功能不支援或網路有問題 */
export class EnvironmentError extends FlowError {
  constructor(context: string, details: string) {
    super(`Environment Error @ ${context}`, details);
  }
}

/** 啟動錯誤：法庭或遊戲系統開啟失敗 */
export class TrialInitializationError extends FlowError {
  constructor(context: string, details: string) {
    super(`Trial Initialization Error @ ${context}`, details);
  }
}
