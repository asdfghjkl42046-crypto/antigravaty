import {
  Player,
  LawCase,
  JudgePersonality,
  JudgeMode,
  TrialState,
  TrialStage,
  NumericalDiffs,
} from '../types/game';
import {
  getIndictmentChance,
  calculateConvictionPenalty,
  calculateSpectatorInfluence,
  settleBet,
} from './MechanicsEngine';
import { LAW_CASES_DB, formatLawTags, normalizeLawCaseId } from '../data/laws/LawCasesDB';
import { removeBlackMaterialsByTag, getTotalBlackMaterials } from './PlayerEngine';
import {
  getRandomTemplate,
  JUDGE_LABELS,
} from '../data/judges/JudgeTemplatesDB';
import { AIEngine } from './AIEngine';
import {
  getWithdrawCaseCost,
  getExtraAppealCost,
  getLawyerDefenseBonus,
  applyPRDiscount,
  getRoleLevel,
} from './RoleEngine';
import { AI_LAW_CASES_DB } from '../data/ailaws/AILawCasesDB';
import {
  throwTrialInitializationError,
  throwNumericalCheckError,
  throwDataDefinitionError,
} from './errors/EngineErrors';

/**
 * 法庭與審判中心
 * 負責處理玩家被警察抓、選罪名、在法庭上的辯護，以及法官最後的判決。
 */
export class CourtEngine {

  /**
   * 起訴輪盤：隨機抽出這回合哪位玩家要上法庭
   * 黑材料越多的人，中獎機率就越高。
   */
  static spinRussianRoulette(players: Player[]): Player | null {
    const activePlayers = players.filter((p) => !p.isBankrupt);
    if (activePlayers.length === 0) return null;

    let totalBM = 0;
    const candidates = activePlayers
      .map((p) => {
        const bm = getTotalBlackMaterials(p);
        return { player: p, bm };
      })
      .filter((c) => c.bm > 0);

    candidates.forEach((c) => (totalBM += c.bm));
    if (totalBM === 0) return null;

    if (Number.isNaN(totalBM)) {
      throwNumericalCheckError(
        'CourtEngine.spinRussianRoulette',
        '全場總黑材料數計算結果為 NaN，起訴程序被迫中斷。'
      );
    }

    let roll = Math.random() * totalBM;
    for (const c of candidates) {
      if (roll <= c.bm) return c.player;
      roll -= c.bm;
    }
    return activePlayers[activePlayers.length - 1];
  }

  /**
   * 挑選罪名：從玩家身上的犯罪紀錄中，隨機選一個還沒結案的來起訴
   */
  static pickLawCase(player: Player): { lawCase: LawCase; tagId: number } | null {
    const validCrimeTags = player.tags.filter((t) => {
      if (t.isResolved) return false;
      const hasEvidence = player.blackMaterialSources.some(
        (s) => s.actionId === t.id && s.count > 0
      );
      if (!hasEvidence) return false;
      const hasSpecificCase =
        !!t.lawCaseIds &&
        t.lawCaseIds.length > 0 &&
        t.lawCaseIds.some((id) => !!LAW_CASES_DB[normalizeLawCaseId(id)]);

      if (!hasSpecificCase) return false;
      return true;
    });

    if (validCrimeTags.length === 0) return null;

    const randomTag = validCrimeTags[Math.floor(Math.random() * validCrimeTags.length)];
    const lawCaseId = randomTag.lawCaseIds!
      .map(id => normalizeLawCaseId(id))
      .find((id) => !!LAW_CASES_DB[id]);

    if (!lawCaseId) {
      throwDataDefinitionError(
        `標籤 [${randomTag.text}]`,
        `法庭無法對位法律 ID。原始: ${randomTag.lawCaseIds?.join(',')}，請檢查法條定義。`
      );
    }

    const lawCase = LAW_CASES_DB[lawCaseId];
    return { lawCase, tagId: randomTag.id };
  }

  /**
   * 法官開庭：產生宣判開場白與質詢文案
   */
  static generateTrialNarrative(
    mode: JudgeMode,
    personality: JudgePersonality,
    lawCase: LawCase
  ): { narrative: string; question: string } {
    const narrative = lawCase.indictment || `【起訴事實：${formatLawTags(lawCase.tag)}】`;
    const question = ''; 
    return { narrative, question };
  }

  /**
   * 法官敲槌：產生最終判決文案
   */
  static generateJudgment(
    mode: JudgeMode,
    personality: JudgePersonality,
    trial: TrialState,
    defendant: Player,
    isSuccess: boolean
  ): { judgment: string; userPrompt: string } {
    let templates: string[];

    if (mode === 'ai') {
      const aiCase = AI_LAW_CASES_DB[trial.lawCase.id];
      const aiWin = aiCase?.ai_judgment_win || '【AI法官判決台詞尚未填寫】';
      const aiLose = aiCase?.ai_judgment_lose || '【AI法官判決台詞尚未填寫】';
      templates = isSuccess ? [aiWin] : [aiLose];
    } else {
      let specificText = '';
      if (trial.chosenDefenseLabel === trial.lawCase.defense_j_text && trial.lawCase.web_judgment_j) {
        specificText = trial.lawCase.web_judgment_j + (trial.lawCase.edu_j ? `\n\n📌 法律教育：\n${trial.lawCase.edu_j}` : '');
      } else if (trial.chosenDefenseLabel === trial.lawCase.defense_k_text && trial.lawCase.web_judgment_k) {
        specificText = trial.lawCase.web_judgment_k + (trial.lawCase.edu_k ? `\n\n📌 法律教育：\n${trial.lawCase.edu_k}` : '');
      } else if (trial.chosenDefenseLabel === trial.lawCase.defense_l_text && trial.lawCase.web_judgment_l) {
        specificText = trial.lawCase.web_judgment_l + (trial.lawCase.edu_l ? `\n\n📌 法律教育：\n${trial.lawCase.edu_l}` : '');
      }

      if (specificText) {
        templates = [specificText];
      } else {
        const webWin = '【網站模式預設勝訴】你說得過去，撤訴。';
        const webLose = '【網站模式預設敗訴】你說不過去，有罪。';
        templates = isSuccess ? [webWin] : [webLose];
      }
    }

    const generatedTemplate = getRandomTemplate(templates, {
      tag: formatLawTags(trial.lawCase.tag),
      defense: trial.chosenDefenseLabel || '',
      bm: (defendant.blackMaterialSources || []).reduce((acc, s) => acc + s.count, 0),
      trials: defendant.totalTrials + (isSuccess ? 0 : 1),
      rp: defendant.rp,
    });

    if (mode === 'ai') {
      return {
        judgment: `【系統模擬：${JUDGE_LABELS[personality].name}】\n${generatedTemplate}`,
        userPrompt: AIEngine.assembleJudgmentPrompt({ ...trial, isDefenseSuccess: isSuccess }, defendant),
      };
    }
    return { judgment: generatedTemplate, userPrompt: '' };
  }

  /**
   * 計算累犯加重階梯 (依照憲法第 1-3 條)
   */
  static getRecidivismMultiplier(trials: number = 0): number {
    if (trials >= 7) return 6.0;
    if (trials >= 4) return 3.0;
    return 1.0;
  }

  /**
   * 結算各種訴訟/結案產生的金錢與名聲懲罰
   */
  static calculatePenalty(
    player: Player,
    tagText: string | string[],
    currentTurn: number = 999,
    tagId?: number,
    isAppeal: boolean = false
  ): { fine: number; rpLoss: number; detail: string } {
    const searchTag = formatLawTags(tagText);
    const targetTag = player.tags.find((t) => (tagId && t.id === tagId) || t.text === searchTag);

    if (!targetTag) {
      throwDataDefinitionError(
        `法庭判決結算 [${searchTag}]`,
        `找不到對應的犯罪標籤數據 (ID: ${tagId})。數據鏈結已斷裂，無法進行合法判決。`
      );
    }

    let netIncome = targetTag.netIncome || 0;
    if (targetTag.lawCaseIds && targetTag.lawCaseIds.some((id) => id.startsWith('E-'))) {
      netIncome = 500;
    }

    const baseResult = calculateConvictionPenalty(player, netIncome, currentTurn, targetTag.turn === 0, isAppeal);
    const trials = player.totalTrials || 0;
    const recidivismMultiplier = this.getRecidivismMultiplier(trials);

    // [核心修正] 直接選用 baseResult.fine。
    // 底層 MechanicsEngine.calculateConvictionPenalty 已經處理了「所得 * 累犯 * 上訴 * 折扣」的完整鏈條。
    // 在此手動乘法會導致倍率重複套用（Double Counting）。
    const finalFine = baseResult.fine;

    const trialLabel = isAppeal ? '[非常上訴失敗]' : `[第 ${trials + 1} 次涉案]`;
    const reciLabel = recidivismMultiplier > 1 ? ` (適用累犯加重階段)` : '';
    const detail = `${baseResult.detail}\n- ${trialLabel}${reciLabel} → 最終結算金額`;

    return { fine: finalFine, rpLoss: baseResult.rpLoss, detail: detail };
  }

  /**
   * 計算辯護結果：根據玩家的勝率、旁觀者的影響力，以及是否有律師加成，決定官司贏不贏。
   */
  static calculateDefenseResult(
    mode: JudgeMode,
    player: Player,
    lawCase: LawCase,
    text: string,
    spectatorInfluence: number = 0,
    optionIndex?: 'J' | 'K' | 'L' | string
  ): { isSuccess: boolean; rate: number } {
    if (typeof lawCase.survival_rate !== 'number') {
      throwDataDefinitionError('CourtEngine.calculateDefenseResult', `法條 ${lawCase.id} 缺少基礎勝率設定。`);
    }

    let finalSurvivalRate = lawCase.survival_rate + spectatorInfluence;
    if (optionIndex === 'K') finalSurvivalRate += 0.05;
    else if (optionIndex === 'L') finalSurvivalRate += 0.1;
    
    finalSurvivalRate += getLawyerDefenseBonus(player);
    finalSurvivalRate = Math.max(0, Math.min(1.0, finalSurvivalRate));
    const isSuccess = Math.random() < finalSurvivalRate;
    return { isSuccess, rate: finalSurvivalRate };
  }

  /**
   * 律師大絕招：『撤銷控訴』
   * 如果律師等級夠高且錢夠多，可以直接把這條官司「搓掉」。
   */
  static applyWithdrawCase(
    player: Player,
    tag: string,
    tagId: number
  ): { success: boolean; message: string; updates: Partial<Player>; diffs: import('../types/game').NumericalDiffs } {
    if (getRoleLevel(player, 'lawyer') < 3) {
      return {
        success: false,
        message: '您的律師等級不足以發動「強制撤告」。',
        updates: {},
        diffs: { g: 0, rp: 0, ip: 0, bm: 0 },
      };
    }

    const cost = getWithdrawCaseCost(player);
    const totalRequiredG = cost.g;
    const canAfford = player.g + (player.trustFund || 0) >= totalRequiredG;

    if (!canAfford) {
      return {
        success: false,
        message: '您的資金不足以支付強制撤告的規費。',
        updates: {},
        diffs: { g: 0, rp: 0, ip: 0, bm: 0 },
      };
    }

    // 優先扣除海外信託
    const ogDeduct = Math.min(player.trustFund || 0, totalRequiredG);
    const gDeduct = totalRequiredG - ogDeduct;

    const oldBMCount = player.blackMaterialSources?.length || 0;
    const updatedBM = removeBlackMaterialsByTag(player, tag, tagId);
    const removedCount = oldBMCount - updatedBM.length;

    return {
      success: true,
      message: `強制撤告成功！清理了 ${removedCount} 件相關黑材料。`,
      updates: {
        g: player.g - gDeduct,
        ip: player.ip - cost.ip, // [新增] 扣除 5 點 IP
        trustFund: (player.trustFund || 0) - ogDeduct,
        blackMaterialSources: updatedBM,
        tags: player.tags.map((t) => (t.id === tagId ? { ...t, isResolved: true } : t)),
      },
      diffs: {
        g: -gDeduct,
        trust: -ogDeduct,
        rp: 0,
        ip: -cost.ip, // [修正] 顯示 IP 扣除
        bm: -removedCount,
      },
    };
  }

  /**
   * 最後希望：『非常上訴』
   * 輸了官司後，還有一次機會可以花大錢重審，但一輩子只能用一次。
   */
  static applyExtraAppeal(player: Player): { success: boolean; message: string; updates: Partial<Player>; diffs: import('../types/game').NumericalDiffs } {
    if (player.hasUsedExtraAppeal) {
      return {
        success: false,
        message: '您已使用過非常上訴程序，無法再次申請。',
        updates: {},
        diffs: { g: 0, rp: 0, ip: 0, bm: 0 },
      };
    }

    const totalRequiredG = getExtraAppealCost(player);
    const canAfford = player.g + (player.trustFund || 0) >= totalRequiredG;

    if (!canAfford) {
      return {
        success: false,
        message: '您的資金不足以支付非常上訴的規費。',
        updates: {},
        diffs: { g: 0, rp: 0, ip: 0, bm: 0 },
      };
    }

    // 優先扣除海外信託
    const ogDeduct = Math.min(player.trustFund || 0, totalRequiredG);
    const gDeduct = totalRequiredG - ogDeduct;

    return {
      success: true,
      message: '非常上訴已啟動，案件重回旁聽干預階段。',
      updates: {
        g: player.g - gDeduct,
        trustFund: (player.trustFund || 0) - ogDeduct,
        hasUsedExtraAppeal: true,
      },
      diffs: {
        g: -gDeduct,
        trust: -ogDeduct,
        rp: 0,
        ip: 0,
        bm: 0
      }
    };
  }

  /**
   * 決定辯護下場：結算玩家是在法庭上大獲全勝，還是被罰到脫褲子。
   */
  static determineDefenseOutcome(player: Player, trial: TrialState, optionIdx: number, text: string, judgeMode: JudgeMode, currentTurn: number): Partial<TrialState> {
    const optionMap: Record<number, string> = { 0: 'J', 1: 'K', 2: 'L' };
    const optionLabel = optionMap[optionIdx] || 'J';
    const spectatorInfluence = calculateSpectatorInfluence(trial.interventions, getRoleLevel(player, 'lawyer') >= 2);
    const res = this.calculateDefenseResult(judgeMode, player, trial.lawCase, text, spectatorInfluence, optionLabel);
    
    const punishment = res.isSuccess ? undefined : this.calculatePenalty(player, trial.lawCase.tag, currentTurn, trial.lawCaseTagId, trial.isAppeal || false);

    const judge = this.generateJudgment(judgeMode, trial.judgePersonality || 'traditionalist', trial, player, res.isSuccess);
    return { isDefenseSuccess: res.isSuccess, finalSurvivalRate: res.rate, defenseText: text, punishment, punishmentDetail: punishment?.detail, judgment: judge.judgment, userPrompt: judge.userPrompt, stage: 6 };
  }

  /**
   * 檢查要不要抓人：系統會每回合巡視一次，看看哪位玩家黑材料太多該上法院了。
   */
  static checkAndTriggerIndictment(players: Player[], turn: number): string | null {
    const activePlayers = players.filter((p) => !p.isBankrupt);
    if (activePlayers.length === 0) return null;
    let maxChance = -1;
    let targetPlayer: Player | null = null;
    for (const player of activePlayers) {
      const chance = getIndictmentChance(player, turn);
      if (chance > maxChance && chance > 0) {
        maxChance = chance;
        targetPlayer = player;
      }
    }
    if (!targetPlayer || maxChance <= 0) return null;
    const roll = Math.random() * 100;
    if (roll < maxChance) return this.spinRussianRoulette(players)?.id || null;
    return null;
  }

  /**
   * 法庭佈置：設定誰被告、哪條罪、誰是陪審團，準備進入審判流程。
   */
  static prepareTrial(players: Player[], defendantId: string, judgeMode: JudgeMode, personality: JudgePersonality, forcedTagId?: number, isInevitable = false, reason = ''): Partial<TrialState> | null {
    const defendant = players.find((p) => p.id === defendantId);
    if (!defendant || getTotalBlackMaterials(defendant) === 0) return null;
    const bystanderIds = players.filter((p) => !p.isBankrupt && p.id !== defendantId).map((p) => p.id);
    let lawCase: LawCase | null = null;
    let tagId: number = 0;

    if (forcedTagId) {
      const target = defendant.tags.find((t) => t.id === forcedTagId);
      if (target) {
        const lawCaseId = target.lawCaseIds?.map((id) => normalizeLawCaseId(id)).find((id) => !!LAW_CASES_DB[id]);
        if (!lawCaseId) throwTrialInitializationError('法庭初始化', `強制標籤缺失法條。`);
        lawCase = LAW_CASES_DB[lawCaseId];
        tagId = target.id;
      }
    }

    if (!lawCase) {
      const res = this.pickLawCase(defendant);
      if (!res) throwTrialInitializationError('法庭初始化', `玩家資料異常。`);
      lawCase = res.lawCase;
      tagId = res.tagId;
    }

    const narrative = this.generateTrialNarrative(judgeMode, personality, lawCase);
    return {
      defendantId, lawCase, lawCaseTagId: tagId, stage: 1, bystanderIds, actingBystanderIndex: 0,
      interventions: [], bets: [], question: narrative.question, narrative: narrative.narrative,
      isReady: true, timer: 30, isInevitable, forcedReason: reason, judgePersonality: personality
    };
  }

  /**
   * 法庭流程進度：管理目前是檢察官說話、還是陪審團投票、還是被告辯護。
   */
  static determineNextTrialStage(trial: TrialState, targetStage: TrialStage | number): Partial<TrialState> {
    const s = targetStage as TrialStage;
    const skip = trial.bystanderIds.length === 0;
    const resolvedStage = skip && (s === 2 || s === 3) ? 4 : s;
    return { stage: resolvedStage, actingBystanderIndex: (resolvedStage === 2 || resolvedStage === 3 ? 0 : trial.actingBystanderIndex), isReady: (resolvedStage === 2 || resolvedStage === 3), timer: 0 };
  }

  /**
   * 結算法庭結果：不管勝訴或敗訴，事後都要清掉證據、扣除罰款等等。
   */
  static applyTrialResolution(player: Player, isSuccess: boolean, lawCaseTag: string | string[], lawCaseTagId: number, _personality?: JudgePersonality, currentTurn: number = 999, isAppeal: boolean = false): { updates: Partial<Player>; diffs: NumericalDiffs } {
    const updates: Partial<Player> = { ...player };
    const tagText = Array.isArray(lawCaseTag) ? lawCaseTag.join('/') : lawCaseTag;
    if (isSuccess) {
      updates.blackMaterialSources = removeBlackMaterialsByTag(player, tagText, lawCaseTagId);
      updates.tags = player.tags.map((t) => (t.id === lawCaseTagId ? { ...t, isResolved: true } : t));
      
      // [新增] 平反時間：既然都勝訴了，當初為了這件事丟掉的面子 (RP) 當然要全部撿回來
      const targetTag = player.tags.find((t) => t.id === lawCaseTagId);
      if (targetTag && targetTag.rpChange && targetTag.rpChange < 0) {
        const restoreRp = Math.abs(targetTag.rpChange);
        updates.rp = Math.min(100, (updates.rp || player.rp) + restoreRp);
      }
    } else {
      const penalty = this.calculatePenalty(player, lawCaseTag, currentTurn, lawCaseTagId, isAppeal);
      updates.totalTrials = (player.totalTrials || 0) + 1;
      
      const updatedG = player.g - penalty.fine;
      // 核心規則：若有信託基金，現金最低為 0；若無信託，允許為負數（負債）
      updates.g = player.trustFund > 0 ? Math.max(0, updatedG) : updatedG;
      
      updates.rp = Math.max(0, (updates.rp || player.rp) - penalty.rpLoss);
      updates.totalFinesPaid = (player.totalFinesPaid || 0) + penalty.fine;
      updates.blackMaterialSources = removeBlackMaterialsByTag(player, tagText, lawCaseTagId);
      updates.tags = player.tags.map((t) => (t.id === lawCaseTagId ? { ...t, isResolved: true } : t));
    }
    updates.bribeItem = undefined;
    
    // 計算差值
    const diffs: NumericalDiffs = {
      g: (updates.g ?? player.g) - player.g,
      rp: (updates.rp ?? player.rp) - player.rp,
      ip: (updates.ip ?? player.ip) - player.ip,
      bm: -1, // 法庭結案固定減少 1 標籤對應的 BM (雖然 BM 移除邏輯較複雜，這裡簡化顯示)
    };

    return { updates, diffs };
  }

  /**
   * 結算場外下注：讓剛才賭官司勝負的玩家拿錢或被扣名聲。
   */
  static settleTrialBets(players: Player[], trial: TrialState, actualResult: boolean): Player[] {
    return players.map((p) => {
      if (p.id === trial.defendantId) return p;
      const playerBet = trial.bets.find((b) => b.playerId === p.id);
      if (!playerBet || playerBet.choice === 'none') return p;
      const betRes = settleBet(p, playerBet.choice, actualResult);
      const rpChange = betRes.rpGain < 0 ? applyPRDiscount(p, betRes.rpGain) : betRes.rpGain;
      
      const updatedG = p.g + betRes.gGain;
      const finalG = p.trustFund > 0 ? Math.max(0, updatedG) : updatedG;
      
      return { ...p, g: finalG, ip: Math.max(0, p.ip + betRes.ipGain), rp: Math.max(0, Math.min(100, p.rp + rpChange)) };
    });
  }
}
