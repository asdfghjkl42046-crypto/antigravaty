/**
 * 遊戲全域大腦樞紐
 * 這是整款遊戲的記憶體，負責緊緊記住每位首腦現在口袋裡有多少錢、被抓到了什麼把柄，
 * 並將這些資訊精準地同步顯示到畫面（前端）上。
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  sortTurnOrder,
  sha256,
  applyRoleUpgrade,
  performAction as performActionEngine,
  resolveGameStatus,
  settleEndOfTurn,
  applyRedrawCards,
  initializeGameSession,
  PlayerConfig,
} from '../engine/GameEngine';
import { getCTOAntiTheftCount } from '../engine/RoleEngine';

export type { PlayerConfig };

import {
  Player,
  ActionLog,
  GameStateData,
  ActionResult,
  BetChoice,
  TrialStage,
  RoleType,
  JudgePersonality,
  JudgeMode,
  Tag,
} from '../types/game';
import { CourtEngine } from '../engine/CourtEngine';
import { settleBet } from '../engine/MechanicsEngine';
import { applyPRDiscount } from '../engine/RoleEngine';

// ============================================================
// 定義出主程式(前端)可以向大腦發送哪些「神經指令」
// ============================================================

interface GameStore extends GameStateData {
  // --- 基礎系統生命週期動作 ---
  initGame: (configs: PlayerConfig[]) => Promise<void>;
  resetGame: () => void;
  setJudgeMode: (mode: JudgeMode) => void;
  clearStartNotifications: () => void;
  clearEngineError: () => void; // 清除並重置引擎報錯

  // --- 遊戲卡牌核心流程 ---
  performAction: (
    cardId: string,
    optionIdx: 1 | 2 | 3,
    declareChoice?: 'declare' | 'skip'
  ) => Promise<ActionResult>;
  endTurn: () => void;
  redrawCards: () => { success: boolean; message: string };
  upgradeRole: (role: RoleType) => { success: boolean; message: string };

  // --- 法庭與判定子系統 (對應 GEMINI.md §6 法庭攻防戰) ---
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
  resolveTrial: (extraAppeal?: boolean) => void;
  setTrialReady: (ready: boolean) => void;
  tickTrialTimer: () => void;

  // --- 輔助擷取器 ---
  getCurrentPlayer: () => Player | null;

  // --- 開發人員偵錯工具 ---
  debugUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
  hardReset: () => void;
}

// ============================================================
// 遊戲資料庫實體建構
// ============================================================

export const useGameStore = create<GameStore>()(
  // 防掛網與斷線機制：
  // 這裡會將整個遊戲紀錄深深烙印在你的瀏覽器裡，就算你不小心按到 F5 或關閉網頁，
  // 下次點開遊戲，你的前一筆貪污紀錄依然穩穩地躺在那裡，無處可逃。
  persist(
    (set, get) => ({
      // --- 初始預設狀態 ---
      players: [], // 參與這局遊戲的所有玩家實例陣列
      turn: 1, // 目前進行到全局第幾回合
      currentPlayerIndex: 0, // 目前輪到哪一位玩家(索引值)行動
      phase: 'play', // 遊戲當前大階段 (play 一般遊玩, courtroom 法庭對決, gameover 遊戲結束)
      actionLogs: [], // 洗錢與黑箱操作的全域歷史稽核金流紀錄表
      trial: null, // 若有人被告，此物件會存放該案件的所有法庭庭審狀態
      judgePersonality: null, // 本屆最高法院的法官性格與裁決風格
      judgeMode: 'website', // AI 法官連線模式設定
      startNotifications: [], // 開局加成紅利廣播訊息存放陣列
      endingResult: null, // 全局破關或破產結算時的大表
      engineError: null, // 核心引擎致命錯誤攔截快照

      // --- 基礎動作實作 ---
      setJudgeMode: (mode: JudgeMode) => set({ judgeMode: mode }),

      // 開局大典：把選擇好黑心路線的玩家們全部拉進系統，並分配好他們天生的財產與業障
      initGame: async (configs) => {
        const { players, judgePersonality, startNotifications } = await initializeGameSession(
          configs,
          sortTurnOrder
        );

        set({
          players,
          judgePersonality,
          startNotifications,
          turn: 1,
          currentPlayerIndex: 0,
          phase: 'play',
          actionLogs: [],
          trial: null,
        });
      },

      // 宇宙重啟鍵：徹底清除所有企業資產、法庭紀錄與恩怨，準備迎來下一局全新的商戰
      resetGame: () => {
        set({
          players: [],
          turn: 1,
          currentPlayerIndex: 0,
          phase: 'play',
          actionLogs: [],
          trial: null,
          judgePersonality: null,
          judgeMode: 'website',
          startNotifications: [],
          endingResult: null,
          engineError: null,
        });
      },

      clearStartNotifications: () => set({ startNotifications: [] }),
      clearEngineError: () => set({ engineError: null }),

      // --- 核心決策指派：玩家抽卡、付錢、做決定的統一控制台 ---
      performAction: async (cardId, optionIdx, declareChoice) => {
        // 從目前的記憶體庫(Store)中抓出當前輪到行動的當局者
        const state = get();
        const players = state.players; // Get all players for CTO check
        const player = players[state.currentPlayerIndex];

        // 體力防呆：如果這名首腦的行動力 (AP) 已經被榨乾，拒絕讓他亂做事
        if (!player || player.ap <= 0) {
          return { success: false, message: '行動力 (AP) 不足！', updates: {} } as ActionResult;
        }

        try { // [修正] 行動結算錯誤攔截
          // 1. 將這個決定丟給地下引擎去結算（扣錢、判斷機率、跟產生防偽紀錄）
          // [CTO 反制偵測] 檢查是否有其他技術長佈下的專利陷阱 (可疊加)
          const counterCTOCount = getCTOAntiTheftCount(players, player.id);

          const result = (await performActionEngine(
            player,
            cardId,
            optionIdx,
            player.lastHash,
            declareChoice || 'skip', // 提供預設值
            state.turn,
            counterCTOCount
          )) as ActionResult & { hashedTags: Tag[]; finalHash: string };

          // 如果行動失敗、沒退費而且也沒有新犯罪標籤產出，代表是無效決策，直接退出
          if (!result.success && !result.apRefunded && result.hashedTags.length === 0) {
            return result;
          }

          // 2. 結算完畢後，把新帳本（金錢變動、新長出來的黑料）確實寫回前端的畫面中
          set((s) => {
            const players = [...s.players];
            const p = { ...players[s.currentPlayerIndex] };

            players[s.currentPlayerIndex] = {
              ...p,
              ...result.updates,
              // 將新鑄造的標籤與舊有標籤安全合併
              tags: [...p.tags, ...result.hashedTags],
              // 替換防偽指紋鎖
              lastHash: result.finalHash,
              totalTagsCount: (p.totalTagsCount || 0) + result.hashedTags.length,
            };
            return { players };
          });

          // 3. 全球歷史日誌打卡：把這筆交易永遠刻在畫面左下角的日誌面板裡，並上鎖防竄改
          const prevLogs = get().actionLogs;
          const prevLogHash = prevLogs.length > 0 ? prevLogs[prevLogs.length - 1].hash : 'GENESIS';
          const logHash = await sha256(prevLogHash + result.log.cardId + result.log.timestamp);
          const newLog: ActionLog = { ...result.log, hash: logHash };

          set((s) => ({ actionLogs: [...s.actionLogs, newLog] }));

          // 4. 猝死判定：檢查這波魯莽的操作有沒有直接把公司搞到資金斷裂破產
          const finalPlayer = get().players[get().currentPlayerIndex];
          const resolution = resolveGameStatus(finalPlayer, state.turn);

          // 如果撞到死線，立刻鎖死狀態機將遊戲進入 gameover 畫面
          if (resolution.isGameOver) {
            set((s) => {
              const players = [...s.players];
              players[s.currentPlayerIndex] = resolution.updatedPlayer || {
                ...finalPlayer,
                isBankrupt: true,
              };
              return { players, phase: resolution.phase, endingResult: resolution.endingResult };
            });
            return result;
          }

          // 5. 惹禍上身：如果失敗會引發國家級關注（特殊關鍵字 'sue'），直接把場景從辦公室拖進法院
          if (result.forcedTrial) {
            get().triggerTrial(
              finalPlayer.id,
              result.forcedTrial.tagId,
              true,
              result.forcedTrial.reason
            );
          }

          return result;
        } catch (err: any) {
          // 捕捉引擎拋出的致命錯誤 (如 Numerical Check Error)
          console.error('[Action Fatal Error]', err);
          set({ engineError: { context: `卡牌行動 (${cardId})`, message: err.message } });
          return { success: false, message: '🚨 運算核心發生異常，已啟動緊急熔斷。', updates: {} } as ActionResult;
        }
      },

      // 放棄目前機會：付出一點體力，叫秘書把桌上 5 張提案全換掉
      redrawCards: () => {
        const { players, currentPlayerIndex } = get();
        const player = players[currentPlayerIndex];
        if (!player) return { success: false, message: '無效玩家' };

        const res = applyRedrawCards(player);
        if (res.success) {
          const updated = [...players];
          updated[currentPlayerIndex] = { ...player, ...res.updates };
          set({ players: updated });
        }
        return { success: res.success, message: res.message };
      },

      // 購買人資技能的介面包裹器
      upgradeRole: (role) => {
        const { players, currentPlayerIndex } = get();
        const player = players[currentPlayerIndex];
        if (!player) return { success: false, message: '無效玩家' };

        // 派發予 RoleEngine 計算是否能買、扣除多少點數
        const res = applyRoleUpgrade(player, role);
        if (res.success) {
          const updated = [...players];
          updated[currentPlayerIndex] = { ...player, ...res.updates };
          set({ players: updated });
        }
        return res;
      },

      // 結束這回合：把控制權限交給下一家，並在此刻結算各式各樣的被動利息
      endTurn: () => {
        const { players, currentPlayerIndex, turn, trial } = get();
        const updatedPlayers = [...players];
        const player = updatedPlayers[currentPlayerIndex];

        try { // [修正] 回合結算錯誤攔截
          // 1. 將該名玩家丟去過 Mechanics Engine 的「回合末結算機制」(計算各種天賦分紅與白嫖名聲)
          const updates = settleEndOfTurn(player, turn);
          updatedPlayers[currentPlayerIndex] = { ...player, ...updates };

          // 準備把操縱權杖交給陣列中的下一位
          let nextIndex = currentPlayerIndex + 1;
          let nextTurn = turn;
          let finalPlayers = updatedPlayers;

          // 2. 當所有董事長都做完決定時，正式推進到下一回合
          if (nextIndex >= players.length) {
            nextIndex = 0; // 指標歸零回第一人
            nextTurn = turn + 1; // 跨入下一個全新回合
            // 全員輪畢，必須依照每人身上現有的資源量，透過 Engine 重新洗牌決定下一回合的出牌先後順位
            finalPlayers = sortTurnOrder(updatedPlayers, nextTurn);
          }

          // 3. 全面結局校驗：跨回合期間看有沒有人因為信託移轉抽乾現金等原因宣告破產
          for (const p of finalPlayers) {
            if (p.isBankrupt) continue;
            const res = resolveGameStatus(p, nextTurn);
            if (res.isGameOver) {
              set({
                players: finalPlayers,
                phase: res.phase,
                endingResult: res.endingResult,
                turn: Math.min(nextTurn, 50),
              });
              return;
            }
          }

          // 4. 重頭戲起訴審計機制：每當有人按結束鍵，法院就有機率寄來傳票！
          const trialToTrigger = trial
            ? null // 前有官司未了則跳過
            : CourtEngine.checkAndTriggerIndictment(finalPlayers, nextTurn);

          // 將更新後的全域指標、回合與人數寫回 Store
          set({ players: finalPlayers, currentPlayerIndex: nextIndex, turn: nextTurn });

          // 若倒楣抽中法院傳票（有人平時壞事做太多），立刻將畫面強制切換至起訴庭模式
          if (trialToTrigger) get().triggerTrial(trialToTrigger);
        } catch (err: any) {
          console.error('[EndTurn Fatal Error]', err);
          set({ engineError: { context: '回合階段結算', message: err.message } });
        }
      },

      // ----------------------------------------------------
      // 以下全都是法庭在使用的按鈕與流程控制器
      // 實際的輸贏算法都在 CourtEngine 當中，這裡只負責讓畫面動起來
      // ----------------------------------------------------

      // 觸發法庭主入口
      triggerTrial: (defendantId, forcedTagId, isInevitable = false, reason = '') => {
        const { players, judgeMode, judgePersonality } = get();
        const p = judgePersonality || 'traditionalist';
        const trialUpdates = CourtEngine.prepareTrial(
          players,
          defendantId,
          judgeMode,
          p,
          forcedTagId,
          isInevitable,
          reason
        );
        if (trialUpdates) {
          set({ phase: 'courtroom', trial: trialUpdates as NonNullable<GameStore['trial']> });
        }
      },

      setTrialStage: (stage) => {
        const t = get().trial;
        if (!t) return;
        const updates = CourtEngine.determineNextTrialStage(t, stage);
        set({ trial: { ...t, ...updates } as NonNullable<GameStore['trial']> });
      },

      nextBystander: () => {
        const t = get().trial;
        if (!t) return;
        set({
          trial: {
            ...t,
            actingBystanderIndex: t.actingBystanderIndex + 1,
            isReady: t.stage === 2 || t.stage === 3,
            timer: 0,
          },
        });
      },

      addIntervention: (pid, txt) => {
        const t = get().trial;
        if (!t) return;
        set({ trial: { ...t, interventions: [...t.interventions, { playerId: pid, text: txt }] } });
      },

      placeBet: (pid, choice) => {
        const t = get().trial;
        if (!t || pid === t.defendantId) return;
        set({ trial: { ...t, bets: [...t.bets, { playerId: pid, choice }] } });
      },

      submitDefense: (idx, txt) => {
        const t = get().trial;
        if (!t) return;
        const def = get().players.find((p) => p.id === t.defendantId);
        if (!def) return;

        const outcome = CourtEngine.determineDefenseOutcome(def, t, txt, get().judgeMode, get().turn);
        set({ trial: { ...t, ...outcome } as NonNullable<GameStore['trial']> });
      },

      // 啟動律師 LV3 金錢保釋免控訴
      withdrawCase: () => {
        const { trial, players } = get();
        if (!trial) return;
        const idx = players.findIndex((p) => p.id === trial.defendantId);
        if (idx === -1) return;
        const def = players[idx];

        const res = CourtEngine.applyWithdrawCase(def, trial.lawCase.tag, trial.lawCaseTagId || 0);
        if (res.success) {
          const final = { ...def, ...res.updates };
          const statusRes = resolveGameStatus(final, get().turn);
          const updatedPlayers = [...players];
          updatedPlayers[idx] = statusRes.isGameOver
            ? statusRes.updatedPlayer || { ...final, isBankrupt: true }
            : final;
          set({
            players: updatedPlayers,
            phase: statusRes.isGameOver ? statusRes.phase : 'play',
            trial: null,
            endingResult: statusRes.endingResult,
          });
        }
      },

      // 觸動極端權力：非常上訴強制重新答辯
      extraordinaryAppeal: () => {
        const { trial, players } = get();
        if (!trial || trial.extraAppealUsed) return;
        const idx = players.findIndex((p) => p.id === trial.defendantId);
        if (idx === -1) return;

        const res = CourtEngine.applyExtraAppeal(players[idx]);
        if (!res.success) return;

        const updated = [...players];
        updated[idx] = { ...updated[idx], ...res.updates };

        const sorted = sortTurnOrder(updated, get().turn);
        const newIdx = sorted.findIndex((p) => p.id === trial.defendantId);
        set({
          players: sorted,
          currentPlayerIndex: newIdx,
          trial: {
            ...trial,
            stage: 7,
            extraAppealUsed: true,
            isAppeal: true,
            isDefenseSuccess: undefined,
            isReady: false,
            timer: 0,
          },
        });
      },

      // 結案並派發最後的罰款/好名聲獎勵
      resolveTrial: () => {
        const { trial, players } = get();
        if (!trial) return;
        const idx = players.findIndex((p) => p.id === trial.defendantId);
        if (idx === -1) return;
        const def = players[idx];
        const updatedPlayers = [...players]; // Moved up for bet settlement

        // 1. 結算所有旁觀者的賭局勝負。必須先計算，因為這會動到 players 陣列中其他人的資產。
        trial.bets?.forEach((b) => {
          const bIdx = updatedPlayers.findIndex((p) => p.id === b.playerId);
          if (bIdx !== -1) {
            // [修正] 徹底實行 Immutability：先複製物件，再修改屬性 (疑點 1)
            const bp = { ...updatedPlayers[bIdx] };
            const betRes = settleBet(bp, b.choice, trial.isDefenseSuccess || false);

            bp.g = Math.max(0, bp.g + betRes.gGain);
            bp.ip = Math.max(0, bp.ip + betRes.ipGain);

            let rpChange = betRes.rpGain;
            if (rpChange < 0) {
              rpChange = applyPRDiscount(bp, rpChange);
            }
            bp.rp = Math.max(0, Math.min(100, bp.rp + rpChange));

            // 將新物件塞回暫存陣列中
            updatedPlayers[bIdx] = bp;
          }
        });

        // 2. 結算被告本人的判定結果。
        // [修正] 從更新後的陣列中抓出被告最新的狀態 (包含剛下注後的變動)
        const currentDef = updatedPlayers[idx];
        const updates = CourtEngine.applyTrialResolution(
          currentDef,
          trial.isDefenseSuccess || false,
          trial.lawCase.tag,
          trial.lawCaseTagId || 0,
          trial.judgePersonality,
          get().turn
        );

        // 合併結果並進行最終存活校驗
        const final = { ...currentDef, ...updates };
        const res = resolveGameStatus(final, get().turn);

        updatedPlayers[idx] = res.isGameOver
          ? res.updatedPlayer || { ...final, isBankrupt: true }
          : final;

        set({
          players: updatedPlayers,
          phase: res.isGameOver ? res.phase : 'play',
          trial: null,
          endingResult: res.endingResult,
        });
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
