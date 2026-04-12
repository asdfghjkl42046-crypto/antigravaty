import { COURT_TEXT } from '../data/court/CourtData';
import {
  Player,
  LawCase,
  JudgePersonality,
  JudgeMode,
  TrialState,
  TrialStage,
} from '../types/game';
import {
  getIndictmentChance,
  calculateConvictionPenalty,
  calculateSpectatorInfluence,
  settleBet,
} from './MechanicsEngine';
import { LAW_CASES_DB, formatLawTags } from '../data/laws/LawCasesDB';
import { removeBlackMaterialsByTag, getTotalBlackMaterials } from './PlayerEngine';
import {
  INTERROGATION_TEMPLATES,
  getRandomTemplate,
  JUDGE_LABELS,
} from '../data/judges/JudgeTemplatesDB';
import { AIEngine } from './AIEngine';
import { getWithdrawCaseCost, getLawyerDefenseBonus, applyPRDiscount } from './RoleEngine';
import { AI_LAW_CASES_DB } from '../data/ailaws/AILawCasesDB';
import {
  throwTrialInitializationError,
  throwNumericalCheckError,
  throwDataCorruptionError,
  throwDataDefinitionError,
} from './errors/EngineErrors';

/**
 * 法庭與審判中心
 * 負責處理玩家被警察抓、選罪名、在法庭上的辯護，以及法官最後的判決。
 */
export class CourtEngine {
  /**
   * 計算起訴機率 (GEMINI.md §1-3)
   */
  static calProsecutionProb(player: Player, currentTurn: number): number {
    // 轉發給 MechanicsEngine 進行統一的起訴機率公式計算，維持邏輯單一性
    return getIndictmentChance(player, currentTurn);
  }

  /**
   * 隨機抽出這回合要上法庭的人
   * 身上壞事（黑材料）越多的人，被抓到的機率就越高。
   */
  static spinRussianRoulette(players: Player[]): Player | null {
    // 步驟 1：過濾出尚未破產的活躍玩家，破產者不再列入被起訴名單
    const activePlayers = players.filter((p) => !p.isBankrupt);
    // 若場上無活躍玩家，則中止審判回傳 null
    if (activePlayers.length === 0) return null;

    let totalBM = 0;
    // 步驟 2：統計活躍玩家黑材料總數
    const candidates = activePlayers.map((p) => {
      const bm = getTotalBlackMaterials(p);
      totalBM += bm;
      return { player: p, bm };
    });

    // 步驟 3：如果大家都沒做壞事，就不會有人上法庭
    if (totalBM === 0) {
      return null;
    }

    if (Number.isNaN(totalBM)) {
      throwNumericalCheckError(
        'CourtEngine.spinRussianRoulette',
        '全場總黑材料數計算結果為 NaN，起訴程序被迫中斷。'
      );
    }

    // 步驟 4：進行隨機抽籤，做壞事越多的人，機率越高
    let roll = Math.random() * totalBM;
    for (const c of candidates) {
      // 逐一扣減權重，直到符合隨機值
      if (roll <= c.bm) return c.player;
      roll -= c.bm;
    }
    // 備用防呆機制，若發生浮點數誤差，則回傳最後一名玩家
    return activePlayers[activePlayers.length - 1];
  }

  static pickLawCase(player: Player): { lawCase: LawCase; tagId: number } | null {
    // 步驟 1：過濾出可以告玩家的罪名
    const validCrimeTags = player.tags.filter((t) => {
      // 已經結案（解決過）的罪名不能再告一次
      if (t.isResolved) return false;
      // 檢查該標籤對應的「實體黑材料證據」是否存在
      const hasEvidence = player.blackMaterialSources.some(
        (s) => s.actionId === t.id && s.count > 0
      );
      if (!hasEvidence) {
        // [優化] 若無證據則不可起訴，優雅回傳 false 即可，不應拋出錯誤導致崩潰
        return false;
      }
      // 強制檢查：該標籤必須帶有明確的法律 ID 映射 (lawCaseIds)
      const hasSpecificCase =
        t.lawCaseIds && t.lawCaseIds.length > 0 && t.lawCaseIds.some((id) => !!LAW_CASES_DB[id]);

      if (!hasSpecificCase) {
        throwDataDefinitionError(
          `標籤 [${t.text}] (ID: ${t.id})`,
          `缺少有效的 lawCaseIds 映射，無法對位法條！`
        );
      }

      return true;
    });

    // 步驟 2：若完全找不到符合的違法標籤，代表無犯罪事實，回傳 null 準備讓庭審撤告
    if (validCrimeTags.length === 0) {
      return null;
    }

    // 步驟 3：從合格的犯案標籤中隨機抽取一個做為本次審議案例
    const randomTag = validCrimeTags[Math.floor(Math.random() * validCrimeTags.length)];

    // 取得該標籤定義的法律 ID (由於步驟 1 已驗證過，此處必有值)
    const lawCaseId = randomTag.lawCaseIds!.find((id) => !!LAW_CASES_DB[id])!;

    // 將 LawCase 資料庫實體與玩家標籤 ID 打包回傳
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
    // 統一從各大惡棍法官資料庫中隨機抓取罐頭對白並植入動態變數
    // 以充滿沉浸感的文字給予玩家自由發揮的辯護空間
    const question = getRandomTemplate(INTERROGATION_TEMPLATES[personality], {
      tag: formatLawTags(lawCase.tag),
      lawName: lawCase.lawName,
      hIntent: lawCase.hidden_intent,
      defense: '', // 開場階段尚無玩家選擇的辯護內容
    });
    // 隨機選取入場提審宣言模板，並在適當時機帶入證物清單提升臨場感
    const evidenceSnippet = lawCase.evidence_list?.length
      ? `檢方已列舉【${lawCase.evidence_list[0]}】等重要證物。`
      : '';

    const narratives = [
      `「檢方已取得決定性證據：被告於經營期間涉嫌『${formatLawTags(lawCase.tag)}』行為，觸犯《${lawCase.lawName}》。${evidenceSnippet}正式公訴！」`,
      `「針對被告企業之『${formatLawTags(lawCase.tag)}』異常紀錄，本庭依《${lawCase.lawName}》宣告進入審理時序。${evidenceSnippet}」`,
      `「法庭肅靜！被告涉嫌『${formatLawTags(lawCase.tag)}』此為重大犯罪，現依《${lawCase.lawName}》開庭審理！${evidenceSnippet}」`,
    ];
    return {
      narrative: narratives[Math.floor(Math.random() * narratives.length)],
      question,
    };
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
      if (trial.chosenDefenseLabel === trial.lawCase.defense_j && trial.lawCase.web_judgment_j) {
        specificText = trial.lawCase.web_judgment_j + (trial.lawCase.edu_j ? `\n\n📌 法律教育：\n${trial.lawCase.edu_j}` : '');
      } else if (trial.chosenDefenseLabel === trial.lawCase.defense_k && trial.lawCase.web_judgment_k) {
        specificText = trial.lawCase.web_judgment_k + (trial.lawCase.edu_k ? `\n\n📌 法律教育：\n${trial.lawCase.edu_k}` : '');
      } else if (trial.chosenDefenseLabel === trial.lawCase.defense_l && trial.lawCase.web_judgment_l) {
        specificText = trial.lawCase.web_judgment_l + (trial.lawCase.edu_l ? `\n\n📌 法律教育：\n${trial.lawCase.edu_l}` : '');
      }

      if (specificText) {
        templates = [specificText];
      } else {
        const webWin = trial.lawCase.web_judgment_win || '【網站模式預設勝訴】你說得過去，撤訴。';
        const webLose = trial.lawCase.web_judgment_lose || '【網站模式預設敗訴】你說不過去，有罪。';
        templates = isSuccess ? [webWin] : [webLose];
      }
    }

    // 依據玩家的答辯文本，從模板庫挑選文案並填入動態變數
    const generatedTemplate = getRandomTemplate(templates, {
      tag: formatLawTags(trial.lawCase.tag),
      lawName: trial.lawCase.lawName,
      hIntent: trial.lawCase.hidden_intent,
      defense: trial.chosenDefenseLabel || '',
      bm: (defendant.blackMaterialSources || []).reduce((acc, s) => acc + s.count, 0), // 計算總量
      trials: defendant.totalTrials + (isSuccess ? 0 : 1), // 更新累計涉案次數以便帶入語氣之中
      rp: defendant.rp,
    });

    if (mode === 'ai') {
      // 若為 AI 呼叫，不只產生過渡文字，同時要組合出對大型語言模型的 User Prompt 推理指令
      return {
        judgment: `【系統模擬：${JUDGE_LABELS[personality].name}】\n${generatedTemplate}`,
        userPrompt: AIEngine.assembleJudgmentPrompt(
          { ...trial, isDefenseSuccess: isSuccess }, // 附帶是否勝訴等條件，引導 AI 產出相符結果
          defendant
        ),
      };
    }
    // 一般非 AI 模式則不產出任何 Prompt 關聯變數
    return { judgment: generatedTemplate, userPrompt: '' };
  }

  /**
   * 結算各種訴訟/結案產生的金錢與名聲懲罰 (主要透過外部 MechanicsEngine 處理細節)
   */
  static calculatePenalty(
    player: Player,
    tagText: string | string[],
    currentTurn: number = 999,
    tagId?: number,
    isAppeal: boolean = false,
    personality?: JudgePersonality
  ): { fine: number; rpLoss: number; detail?: string } {
    // 統一處理標籤轉字串，便於後續搜尋與比對
    const searchTag = formatLawTags(tagText);

    // 從玩家歷程中擷取與當前黑材料有關連的標籤，用其淨收入來設定沒收基準點
    // 優化邏輯：優先使用 tagId 精準定位，若無則回歸字串包含判定 (處理複合標籤如 A/B)
    const relatedTags = player.tags.filter((t) => {
      const isIdMatch = tagId !== undefined && t.id === tagId;
      // 複合標籤處理：檢查法典標籤是否包含原本的獨立標籤，或者是完全相等
      const isTextMatch = searchTag.includes(t.text) || t.text.includes(searchTag);
      return (isIdMatch || isTextMatch) && t.netIncome !== undefined;
    });

    // 總裁指示：如果連淨利紀錄都遺失，代表資料完整性有問題
    if (relatedTags.length === 0) {
      console.warn(
        `[GameLogic Warning] 玩家 ${player.name} 被定罪標籤 [${tagText}] (ID: ${tagId})，找不到帶有計費依據 (netIncome) 的紀錄。將以 0 元基數計算。`
      );
      // 改為平滑回退，不再拋出致命錯誤導致遊戲中斷
      return calculateConvictionPenalty(player, 0, currentTurn);
    }

    // 取出最新的那筆關聯收益作為罰金基數
    const lastTag = relatedTags[relatedTags.length - 1];
    let netIncome = lastTag.netIncome!;

    // 專案客製化需求：E卡相關的直接起訴案件，罰金不看原始不法所得，改為強制抓取玩家當前可用資金(不含信託)的 20%
    if (lastTag.lawCaseIds && lastTag.lawCaseIds.some((id) => id.startsWith('E-'))) {
      netIncome = Math.floor((player.g || 0) * 0.2);
    }

    // 判定是否為開局既有前科 (Turn 0)
    const isPreexisting = lastTag.turn === 0;

    // 直接將取出的淨利傳給 MechanicsEngine 進行專業裁罰運算
    return calculateConvictionPenalty(
      player,
      netIncome,
      currentTurn,
      isPreexisting,
      isAppeal,
      personality
    );
  }

  /**
   * 玩家自述答辯：判定玩家是否能在法庭上說服法官全身而退
   */
  static calculateDefenseResult(
    mode: JudgeMode,
    player: Player,
    lawCase: LawCase,
    text: string,
    spectatorInfluence: number = 0,
    optionIndex?: 'J' | 'K' | 'L' | string
  ): { isSuccess: boolean; rate: number; isRelief?: boolean } {
    // 1. 基礎勝算檢核
    if (typeof lawCase.survival_rate !== 'number') {
      throwDataDefinitionError(
        'CourtEngine.calculateDefenseResult',
        `法條 ${lawCase.id} 缺少基礎勝率 (survival_rate) 設定，審判程序中止。`
      );
    }

    // 2. 初始化最終勝率
    let finalSurvivalRate = lawCase.survival_rate + spectatorInfluence;

    // 3. 根據模式進行不同的辯護計算邏輯
    if (mode === 'ai') {
      // [AI 模式]：由 AI 動態生成 JKL 選項標籤，勝率加成由 optionIndex 決定
    }

    // 4. [統一加成邏輯]：依據選擇的選項索引 (J/K/L) 固定加成
    if (optionIndex === 'K') {
      finalSurvivalRate += 0.05; // K 選項 +5%
    } else if (optionIndex === 'L') {
      finalSurvivalRate += 0.1; // L 選項 +10%
    }
    // J 選項維持 0% 加成，不另行計算

    // 5. 律師天賦發動：王牌律師 LV1 提供額外 +30% 勝率加成
    finalSurvivalRate += getLawyerDefenseBonus(player);

    // 5. 限制勝率範圍並執行隨機判定
    finalSurvivalRate = Math.max(0, Math.min(1.0, finalSurvivalRate));
    const isSuccess = Math.random() < finalSurvivalRate;

    return { isSuccess, rate: finalSurvivalRate };
  }

  /**
   * 王牌律師 LV3 天賦發動：支付天價資源強制撤案（花錢消災）
   */
  static applyWithdrawCase(
    player: Player,
    lawCaseTag: string | string[],
    lawCaseTagId: number
  ): { success: boolean; updates: Partial<Player> } {
    const tagText = Array.isArray(lawCaseTag) ? lawCaseTag.join('/') : lawCaseTag;
    // 從 RoleEngine 調用動態撤案成本計算 (依據玩家總資產比率)
    const cost = getWithdrawCaseCost(player);
    // 確認手邊可動用資金與人脈是否充足
    if (player.g < cost.g || player.ip < cost.ip) {
      return { success: false, updates: {} }; // 資源不足導致撤案失敗
    }
    return {
      success: true,
      // 給出更新物件 (Updates Object)，準備覆寫進入 State
      updates: {
        g: Math.max(0, player.g - cost.g), // 扣除所需費用
        ip: Math.max(0, player.ip - cost.ip), // 扣除人脈點數
        // 將身上對應該標籤的所有黑材料銷毀
        blackMaterialSources: removeBlackMaterialsByTag(player, tagText, lawCaseTagId),
        // 將引發訴訟的問題標籤轉為 Resolved 歷史狀態
        tags: player.tags.map((t) => (t.id === lawCaseTagId ? { ...t, isResolved: true } : t)),
      },
    };
  }

  /**
   * 申請非常上訴：以總資金 20% 為代價，強制爭取重審機會（每人每場遊戲限用一次）
   */
  static applyExtraAppeal(player: Player): { success: boolean; updates: Partial<Player> } {
    // 每位玩家整場只能動用一次終審救濟特權
    if (player.hasUsedExtraAppeal) return { success: false, updates: {} };
    return {
      success: true,
      updates: {
        // 大幅沒收兩成資金作為訴訟重新發動代價
        g: Math.max(0, player.g - Math.ceil(player.g * 0.2)),
        hasUsedExtraAppeal: true, // 特權廢除標記(防止使用第二次)
      },
    };
  }

  /**
   * 結算答辯結果，並推進法庭畫面到下一個階段（例如法官準備宣判）
   */
  static determineDefenseOutcome(
    player: Player,
    trial: TrialState,
    optionIdx: number,
    text: string,
    judgeMode: JudgeMode,
    currentTurn: number
  ): Partial<TrialState> {
    // 1. 映射選項索引到 JKL 加成標記
    // 0 -> J (+0%), 1 -> K (+5%), 2 -> L (+10%)
    const optionMap: Record<number, string> = { 0: 'J', 1: 'K', 2: 'L' };
    const optionLabel = optionMap[optionIdx] || 'J';

    // 2. [旁觀者干預系統整合]：計算場上所有干預行為對機率產生的總影響
    const spectatorInfluence = calculateSpectatorInfluence(trial.interventions);

    // 3. 結算防禦結果 (傳入模式與選項索引)
    const res = this.calculateDefenseResult(
      judgeMode,
      player,
      trial.lawCase,
      text,
      spectatorInfluence,
      optionLabel
    );
    // 根據勝敗來決定是否計算判決罰鍰數字 (傳入當前標籤 ID 進行精準資產對接)
    const punishment = res.isSuccess
      ? undefined
      : this.calculatePenalty(
          player,
          trial.lawCase.tag, // 此處傳入原始型別，由 calculatePenalty 內部處理 format
          currentTurn,
          trial.lawCaseTagId,
          trial.isAppeal || false,
          trial.judgePersonality
        );

    // 如果玩家敗訴但有律師LV3，引導流程進入 stage 5 給予花錢撤告機會
    if (!res.isSuccess && (player.roles?.lawyer || 0) >= 3) {
      return {
        isDefenseSuccess: false,
        finalSurvivalRate: res.rate, // 保存發生當時的機率留抵紀錄
        defenseText: text,
        punishment,
        punishmentDetail: (punishment as any)?.detail,
        stage: 5, // 推進至「王牌律師撤告確認程序」
      };
    }

    // 若非律師豁免對象，或判定成功，則調用審判文書產生器
    const judge = this.generateJudgment(
      judgeMode,
      trial.judgePersonality || 'traditionalist',
      trial,
      player,
      res.isSuccess
    );

    // 回傳預備更新到 gameStore 的新結構，並推進到 stage 6 宣告最後決判動畫
    return {
      isDefenseSuccess: res.isSuccess,
      finalSurvivalRate: res.rate,
      defenseText: text,
      chosenDefenseLabel: trial.chosenDefenseLabel,
      punishment,
      punishmentDetail: (punishment as any)?.detail,
      judgment: judge.judgment,
      userPrompt: judge.userPrompt,
      stage: 6,
    };
  }

  /**
   * 回合結束時的隨機臨檢：看看場上是否有人的黑材料滿到被檢調單位直接帶走
   */
  static checkAndTriggerIndictment(players: Player[], turn: number): string | null {
    const activePlayers = players.filter((p) => !p.isBankrupt);
    if (activePlayers.length === 0) return null;

    let maxChance = -1;
    let targetPlayer: Player | null = null;

    // 掃描出起訴機率最高的首席嫌疑犯
    for (const player of activePlayers) {
      const chance = getIndictmentChance(player, turn);
      // 必須機率大於 0 才算活靶
      if (chance > maxChance && chance > 0) {
        maxChance = chance;
        targetPlayer = player;
      }
    }

    // 沒人有被抓的機率，安全下莊
    if (!targetPlayer || maxChance <= 0) return null;

    // 全局唯一的判定骰子，只為頭號疑犯轉動
    const roll = Math.random() * 100;
    if (roll < maxChance) {
      // 命中最高嫌疑犯的起訴機率後，發動俄羅斯大輪盤，選出一名替死鬼送上法庭
      return this.spinRussianRoulette(players)?.id || null;
    }

    return null; // 本回合無事發生
  }

  /**
   * 佈置法庭場景：準備好嫌疑犯、旁聽群眾、罪名與法官，並回傳給介面顯示
   */
  static prepareTrial(
    players: Player[],
    defendantId: string,
    judgeMode: JudgeMode,
    personality: JudgePersonality,
    forcedTagId?: number,
    isInevitable = false,
    reason = ''
  ): Partial<TrialState> | null {
    // 根據鎖定之被告 ID 提取玩家參考物件
    const defendant = players.find((p) => p.id === defendantId);
    if (!defendant) {
      throwTrialInitializationError('法庭初始化', `找不到指定被告 ID: ${defendantId}`);
    }

    // 將場上其餘並未破產存活者作為「陪審員/旁觀者」納入陣列清單
    const bystanderIds = players
      .filter((p) => !p.isBankrupt && p.id !== defendantId)
      .map((p) => p.id);

    // 檢查「全場黑料均為零則撤告」的絕對豁免機制
    // 若黑材料為 0，直接阻斷不觸發提告
    const totalGlobalBM = players.reduce((acc, p) => acc + getTotalBlackMaterials(p), 0);
    if (totalGlobalBM === 0) {
      // [修正] 如果是強制性起訴，黑材料卻是 0，這代表資料存檔或引擎狀態損壞
      if (isInevitable || forcedTagId) {
        throwTrialInitializationError('法庭初始化', `強制性起訴程序發動，但全場黑材料總量為 0！`);
      }
      return null; // 常規隨機案件允許可因無事證而撤告
    }

    let lawCase: LawCase | null = null;
    let tagId: number = 0;

    // (Debug 手動逼供)：如果強制夾帶了 TagId 做為罪名強索，立刻覆寫查詢結果
    if (forcedTagId) {
      const target = defendant.tags.find((t) => t.id === forcedTagId);
      if (target) {
        // [修正] 優先從標籤關聯的 lawCaseIds 中尋找 ID 進行檢索，並強制檢查資料完整性
        const lawCaseId = target.lawCaseIds?.find((id) => !!LAW_CASES_DB[id]);
        if (!lawCaseId) {
          throwTrialInitializationError(
            '法庭初始化',
            `強制起訴標籤 [${target.text}] (ID: ${forcedTagId}) 缺少有效的法條關聯 (lawCaseIds)！`
          );
        }
        lawCase = LAW_CASES_DB[lawCaseId];
        tagId = target.id;
      }
    }

    // 常規狀態：進入法律搜尋程序鎖定具體罪嫌
    if (!lawCase) {
      const res = this.pickLawCase(defendant);
      if (!res) {
        // 如果進得來這裡代表俄羅斯輪盤判定這名玩家身上有黑材料 (totalBM > 0)
        // 但 pickLawCase 卻遍尋不著尚未結案的違規標籤，這是嚴重的邏輯斷層或發牌 BUG
        throwTrialInitializationError(
          '法庭初始化',
          `玩家 ${defendant.name} 被起訴，但搜不到任何有效且未結案的犯罪標籤 (Tag)！可能原因：ActionEngine 產生了無標籤的黑材料(BM)。`
        );
      }
      lawCase = res.lawCase;
      tagId = res.tagId;
    }

    // 將該次罪嫌行動發生當下所儲存的術語跟意圖同步回拷到審理案件上，確保對白貼齊案情
    const tag = defendant.tags.find((t) => t.id === tagId);
    if (tag) {
      lawCase = {
        ...lawCase,
      };
    }

    // 宣告開庭，產生起訴與質詢初始文字
    const narrative = this.generateTrialNarrative(judgeMode, personality, lawCase);

    // 退還一份完美充填好設定的初審物件狀態給 UI 模組承接
    return {
      defendantId,
      lawCase,
      lawCaseTagId: tagId,
      stage: 1, // 控制法庭畫面處於最開頭敘事介紹階段
      bystanderIds,
      actingBystanderIndex: 0,
      interventions: [], // 存放陪審團對話的陣列
      bets: [], // 存放押注結果的陣列
      question: narrative.question,
      narrative: narrative.narrative,
      isReady: true,
      timer: 30,
      isInevitable, // 定義該次審判是否為不可免疫的絕對制裁
      forcedReason: reason,
      judgePersonality: personality,
      generatedOptions: undefined, // AI 動態生成的動態選項文案
    };
  }

  /**
   * 推進法庭流程：如果場上沒有其他玩家可以旁聽，系統會自動快轉跳過群眾押注環節
   */
  static determineNextTrialStage(
    trial: TrialState,
    targetStage: TrialStage | number
  ): Partial<TrialState> {
    const s = targetStage as TrialStage;
    // 如果場上並沒有陪審群眾（玩家數太少或破產），可以直接閃避押注流程
    const skipBystanders = trial.bystanderIds.length === 0;
    const isBystanderStage = s === 2 || s === 3;
    // 對應階段若巧遇沒陪伴者，直接把流程推進至第 4 階段（法官正面質詢被告）
    const resolvedStage = skipBystanders && isBystanderStage ? 4 : s;

    return {
      stage: resolvedStage,
      // 若正好轉換到陪伴參與環節，預備開始遞迴讓每個人表態；否則保持鎖定
      actingBystanderIndex:
        resolvedStage === 2 || resolvedStage === 3 ? 0 : trial.actingBystanderIndex,
      // 自動標記這些特定環節已經蓄勢待發開啟互動權限
      isReady: resolvedStage === 2 || resolvedStage === 3,
      timer: 0, // 切換場景時重設沙漏倒數計數器
    };
  }

  /**
   * 最後審判執行：將勝訴的清白或敗訴的罰款真正寫入玩家的帳戶中
   */
  static applyTrialResolution(
    player: Player,
    isSuccess: boolean,
    lawCaseTag: string | string[],
    lawCaseTagId: number,
    personality?: JudgePersonality,
    currentTurn: number = 999,
    isAppeal: boolean = false
  ): Partial<Player> {
    const updates: Partial<Player> = { ...player };
    const tagText = Array.isArray(lawCaseTag) ? lawCaseTag.join('/') : lawCaseTag;
    // 勝訴情況：洗清嫌疑，還予公道
    if (isSuccess) {
      // 消除相關黑材料
      updates.blackMaterialSources = removeBlackMaterialsByTag(player, tagText, lawCaseTagId);
      // 標籤結清邏輯：一案一清，更新狀態為 isResolved: true (避免一罪二罰)
      updates.tags = player.tags.map((t) => {
        if (t.id === lawCaseTagId) {
          return { ...t, isResolved: true };
        }
        return t;
      });
    } else {
      // 敗訴情況：嚴厲制裁 (附上回合數支援開局新手保護期判定，並鎖定標籤 ID)
      const penalty = this.calculatePenalty(
        player,
        lawCaseTag,
        currentTurn,
        lawCaseTagId,
        isAppeal,
        personality
      );
      // 添上一筆打死不認的敗訴歷史傷疤以利後續懲罰連坐
      updates.totalTrials = (player.totalTrials || 0) + 1;
      // 資金沒收保底不小於 0 即可
      updates.g = Math.max(0, player.g - penalty.fine);

      // [名聲結算優化]：根據計算出的 penalty.rpLoss 進行扣除（已包含公關折扣）
      updates.rp = Math.max(0, (updates.rp || player.rp) - penalty.rpLoss);

      // 紀錄玩家被罰款的金額
      updates.totalFinesPaid = (player.totalFinesPaid || 0) + penalty.fine;

      // 一案一清，將黑材料移除，標籤狀態更新
      updates.blackMaterialSources = removeBlackMaterialsByTag(player, tagText, lawCaseTagId);
      updates.tags = player.tags.map((t) =>
        t.id === lawCaseTagId ? { ...t, isResolved: true } : t
      );
    }

    // 結案後清除已使用的賄賂物
    updates.bribeItem = undefined;

    return updates; // 回傳給 store，透過 Zustand 改寫核心狀態
  }

  /**
   * 結算法庭賭局對所有旁觀者的獎懲
   */
  static settleTrialBets(players: Player[], trial: TrialState, actualResult: boolean): Player[] {
    return players.map((p) => {
      // 被告本人不參與自己案子的賭局 (已單獨結算資產變動)
      if (p.id === trial.defendantId) return p;

      const playerBet = trial.bets.find((b) => b.playerId === p.id);
      // 若該名旁觀者未進行任何下注，則略過處理
      if (!playerBet || playerBet.choice === 'none') return p;

      // 調用 MechanicsEngine 獲取基礎獲利與懲罰值
      const betRes = settleBet(p, playerBet.choice, actualResult);

      // 取得基礎名聲變動
      let rpChange = betRes.rpGain;
      // 若名聲變動為負，調用公關天賦折抵邏輯
      if (rpChange < 0) {
        rpChange = applyPRDiscount(p, rpChange);
      }

      // 將盈虧映射至新玩家物件並回傳
      return {
        ...p,
        g: Math.max(0, p.g + betRes.gGain),
        ip: Math.max(0, p.ip + betRes.ipGain),
        rp: Math.max(0, Math.min(100, p.rp + rpChange)),
      };
    });
  }
}
