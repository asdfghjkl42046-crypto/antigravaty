/**
 * 遊戲資料儲存中心
 * 負責記住所有玩家的錢、名聲、黑材料以及目前遊戲進度。
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameFlowEngine } from '../engine/GameFlowEngine';

import {
  Player,
  GameStateData,
  ActionResult,
  BetChoice,
  TrialStage,
  RoleType,
  JudgeMode,
  PlayerConfig,
  EndingType,
} from '../types/game';
import { CourtEngine } from '../engine/CourtEngine';
import { resolveScanCode, resolveTalentCode } from '../engine/MechanicsEngine';

interface GameStore extends GameStateData {
  // --- 基礎系統生命週期動作 ---
  initGame: (configs: PlayerConfig[]) => Promise<void>;
  resetGame: () => void;
  setJudgeMode: (mode: JudgeMode) => void;
  clearStartNotifications: () => void;
  clearEngineError: () => void;
  processScan: (code: string) => { success: boolean; message: string; type?: 'location' | 'talent' | 'wash' };

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
  debugTriggerEnding: (type: EndingType, isFake?: boolean) => void;
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
        const codeUpper = code.toUpperCase().replace(/-/g, '').trim();

        // 處理特殊洗牌指令 (WASH)
        if (codeUpper === 'WASH') {
          return { ...get().redrawCards(), type: 'wash' };
        }

        // 處理人才卡實體掃描購買 (可重複掃描升級，不記入 usedCodes)
        const talentRole = resolveTalentCode(codeUpper);
        if (talentRole) {
          const result = get().upgradeRole(talentRole);
          return { ...result, type: 'talent' };
        }

        // removed usedCodes check locally so location cards can be rescanned.

        const res = resolveScanCode(codeUpper);
        if (!res) return { success: false, message: '無效代碼。' };

        get().performAction(res.cardId, res.optionIdx as 1 | 2 | 3, 'normal');
        set((s) => ({ usedCodes: [...s.usedCodes, codeUpper] }));
        return { success: true, message: `成功同步卡片 ${res.cardId}。`, type: 'location' };
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
        set({ trial: { ...t, ...updates } });
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
      
      debugTriggerEnding: (type, isFake = false) => {
        const player = get().players[get().currentPlayerIndex];
        if (!player) return;

        const mockStats = {
          totalProfit: player.g + (player.trustFund || 0),
          totalFines: player.totalFinesPaid || 0,
          finalRp: player.rp,
        };

        const titles: Record<EndingType, string> = {
          saint: isFake ? '聖皇(偽)' : '聖皇',
          tycoon: '企業巨頭',
          dragonhead: '優良龍頭企業',
          arrested: '身敗名裂',
          bankrupt: '經濟破產',
          limit: '創業夢碎'
        };

        const descs: Record<EndingType, string> = {
          saint: isFake 
            ? '您表面上名譽極高且財富驚人，但背後累積的暗盤交易讓這份皇冠沾滿了灰塵。'
            : '您的企業已超越了凡俗的法律，在商業戰中成為了誠信與財富的化身。',
          tycoon: '您建立了一個無可撼動的商業帝國，雖然名聲並非完美，但力量足以支配整個市場。',
          dragonhead: '您成功地在利潤與社會責任之間取得了平衡，是業界公認的典範。',
          arrested: '您的企業名聲已徹底臭名昭著，判定信用破產，您被強制退出商業舞台。',
          bankrupt: '企業資金鏈完全斷裂，積欠龐大債務，您只能黯然宣告破產，退下商業舞台。',
          limit: '在漫長的 50 回合後，您仍未能建立起卓越的成就，創業之路就此止步。'
        };

        set({
          phase: (type === 'saint' || type === 'tycoon' || type === 'dragonhead') ? 'victory' : 'gameover',
          endingResult: {
            playerId: player.id,
            type,
            title: titles[type],
            evaluation: '測試用評價 / 偵錯模式',
            description: descs[type],
            stats: mockStats
          }
        });
      },

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
