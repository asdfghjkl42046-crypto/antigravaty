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
import * as EndingEngine from '../engine/EndingEngine';
import { SystemStrings } from '../data/SystemStrings';

export const MASTERPIECES = [
  { id: 0, title: '蒙娜麗莎', author: '達文西', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg&w=400' },
  { id: 1, title: '戴珍珠耳環的少女', author: '維梅爾', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg&w=400' },
  { id: 2, title: '吶喊', author: '孟克', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/8/86/Edvard_Munch_-_The_Scream_-_Google_Art_Project.jpg&w=400' },
  { id: 3, title: '自畫像', author: '梵谷', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg&w=400' },
  { id: 4, title: '神奈川沖浪裏', author: '葛飾北齋', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/0/0d/Great_Wave_off_Kanagawa2.jpg&w=400' },
  { id: 5, title: '拿破崙越過阿爾卑斯山', author: '大衛', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/f/fd/David_-_Napoleon_crossing_the_Alps_-_Malmaison2.jpg&w=400' },
  { id: 6, title: '維納斯的誕生', author: '波提切利', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg&w=400' },
  { id: 7, title: '惠斯勒的母親', author: '惠斯勒', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/1/1b/Whistlers_Mother_high_res.jpg&w=400' },
  { id: 8, title: '抱銀貂的女子', author: '達文西', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/f/f9/Lady_with_an_Ermine_-_Leonardo_da_Vinci_-_Google_Art_Project.jpg&w=400' },
  { id: 9, title: '夜巡', author: '林布蘭', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/9/94/The_Nightwatch_by_Rembrandt_-_Rijksmuseum.jpg&w=400' },
];

export const MASTERPIECES = [
  { id: 0, title: '蒙娜麗莎', author: '達文西', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg&w=400' },
  { id: 1, title: '戴珍珠耳環的少女', author: '維梅爾', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg&w=400' },
  { id: 2, title: '吶喊', author: '孟克', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/8/86/Edvard_Munch_-_The_Scream_-_Google_Art_Project.jpg&w=400' },
  { id: 3, title: '自畫像', author: '梵谷', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/b/b2/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project.jpg&w=400' },
  { id: 4, title: '神奈川沖浪裏', author: '葛飾北齋', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/0/0d/Great_Wave_off_Kanagawa2.jpg&w=400' },
  { id: 5, title: '拿破崙越過阿爾卑斯山', author: '大衛', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/f/fd/David_-_Napoleon_crossing_the_Alps_-_Malmaison2.jpg&w=400' },
  { id: 6, title: '維納斯的誕生', author: '波提切利', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg&w=400' },
  { id: 7, title: '惠斯勒的母親', author: '惠斯勒', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/1/1b/Whistlers_Mother_high_res.jpg&w=400' },
  { id: 8, title: '抱銀貂的女子', author: '達文西', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/f/f9/Lady_with_an_Ermine_-_Leonardo_da_Vinci_-_Google_Art_Project.jpg&w=400' },
  { id: 9, title: '夜巡', author: '林布蘭', url: 'https://images.weserv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/9/94/The_Nightwatch_by_Rembrandt_-_Rijksmuseum.jpg&w=400' },
];

interface GameStore extends GameStateData {
  // --- 基礎系統生命週期動作 ---
  initGame: (configs: PlayerConfig[]) => Promise<void>;
  resetGame: () => void;
  setJudgeMode: (mode: JudgeMode) => void;
  clearStartNotifications: () => void;
  clearEngineError: () => void;
  processScan: (code: string) => Promise<{ success: boolean; message: string; type?: 'location' | 'talent' | 'wash' }>;

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

      // --- 基礎系統生命週期動作 ---
      setJudgeMode: (mode) => set({ judgeMode: mode }),

      processScan: async (code: string) => {
        /**
         * 處理掃描結果
         * 玩家掃了實體 QR Code 後，看是觸發地點卡、雇用人才還是手牌洗牌。
         */
        const codeUpper = code.toUpperCase().replace(/-/g, '').trim();

        // 處理特殊洗牌指令 (WASH)
        if (codeUpper === 'WASH') {
          return { ...get().redrawCards(), type: 'wash' };
        }

        // 處理人才卡實體掃描購買
        const talentRole = resolveTalentCode(codeUpper);
        if (talentRole) {
          const result = get().upgradeRole(talentRole);
          return { ...result, type: 'talent' };
        }

        const res = resolveScanCode(codeUpper);
        if (!res) return { success: false, message: SystemStrings.ERRORS.INVALID_CODE };

        // [核心修正] 等待行動結算，捕捉真實的成功/失敗狀態 (例如 AP不足)
        const actionResult = await get().performAction(res.cardId, res.optionIdx as 1 | 2 | 3, 'normal');
        
        if (actionResult.success) {
          set((s) => ({ usedCodes: [...s.usedCodes, codeUpper] }));
        }

        return { 
          success: actionResult.success, 
          message: actionResult.message, 
          type: 'location' 
        };
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
        /**
         * 執行卡片行動
         * 玩家點選選項後，來這邊結算金錢、名聲，並看看有沒有觸發法規或留下黑材料。
         */
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
      
      debugTriggerEnding: (type: EndingType) => {
        const player = get().players[get().currentPlayerIndex];
        if (!player) return;

        // 直接調用權威引擎產生結果，確保文案與邏輯絕對同步
        const result = EndingEngine.calculateEnding(player, get().turn);
        // 若 Debug 選擇的類型與實際計算不符（例如測試特定結局），則手動覆蓋類型以維持測試靈活性
        if (result.type !== type) {
          result.type = type;
          const config = EndingEngine.ENDING_CONFIGS[type];
          result.title = config.title;
          result.description = config.description;
        }

        set({
          phase: (type === 'saint' || type === 'tycoon' || type === 'dragonhead') ? 'victory' : 'gameover',
          endingResult: result
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
