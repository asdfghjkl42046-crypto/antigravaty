/**
 * 遊戲資料儲存中心
 * 負責記住所有玩家的錢、名聲、黑材料以及目前遊戲進度。
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { applyRoleUpgrade, applyRedrawCards } from '../engine/GameEngine';
import { GameFlowEngine } from '../engine/GameFlowEngine';

import {
  Player,
  ActionLog,
  GameStateData,
  ActionResult,
  BetChoice,
  TrialStage,
  RoleType,
  JudgeMode,
  PlayerConfig,
} from '../types/game';
import { CourtEngine } from '../engine/CourtEngine';
import { resolveScanCode } from '../engine/MechanicsEngine';

interface GameStore extends GameStateData {
  // --- 基礎系統生命週期動作 ---
  initGame: (configs: PlayerConfig[]) => Promise<void>;
  resetGame: () => void;
  setJudgeMode: (mode: JudgeMode) => void;
  clearStartNotifications: () => void;
  clearEngineError: () => void;
  processScan: (code: string) => { success: boolean; message: string };

  // --- 遊戲卡牌核心流程 ---
  performAction: (
    cardId: string,
    optionIdx: 1 | 2 | 3,
    declareChoice?: 'declare' | 'skip' | 'normal'
  ) => Promise<ActionResult>;
  endTurn: () => void;
  redrawCards: () => { success: boolean; message: string };
  upgradeRole: (role: RoleType) => { success: boolean; message: string };

  // --- 法庭與判定子系統 ---
  triggerTrial: (
    defendantId: string,
    forcedTagId?: number,
    isInevitable?: boolean,
    reason?: string
  ) => void;
  setTrialStage: (stage: TrialStage | number) => void;
  nextBystander: () => void;
  addIntervention: (playerId: string, text: string) => void;
  placeBet: (playerId: string, choice: BetChoice) => void;
  submitDefense: (optionIdx: number, text: string) => void;
  withdrawCase: () => void;
  extraordinaryAppeal: () => void;
  resolveTrial: () => void;
  setTrialReady: (ready: boolean) => void;
  tickTrialTimer: () => void;

  // --- 輔助擷取器 ---
  getCurrentPlayer: () => Player | null;

  // --- 開發人員偵錯工具 ---
  debugUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
  hardReset: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // --- 初始預設狀態 ---
      players: [],
      turn: 1,
      currentPlayerIndex: 0,
      phase: 'play',
      actionLogs: [],
      trial: null,
      judgePersonality: null,
      judgeMode: null,
      startNotifications: [],
      usedCodes: [],
      endingResult: null,
      engineError: null,
      pendingTrialId: undefined,

      // --- 基礎系統生命週期動作 ---
      setJudgeMode: (mode) => set({ judgeMode: mode }),

      processScan: (code: string) => {
        const state = get();
        const codeUpper = code.toUpperCase().trim();

        // 處理特殊洗牌指令 (WASH)
        if (codeUpper === 'WASH') {
          return get().redrawCards();
        }

        if (state.usedCodes.includes(codeUpper)) {
          return { success: false, message: '此代碼已領取過。' };
        }

        const res = resolveScanCode(codeUpper);
        if (!res) return { success: false, message: '無效代碼。' };

        get().performAction(res.cardId, res.optionIdx as 1 | 2 | 3, 'normal');
        set((s) => ({ usedCodes: [...s.usedCodes, codeUpper] }));
        return { success: true, message: `成功同步卡片 ${res.cardId}。` };
      },

      initGame: async (configs) => {
        const updates = await GameFlowEngine.initializeGame(configs);
        set(updates);
      },

      resetGame: () => {
        set({
          players: [],
          turn: 1,
          currentPlayerIndex: 0,
          phase: 'play',
          actionLogs: [],
          trial: null,
          judgePersonality: null,
          judgeMode: null,
          startNotifications: [],
          endingResult: null,
          engineError: null,
          pendingTrialId: undefined,
        });
      },

      clearStartNotifications: () => set({ startNotifications: [] }),
      clearEngineError: () => set({ engineError: null }),

      performAction: async (cardId, optionIdx, declareChoice) => {
        const state = get();
        const updates = await GameFlowEngine.executeAction(state, cardId, optionIdx, declareChoice);
        const { result, ...stateUpdates } = updates;
        set(stateUpdates);

        if (stateUpdates.pendingTrialId) {
          get().triggerTrial(stateUpdates.pendingTrialId as string);
        }

        return result;
      },

      redrawCards: () => {
        const res = GameFlowEngine.handleRedrawCards(get());
        if (res.success) set(res.updates);
        return { success: res.success, message: res.message };
      },

      upgradeRole: (role) => {
        const res = GameFlowEngine.handleUpgradeRole(get(), role);
        if (res.success) set(res.updates);
        return { success: res.success, message: res.message };
      },

      endTurn: () => {
        const updates = GameFlowEngine.proceedNextTurn(get());
        set(updates);
        if (updates.pendingTrialId) {
          get().triggerTrial(updates.pendingTrialId as string);
        }
      },

      triggerTrial: (did, tid, inev = false, r = '') => {
        const updates = GameFlowEngine.handleTriggerTrial(get(), did, tid, inev, r);
        set(updates);
      },

      setTrialStage: (stage) => {
        const t = get().trial;
        if (!t) return;
        const updates = CourtEngine.determineNextTrialStage(t, stage);
        set({ trial: { ...t, ...updates } as any });
      },

      nextBystander: () =>
        set((s) => ({
          trial: s.trial
            ? { ...s.trial, actingBystanderIndex: s.trial.actingBystanderIndex + 1, timer: 0 }
            : null,
        })),

      addIntervention: (pid, txt) =>
        set((s) => ({
          trial: s.trial
            ? {
                ...s.trial,
                interventions: [...s.trial.interventions, { playerId: pid, text: txt }],
              }
            : null,
        })),

      placeBet: (pid, choice) =>
        set((s) => ({
          trial: s.trial
            ? { ...s.trial, bets: [...s.trial.bets, { playerId: pid, choice }] }
            : null,
        })),

      submitDefense: (idx, txt) => {
        const updates = GameFlowEngine.handleSubmitDefense(get(), idx, txt);
        set(updates);
      },

      withdrawCase: () => {
        const updates = GameFlowEngine.handleWithdrawCase(get());
        set(updates);
      },

      extraordinaryAppeal: () => {
        const updates = GameFlowEngine.handleExtraordinaryAppeal(get());
        set(updates);
      },

      resolveTrial: () => {
        const updates = GameFlowEngine.calculateTrialResolution(get());
        set(updates);
      },

      setTrialReady: (r) => set((s) => ({ trial: s.trial ? { ...s.trial, isReady: r } : null })),
      tickTrialTimer: () =>
        set((s) => ({ trial: s.trial ? { ...s.trial, timer: s.trial.timer + 1 } : null })),
      getCurrentPlayer: () => get().players[get().currentPlayerIndex] || null,
      debugUpdatePlayer: (pid, upd) =>
        set((s) => ({ players: s.players.map((p) => (p.id === pid ? { ...p, ...upd } : p)) })),
      hardReset: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('antigravity-game-storage');
          window.location.reload();
        }
      },
    }),
    { name: 'antigravity-game-storage', storage: createJSONStorage(() => localStorage) }
  )
);
