import {
  GameStateData,
  Player,
  ActionResult,
  ActionLog,
  Tag,
  RoleType,
  PlayerConfig,
} from '../types/game';
import {
  settleEndOfTurn,
  sortTurnOrder,
  resolveGameStatus,
  performAction,
  sha256,
  initializeGameSession,
  applyRedrawCards,
  applyRoleUpgrade,
} from './GameEngine';
import { CourtEngine } from './CourtEngine';
import { getCTOAntiTheftCount } from './RoleEngine';
import { SystemStrings } from '../data/SystemStrings';

/**
 * 遊戲流程引擎 (Game Flow Engine)
 * 負責處理跨回合、角色切換、以及法庭結算後的數據合併邏輯。
 * 讓 Store 保持純淨，不包含任何判斷式。
 */
export class GameFlowEngine {
  /**
   * 處理「結束回合」的流程轉換
   * 返回更新後的狀態部分
   */
  static proceedNextTurn(state: GameStateData): Partial<GameStateData> {
    const { players, currentPlayerIndex, turn, trial } = state;
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayerIndex];
    // 局部預先宣告流程變數
    let nextTurn = turn;
    let nextIndex = currentPlayerIndex + 1;
    let diffs: import('../types/game').NumericalDiffs | undefined = undefined;

    if (!player.isBankrupt) {
      // 1. 執行回合末被動結算
      const endTurnResult = settleEndOfTurn(player, turn);
      const updates = endTurnResult.updates;
      diffs = endTurnResult.diffs;
      updatedPlayers[currentPlayerIndex] = { ...player, ...updates };

      // 2. 局部結局偵測 (是否有人贏了或破產)
      const currentPlayerRes = resolveGameStatus(updatedPlayers[currentPlayerIndex], turn);
      
      // 如果是單人破產 (Eliminated) 但遊戲尚未結束
      if (currentPlayerRes.isEliminated && !currentPlayerRes.isGameOver) {
        if (currentPlayerRes.updatedPlayer) {
          updatedPlayers[currentPlayerIndex] = currentPlayerRes.updatedPlayer;
        }
        // 停留在此玩家，顯示結局報表，但 phase 仍設為 gameover 以利 UI 呈現結算
        return {
          players: updatedPlayers,
          phase: 'gameover',
          endingResult: currentPlayerRes.endingResult,
          turn: Math.min(nextTurn, 50),
        };
      }

      // [修正] 勝利的判斷延後到確認沒有法庭觸發後再進行。這裡只抓破產。
    }

    // 3. 尋找下一位活躍玩家
    let finalPlayers = updatedPlayers;

    const findNextActive = (start: number, list: Player[]) => {
      for (let i = start; i < list.length; i++) {
        if (!list[i].isBankrupt) return i;
      }
      return -1;
    };

    let potentialNext = findNextActive(nextIndex, updatedPlayers);

    if (potentialNext === -1) {
      // 全員輪畢，進入下一回合並重新排位
      nextTurn = turn + 1;
      finalPlayers = sortTurnOrder(updatedPlayers, nextTurn);
      potentialNext = findNextActive(0, finalPlayers);
    }

    nextIndex = potentialNext;

    // 4. 全局結束校驗 (全員破產或滿 50 回合)
    if (nextIndex === -1 || nextTurn > 50) {
      const endingPlayer = finalPlayers.find((p) => !p.isBankrupt) || finalPlayers[0];
      const endingRes = resolveGameStatus(endingPlayer, Math.min(nextTurn, 50), { forceTurn: 51 });
      return {
        players: finalPlayers,
        phase: 'gameover',
        endingResult: endingRes.endingResult,
        turn: Math.min(nextTurn, 50),
      };
    }

    // 5. 結束每位玩家回合後的隨機法庭審計
    const trialToTrigger =
      !trial && finalPlayers.some(p => !p.isBankrupt)
        ? CourtEngine.checkAndTriggerIndictment(finalPlayers, nextTurn)
        : null;

    if (trialToTrigger) {
      return {
        players: finalPlayers,
        currentPlayerIndex: nextIndex,
        turn: nextTurn,
        pendingTrialId: trialToTrigger,
        resultDiffs: diffs,
      };
    }

    // 6. 法庭若無觸發，才判斷剛剛結束回合的玩家是否達成勝利條件
    if (!player.isBankrupt) {
      const currentPlayerRes = resolveGameStatus(updatedPlayers[currentPlayerIndex], turn);
      if (currentPlayerRes.isGameOver) {
        if (currentPlayerRes.updatedPlayer) {
          updatedPlayers[currentPlayerIndex] = currentPlayerRes.updatedPlayer;
        }
        return {
          players: updatedPlayers,
          phase: currentPlayerRes.phase,
          endingResult: currentPlayerRes.endingResult,
          turn: Math.min(nextTurn, 50),
        };
      }
    }

    return {
      players: finalPlayers,
      currentPlayerIndex: nextIndex,
      turn: nextTurn,
      resultDiffs: diffs,
    };
  }

  /**
   * 處理「玩家行動」的所有連鎖反應
   */
  static async executeAction(
    state: GameStateData,
    cardId: string,
    optionIdx: 1 | 2 | 3,
    declareChoice?: 'declare' | 'skip' | 'normal'
  ): Promise<Partial<GameStateData> & { result: ActionResult }> {
    const { players, currentPlayerIndex, turn, actionLogs } = state;
    const player = players[currentPlayerIndex];

    // 1. [統一攔截點] 基本效驗：破產者或 AP 不足者禁止發起行動
    if (player.isBankrupt) {
      return {
        result: { success: false, message: SystemStrings.ERRORS.BANKRUPT_BLOCK, updates: {} } as ActionResult,
      };
    }
    if (player.ap <= 0) {
      return {
        result: { success: false, message: SystemStrings.ERRORS.INSUFFICIENT_AP, updates: {} } as ActionResult,
      };
    }

    // 2. 準備執行環境
    const counterCTOCount = getCTOAntiTheftCount(players, player.id);

    // 3. 調用核心行動引擎
    const result = (await performAction(
      player,
      cardId,
      optionIdx,
      player.lastHash,
      declareChoice || 'normal',
      turn,
      counterCTOCount
    )) as ActionResult & { hashedTags: Tag[]; finalHash: string };

    // 4. 合併玩家狀態變動
    const updatedPlayers = [...players];
    const p = { ...updatedPlayers[currentPlayerIndex] };

    // 如果行動成功或有標籤產生，則套用更新
    if (result.success || result.hashedTags.length > 0) {
      updatedPlayers[currentPlayerIndex] = {
        ...p,
        ...result.updates,
        tags: [...p.tags, ...result.hashedTags],
        lastHash: result.finalHash,
        totalTagsCount: (p.totalTagsCount || 0) + result.hashedTags.length,
      };
    }

    // 5. 生成稽核日誌雜湊鏈
    const prevLogHash = actionLogs.length > 0 ? actionLogs[actionLogs.length - 1].hash : 'GENESIS';
    const logHash = await sha256(prevLogHash + result.log.cardId + result.log.timestamp);
    const newLog: ActionLog = { ...result.log, hash: logHash };

    // 6. 結局與破產判定
    const finalPlayer = updatedPlayers[currentPlayerIndex];
    const status = resolveGameStatus(finalPlayer, turn);

    // 7. 強制起訴檢查
    let finalPhase = status.phase || 'play';
    let finalTrial = state.trial;

    if (result.forcedTrial) {
      const p = state.judgePersonality || 'traditionalist';
      const trialUpdates = CourtEngine.prepareTrial(
        updatedPlayers,
        finalPlayer.id,
        state.judgeMode || 'website',
        p,
        result.forcedTrial.tagId,
        true,
        result.forcedTrial.reason
      );
      if (trialUpdates) {
        finalPhase = 'courtroom';
        finalTrial = trialUpdates as NonNullable<GameStateData['trial']>;
      }
    }

    return {
      players: updatedPlayers,
      actionLogs: [...actionLogs, newLog],
      phase: finalPhase,
      trial: finalTrial,
      endingResult: status.endingResult,
      result, // 回傳原始結果供 UI 顯示
    };
  }

  /**
   * 處理「法庭結案」後的數據總結
   */
  static calculateTrialResolution(state: GameStateData): Partial<GameStateData> {
    const { trial, players, turn } = state;
    if (!trial) return {};

    const idx = players.findIndex((p) => p.id === trial.defendantId);
    if (idx === -1) return {};

    // 1. 結算旁觀者下注
    const isSuccess = trial.isDefenseSuccess || false;
    const updatedPlayers = CourtEngine.settleTrialBets(players, trial, isSuccess);

    // 2. 結算被告裁決
    const trialRes = CourtEngine.applyTrialResolution(
      updatedPlayers[idx],
      isSuccess,
      trial.lawCase.tag,
      trial.lawCaseTagId ?? 0,
      trial.judgePersonality,
      turn,
      trial.isAppeal || false
    );
    const defendantUpdates = trialRes.updates;
    const defendantDiffs = trialRes.diffs;

    // 彙整所有旁觀者的押注結果
    const betDiffs: { playerId: string; amount: number; type: 'ip' | 'rp' | 'g' }[] = [];
    updatedPlayers.forEach((p, pIdx) => {
      if (p.id === trial.defendantId) return;
      const oldP = players.find(oldP => oldP.id === p.id);
      if (!oldP) return;

      const ipDiff = p.ip - oldP.ip;
      const rpDiff = p.rp - Math.min(100, oldP.rp);
      const gDiff = p.g - oldP.g;

      if (ipDiff !== 0) betDiffs.push({ playerId: p.name, amount: ipDiff, type: 'ip' });
      if (rpDiff !== 0) betDiffs.push({ playerId: p.name, amount: rpDiff, type: 'rp' });
      if (gDiff !== 0) betDiffs.push({ playerId: p.name, amount: gDiff, type: 'g' });
    });

    const final = { ...updatedPlayers[idx], ...defendantUpdates };
    const res = resolveGameStatus(final, turn);

    updatedPlayers[idx] = res.updatedPlayer || final;

    return {
      players: updatedPlayers,
      phase: 'play', // [修正] 強制返回 play，將勝利的檢查權轉交給 gameStore 依序執行
      trial: null,
      endingResult: null, // [修正] 由於延後檢查，這裡先不傳遞 endingResult
      // [新增] 傳遞給 Store 以便觸發彈窗
      resultDiffs: {
        ...defendantDiffs,
        bets: betDiffs
      }
    };
  }

  /**
   * 初始化遊戲會話
   */
  static async initializeGame(configs: PlayerConfig[]): Promise<Partial<GameStateData>> {
    const { players, judgePersonality, startNotifications } = await initializeGameSession(
      configs,
      sortTurnOrder
    );

    return {
      players,
      judgePersonality,
      startNotifications,
      turn: 1,
      currentPlayerIndex: 0,
      phase: 'play',
      actionLogs: [],
      trial: null,
    };
  }

  /**
   * 處理洗牌行動
   */
  static handleRedrawCards(state: GameStateData): {
    success: boolean;
    message: string;
    updates: Partial<GameStateData>;
  } {
    const { players, currentPlayerIndex } = state;
    const player = players[currentPlayerIndex];
    if (!player) return { success: false, message: SystemStrings.ERRORS.INVALID_PLAYER, updates: {} };

    const res = applyRedrawCards(player);
    if (!res.success) return { success: false, message: res.message, updates: {} };

    const updated = [...players];
    updated[currentPlayerIndex] = { ...player, ...res.updates };
    return { success: true, message: res.message, updates: { players: updated } };
  }

  /**
   * 處理角色升級
   */
  static handleUpgradeRole(
    state: GameStateData,
    role: RoleType,
    splitOG: number = 0
  ): { success: boolean; message: string; updates: Partial<GameStateData> } {
    const { players, currentPlayerIndex } = state;
    const player = players[currentPlayerIndex];
    if (!player) return { success: false, message: SystemStrings.ERRORS.INVALID_PLAYER, updates: {} };

    const res = applyRoleUpgrade(player, role, splitOG);
    if (!res.success) return { success: false, message: res.message, updates: {} };

    const updated = [...players];
    updated[currentPlayerIndex] = { ...player, ...res.updates };
    return { success: true, message: res.message, updates: { players: updated } };
  }

  /**
   * 處理法庭觸發邏輯
   * [重構] 轉交 CourtEngine 產生 Trial 物件，由外界 (Store) 決定 Phase 切換
   */
  static handleTriggerTrial(
    state: GameStateData,
    defendantId: string,
    forcedTagId?: number,
    isInevitable = false,
    reason = ''
  ): Partial<GameStateData> {
    const { players, judgeMode, judgePersonality } = state;
    const p = judgePersonality || 'traditionalist';
    const trialUpdates = CourtEngine.prepareTrial(
      players,
      defendantId,
      judgeMode || 'website',
      p,
      forcedTagId,
      isInevitable,
      reason
    );
    if (!trialUpdates) return {};
    // 這裡只負責回傳更新，不主動修改 phase，由 Store 決策
    return { trial: trialUpdates as NonNullable<GameStateData['trial']> };
  }

  /**
   * 處理辯護提交邏輯
   */
  static handleSubmitDefense(
    state: GameStateData,
    idx: number,
    txt: string
  ): Partial<GameStateData> {
    const { trial, players, judgeMode, turn } = state;
    if (!trial) return {};
    const def = players.find((p) => p.id === trial.defendantId);
    if (!def) return {};

    const optionLabels: Record<number, string> = {
      0: '方案 J',
      1: '方案 K',
      2: '方案 L',
    };
    const chosenLabel = optionLabels[idx] || '正當業務行為';

    const outcome = CourtEngine.determineDefenseOutcome(
      def,
      { ...trial, chosenDefenseLabel: chosenLabel },
      idx,
      txt,
      judgeMode || 'website',
      turn
    );

    return {
      trial: { ...trial, ...outcome, chosenDefenseLabel: chosenLabel } as NonNullable<
        GameStateData['trial']
      >,
    };
  }

  /**
   * 處理律師撤案
   */
  static handleWithdrawCase(state: GameStateData): Partial<GameStateData> {
    const { trial, players, turn } = state;
    if (!trial) return {};
    const idx = players.findIndex((p) => p.id === trial.defendantId);
    if (idx === -1) return {};

    const res = CourtEngine.applyWithdrawCase(
      players[idx],
      trial.lawCase.tag,
      trial.lawCaseTagId || 0
    );
    if (!res.success) return {};

    const final = { ...players[idx], ...res.updates };
    const statusRes = resolveGameStatus(final, turn);
    const updatedPlayers = [...players];
    updatedPlayers[idx] = statusRes.isGameOver
      ? statusRes.updatedPlayer || { ...final, isBankrupt: true }
      : final;

    return {
      players: updatedPlayers,
      phase: statusRes.isGameOver ? statusRes.phase : 'play',
      trial: null,
      endingResult: statusRes.endingResult,
    };
  }

  /**
   * 處理非常上訴
   */
  static handleExtraordinaryAppeal(state: GameStateData): Partial<GameStateData> {
    const { trial, players, turn } = state;
    if (!trial || trial.extraAppealUsed) return {};
    const idx = players.findIndex((p) => p.id === trial.defendantId);
    if (idx === -1) return {};

    const res = CourtEngine.applyExtraAppeal(players[idx]);
    if (!res.success) return {};

    const updated = [...players];
    updated[idx] = { ...updated[idx], ...res.updates };

    const sorted = sortTurnOrder(updated, turn);
    const newIdx = sorted.findIndex((p: Player) => p.id === trial.defendantId);

    return {
      players: sorted,
      currentPlayerIndex: newIdx,
      trial: {
        ...trial,
        stage: 4, // 跳轉回被告答辯 (6張卡片)
        extraAppealUsed: true,
        isAppeal: true,
        isDefenseSuccess: undefined,
        isReady: false,
        timer: 0,
      },
    };
  }
}
