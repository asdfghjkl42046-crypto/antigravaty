/**
 * 引擎總管
 * 把所有不同的計算功能（如法庭、行動、角色能力）打包在一起，方便主程式呼叫。
 */

// 將 MathEngine 中的數學與亂數邏輯匯出
export * from './MathEngine';
// 將 RoleEngine 中的角色技能邏輯匯出
export * from './RoleEngine';
// 將 MechanicsEngine 中的核心機制邏輯匯出
export * from './MechanicsEngine';
// 將 EndingEngine 中的結局判定邏輯匯出
export * from './EndingEngine';
// 將 PlayerEngine 中的玩家狀態更新邏輯匯出
export * from './PlayerEngine';
// 將 ActionEngine 中的行動卡解析邏輯匯出
export * from './ActionEngine';
// 匯出法庭判決與流程邏輯 CourtEngine
export { CourtEngine } from './CourtEngine';

// 為相容舊版預設的型別匯出，確保外部元件不報錯
export type { AnyCardOption } from './ActionEngine';
