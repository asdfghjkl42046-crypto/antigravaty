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
import { SYSTEM_STRINGS } from '../data/SystemStrings';

export const MASTERPIECES = [
  { id: 0, title: '蒙娜麗莎', author: '達文西', url: '/assets/avatars/1.webp' },
  { id: 1, title: '戴珍珠耳環的少女', author: '維梅爾', url: '/assets/avatars/2.webp' },
  { id: 2, title: '吶喊', author: '孟克', url: '/assets/avatars/3.webp' },
  { id: 3, title: '自畫像', author: '梵谷', url: '/assets/avatars/4.webp' },
  { id: 4, title: '神奈川沖浪裏', author: '葛飾北齋', url: '/assets/avatars/5.webp' },
  { id: 5, title: '拿破崙越過阿爾卑斯山', author: '大衛', url: '/assets/avatars/6.webp' },
  { id: 6, title: '維納斯的誕生', author: '波提切利', url: '/assets/avatars/7.webp' },
  { id: 7, title: '惠斯勒的母親', author: '惠斯勒', url: '/assets/avatars/8.webp' },
  { id: 8, title: '抱銀貂的女子', author: '達文西', url: '/assets/avatars/9.webp' },
  { id: 9, title: '夜巡', author: '林布蘭', url: '/assets/avatars/10.webp' },
];

interface GameStore extends GameStateData {
  // --- 基礎系統生命週期動作 ---
  initGame: (configs: PlayerConfig[]) => Promise<void>;
  resetGame: () => void;
  setJudgeMode: (mode: JudgeMode) => void;
  clearStartNotifications: () => void;
  clearEngineError: () => void;
  processScan: (code: string, playerId?: string) => Promise<{ success: boolean; message: string; type?: 'location' | 'talent' | 'wash' }>;

  // --- 遊戲卡牌核心流程 ---
  performAction: (
    cardId: string,
    optionIdx: 1 | 2 | 3,
    declareChoice?: 'declare' | 'skip' | 'normal'
  ) => Promise<ActionResult>;
  endTurn: () => void;
  redrawCards: () => { success: boolean; message: string };
  upgradeRole: (role: RoleType, splitOG?: number) => { success: boolean; message: string };

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
  clearResolution: () => void;

  // --- 輔助擷取器 ---
  getCurrentPlayer: () => Player | null;

  // --- 開發人員偵錯工具 ---
  debugUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
  debugTriggerEnding: (type: EndingType, playerId?: string) => void;
  hardReset: () => void;
  clearBetResolution: () => void;
  checkBankruptcy: () => void;
  checkGlobalVictoryOrContinue: () => void;
  pendingBetResolution: { playerId: string; amount: number; type: 'ip' | 'rp' | 'g' }[] | null;

  // --- 加載系統 ---
  isLoading: boolean;
  loadingProgress: number;
  loadingVariant: 'default' | 'court' | 'defense';
  startLoading: (variant?: 'default' | 'court' | 'defense') => Promise<void>;
  completeLoading: () => Promise<void>;
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
      pendingResolution: null,
      isSyncing: false,
      syncMessage: '',
      syncSubMessage: '',
      pendingBetResolution: null,
      isLoading: false,
      loadingProgress: 0,
      loadingVariant: 'default',

      // --- 基礎系統生命週期動作 ---
      setJudgeMode: (mode) => set({ judgeMode: mode }),

      processScan: async (code: string, playerId?: string) => {
        /**
         * 處理掃描結果
         * 加入身分驗證：確保掃描者是當前回合的玩家。
         */
        const state = get();
        const currentPlayer = state.players[state.currentPlayerIndex];

        // 1. 系統性報錯：數據流斷裂 (Code Error / Sync Error)
        if (!currentPlayer) {
          return { success: false, message: SYSTEM_STRINGS.MESSAGES.INVALID_PLAYER };
        }

        // 2. 玩家行為錯誤：掃描順序不對 (User Logic Error)
        if (playerId && playerId !== currentPlayer.id) {
          return { success: false, message: SYSTEM_STRINGS.MESSAGES.NOT_YOUR_TURN };
        }

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
        if (!res) return { success: false, message: SYSTEM_STRINGS.ERRORS.INVALID_CODE };

        // [核心修正] 等待行動結算，捕捉真實的成功/失敗狀態
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

      initGame: async (configs: PlayerConfig[]) => {
        // [三段式加載啟動]
        get().startLoading();
        
        // 1. 第一階段：0 -> 50
        // [修正] 初始化時重置所有會話數據，防止二週目漏洞
        set({ 
          usedCodes: [], 
          startNotifications: [],
          loadingProgress: 50 
        });
        
        await new Promise(r => setTimeout(r, 600));
        
        const updates = await GameFlowEngine.initializeGame(configs);
        
        // 2. 第二階段：50 -> 75
        await new Promise(r => setTimeout(r, 400));
        set({ loadingProgress: 75 });
        
        // 3. 第三階段：75 -> 90
        await new Promise(r => setTimeout(r, 300));
        set({ loadingProgress: 90 });
        
        // 確保邏輯更新
        set(updates as Partial<GameStore>);
        
        // 4. 最終衝刺：90 -> 100 並關閉
        await get().completeLoading();
      },

      // --- 加載控制邏輯 ---
      startLoading: async (variant = 'default') => {
        set({ isLoading: true, loadingProgress: 0, loadingVariant: variant as any });
      },

      completeLoading: async () => {
        // 衝刺到 100
        set({ loadingProgress: 100 });
        // 留一點時間讓玩家看清楚 100%
        await new Promise(r => setTimeout(r, 400));
        set({ isLoading: false, loadingProgress: 0 });
      },

      resetGame: () => {
        set({
          players: [],
          turn: 1,
          currentPlayerIndex: 0,
          phase: 'play',
          actionLogs: [],
          usedCodes: [], // [修正] 確保重置時清空代碼紀錄
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

      // [新增] 同步控制
      setSyncing: (visible: boolean, msg?: string, subMsg?: string) => 
        set({ isSyncing: visible, syncMessage: msg || '', syncSubMessage: subMsg || '' }),

      performAction: async (cardId, optionIdx, declareChoice) => {
        const state = get();
        // [源頭鎖定] 鎖定來自流程引擎的更新包，避免 any 污染
        const updates = await GameFlowEngine.executeAction(state, cardId, optionIdx, declareChoice);
        const { result, ...stateUpdates } = updates;
        
        // [新增] 根據行動結果設定結算彈窗
        if (result.diffs) {
          set({
            pendingResolution: {
              title: result.success ? SYSTEM_STRINGS.RESOLUTION.SUCCESS_TITLE : SYSTEM_STRINGS.RESOLUTION.FAILURE_TITLE,
              message: result.message,
              diffs: result.diffs,
              type: result.success ? 'success' : 'failure'
            }
          });
        }

        set(stateUpdates);
        if (stateUpdates.pendingTrialId) {
          // [修正] 必須 await，否則 UI 會在加載前閃爍
          await get().triggerTrial(stateUpdates.pendingTrialId as string);
        }

        return result;
      },

      redrawCards: () => {
        const res = GameFlowEngine.handleRedrawCards(get());
        if (res.success) set(res.updates);
        return { success: res.success, message: res.message };
      },

      upgradeRole: (role, splitOG = 0) => {
        const res = GameFlowEngine.handleUpgradeRole(get(), role, splitOG);
        if (res.success) set(res.updates);
        return { success: res.success, message: res.message };
      },

      endTurn: async () => {
        const updates = GameFlowEngine.proceedNextTurn(get()) as Partial<GameStore>;
        
        // [新增] 回合結束報表
        if (updates.resultDiffs && (updates.resultDiffs.g !== 0 || updates.resultDiffs.rp !== 0 || updates.resultDiffs.trust !== 0)) {
           set({
             pendingResolution: {
               title: SYSTEM_STRINGS.RESOLUTION.PASSIVE_TITLE,
               message: SYSTEM_STRINGS.RESOLUTION.PASSIVE_MSG,
               diffs: updates.resultDiffs,
               type: 'passive'
             }
           });
        }

        set(updates);
        if (updates.pendingTrialId) {
          // [修正] 必須 await，防止競爭風險
          await get().triggerTrial(updates.pendingTrialId as string);
        }
      },

      triggerTrial: async (did, tid, inev = false, r = '') => {
        // [三段式紫色加載啟動]
        get().startLoading('court');
        
        await new Promise(r => setTimeout(r, 600));
        set({ loadingProgress: 50 });
        
        const updates = GameFlowEngine.handleTriggerTrial(get(), did, tid, inev, r) as Partial<GameStore>;
        
        await new Promise(r => setTimeout(r, 400));
        set({ loadingProgress: 75 });
        
        await new Promise(r => setTimeout(r, 300));
        set({ loadingProgress: 90 });
        
        set(updates);
        
        await get().completeLoading();
      },

      setTrialStage: async (stage) => {
        const t = get().trial;
        if (!t) return;
        
        // 如果是進入答辯階段，觸發淡藍色加載
        if (stage === TrialStage.DEFENSE) {
           get().startLoading('defense');
           await new Promise(r => setTimeout(r, 500));
           set({ loadingProgress: 50 });
           await new Promise(r => setTimeout(r, 400));
           set({ loadingProgress: 90 });
           
           const updates = CourtEngine.determineNextTrialStage(t, stage);
           set({ trial: { ...t, ...updates } });
           
           await get().completeLoading();
        } else {
           const updates = CourtEngine.determineNextTrialStage(t, stage);
           set({ trial: { ...t, ...updates } });
        }
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
        const { result, resultDiffs, ...stateUpdates } = updates;
        
        if (result.success && resultDiffs) {
          set({
            pendingResolution: {
              title: '強制撤告結算',
              message: result.message,
              diffs: resultDiffs,
              type: 'success'
            }
          });
        }
        set(stateUpdates);
      },

      extraordinaryAppeal: () => {
        const updates = GameFlowEngine.handleExtraordinaryAppeal(get());
        const { result, resultDiffs, ...stateUpdates } = updates;

        if (result.success && resultDiffs) {
          set({
            pendingResolution: {
              title: '啟動非常上訴',
              message: result.message,
              diffs: resultDiffs,
              type: 'success'
            }
          });
        }
        set(stateUpdates);
      },

      resolveTrial: () => {
        const updates = GameFlowEngine.calculateTrialResolution(get()) as Partial<GameStore>;
        
        // [修正] 拆分彈窗：第一步只顯示「被告判決」
        if (updates.resultDiffs) {
          const isWin = updates.resultDiffs.g >= 0;
          
          // 暫存旁觀者結果，稍後顯示
          const betResults = updates.resultDiffs.bets || [];
          
          set({
            pendingResolution: {
              title: isWin ? SYSTEM_STRINGS.RESOLUTION.DEFENDANT_WIN : SYSTEM_STRINGS.RESOLUTION.DEFENDANT_LOSE,
              message: isWin ? SYSTEM_STRINGS.RESOLUTION.WIN_MSG : SYSTEM_STRINGS.RESOLUTION.LOSE_MSG,
              diffs: { ...updates.resultDiffs, bets: [] }, // 這裡把 bets 清空，不讓它出現在第一層
              type: isWin ? 'success' : 'failure',
              defendantId: get().trial?.defendantId
            },
            // [新增] 存入第二層彈窗數據
            pendingBetResolution: betResults.length > 0 ? betResults : null
          });
        }

        set({
          players: updates.players,
          phase: updates.phase,
          trial: null,
          endingResult: updates.endingResult
        });
      },

      setTrialReady: (r) => set((s) => ({ trial: s.trial ? { ...s.trial, isReady: r } : null })),
      tickTrialTimer: () =>
        set((s) => ({ trial: s.trial ? { ...s.trial, timer: s.trial.timer + 1 } : null })),
      getCurrentPlayer: () => get().players[get().currentPlayerIndex] || null,
      debugUpdatePlayer: (pid, upd) =>
        set((s) => ({ players: s.players.map((p) => (p.id === pid ? { ...p, ...upd } : p)) })),
      
      debugTriggerEnding: (type: EndingType, playerId?: string) => {
        const pId = playerId || get().players[get().currentPlayerIndex]?.id;
        const player = get().players.find(p => p.id === pId);
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
          phase: (type === 'saint' || type === 'saintFake' || type === 'tycoon' || type === 'dragonhead') ? 'victory' : 'gameover',
          endingResult: result
        });
      },

      hardReset: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('antigravity-game-storage');
          window.location.reload();
        }
      },

      clearResolution: () => {
        const state = get();
        const pendingRes = state.pendingResolution;
        set({ pendingResolution: null });
        
        let player = state.players[state.currentPlayerIndex];
        if (pendingRes?.defendantId) {
          player = state.players.find(p => p.id === pendingRes.defendantId) || player;
        }
        
        // [修正順序] 優先權 1：檢查是否破產。如果有破產，先跳結局。
        if (player && player.isBankrupt) {
          get().debugTriggerEnding('bankrupt', player.id);
        } 
        // 優先權 2：如果沒破產，檢查是否有押注結果。
        else if (get().pendingBetResolution && get().pendingBetResolution!.length > 0) {
          // 保持 pendingBetResolution 為真，UI 會顯示它
        } else {
          // 優先權 3：都沒有，檢查勝利條件
          get().checkGlobalVictoryOrContinue();
        }
      },

      clearBetResolution: () => {
        set({ pendingBetResolution: null });
        // 檢查勝利條件
        get().checkGlobalVictoryOrContinue();
      },

      checkBankruptcy: () => {
        const state = get();
        const player = state.players[state.currentPlayerIndex];
        
        // 當單一玩家錢變負數時，先跳出破產結局畫面
        if (player && player.isBankrupt && state.phase !== 'gameover') {
          get().debugTriggerEnding('bankrupt');
        } else if (player && !player.isBankrupt) {
          get().endTurn();
        }
      },



      checkGlobalVictoryOrContinue: () => {
        const state = get();
        // 1. 檢查是否有存活玩家達成勝利條件 (這裡跑第四步)
        const winner = state.players.find(p => !p.isBankrupt && EndingEngine.resolveGameStatus(p, state.turn).isGameOver);
        
        if (winner) {
          const res = EndingEngine.resolveGameStatus(winner, state.turn);
          set({ phase: 'victory', endingResult: res.endingResult });
        } else {
          // 2. 正常回到 Dashboard 準備下一個動作
          // 不做任何事，玩家會停留在 Dashboard，此時回合已正式輪轉。
        }
      },
    }),
    { name: 'antigravity-game-storage', storage: createJSONStorage(() => localStorage) }
  )
);
