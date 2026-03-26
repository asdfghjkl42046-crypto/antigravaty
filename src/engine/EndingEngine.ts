/**
 * 遊戲結局總結算
 * 負責判定玩家是破產跑路、還是功成名就，並根據歷史犯罪幫玩家打分數與發放稱號。
 */

import type { Player, VictoryRoute, EndingResult, Tag, GamePhase } from '../types/game';

// 定義回傳被封裝後的遊戲階段狀態解析介面
export interface GameStatusResolution {
  isGameOver: boolean;
  phase: GamePhase;
  endingResult: EndingResult | null;
  updatedPlayer?: Player;
}

// ============================================================
// §1-8 破產判定 (遊戲失敗條件)
// ============================================================

/**
 * 破產與社死判定
 * 如果公司戶頭沒錢了(沒有信託帳戶)，或是名聲掉到 20 以下(社會性死亡)，遊戲強制結束。
 */
export function checkBankruptcy(player: Player): boolean {
  // 名聲低於 20 為絕對死線 (社會性死亡，強制被體制踢出)，不可逆
  if (player.rp <= 20) return true;
  // 若無海外信託且手邊無任何現金流 (資金斷裂)，宣告經濟破產
  if (player.g <= 0 && player.trustFund <= 0) return true;
  return false;
}

// ============================================================
// §2 勝利條件 (遊戲達標條件)
// ============================================================

/**
 * 檢查是否達成最高成就結局
 * 以及只有在苦撐到第 50 回合結束時才會進行的最終結局
 */
export function checkVictory(
  player: Player,
  currentTurn: number = 0,
  saintBonusActive: boolean = false // 是否達成完美守法條件的條件
): VictoryRoute {
  // 只要玩家資本提早達標，隨時宣告企業稱霸！
  // 但為了避免利用初始資金機制立刻破關，防呆限制：至少要熬過前期 15 回合的洗禮。
  if (currentTurn < 15) return null;
  const totalAssets = player.g + player.trustFund;

  // 1. 最高難度「聖皇」：需要 2200 萬且名聲極高 (95+)，外加從未犯罪的條件
  if (totalAssets >= 2200 && player.rp > 95 && saintBonusActive) {
    return 'saint';
  }
  // 2. 「企業巨頭」：名聲不重要(只要不破產 20+即可)，但吸金量要極度龐大
  if (totalAssets >= 2500 && player.rp > 20) {
    return 'tycoon';
  }
  // 3. 「優良龍頭企業」：一般好結局的保底，名聲需高於 50 且有一定資本
  if (totalAssets >= 2200 && player.rp > 50) {
    return 'dragonhead';
  }

  // 均未達標 (平庸結局)
  return null;
}

/**
 * 給予玩家歷史犯罪評價
 * 系統會翻開你過去所有的前科紀錄，根據你最常犯的罪，給你一個專屬的地下稱號（例如：洗錢大亨）
 */
export function generateEvaluation(tags: Tag[]): string {
  // 過濾出所有具備 'isCrime' 設定的污點紀錄
  const criminalTags = tags.filter((t) => t.isCrime);
  // 若玩家終其一生都保持乾淨，賞賜誠信楷模稱號
  if (criminalTags.length === 0) return '誠信楷模';

  const tagCounts: Record<string, number> = {};
  // 盤點各類犯罪發生的具體次數頻率
  criminalTags.forEach((t) => {
    tagCounts[t.text] = (tagCounts[t.text] || 0) + 1;
  });

  const evaluations: string[] = [];

  // 定義罪行閾值與對應的地下稱號
  if (tagCounts['洗錢防制法'] > 3 || tagCounts['洗錢防制法異常金流'] > 3)
    evaluations.push('洗錢大亨');
  if (tagCounts['妨害電腦使用罪'] > 3) evaluations.push('技術駭客');
  if (tagCounts['個資法'] > 5) evaluations.push('情報販子');
  if (tagCounts['商業背信'] > 5) evaluations.push('背信狂人');
  if (tagCounts['稅捐稽徵法'] > 3 || tagCounts['商業會計法'] > 3) evaluations.push('逃稅達人');
  if (tagCounts['偽造文書'] > 5) evaluations.push('文書大師');

  // 若沒命中特定的專精稱號，根據犯罪總數給予預設通稱
  if (evaluations.length === 0) {
    // 總裁指示：對於只有輕微沾到泥巴（犯規次數 < 5），不能隨便打成法外狂徒，要給予獨特稱號
    return criminalTags.length < 5 ? '出淤泥而不染' : '法外狂徒';
  }

  // 將複合的犯罪屬性串接在一起 (如：洗錢大亨 / 情報販子)
  return evaluations.join(' / ');
}

/**
 * 結算最終結局與頒發成就
 * 遊戲最後的里程碑，決定你是成為商業聖皇，還是淪為階下囚。
 */
export function calculateEnding(player: Player, turn: number): EndingResult {
  const { g, rp, tags, totalFinesPaid, trustFund } = player;
  const totalAssets = g + (trustFund || 0);

  // 取最後 5 個回合做聖人(Saint)追溯期驗證，五回合內不可有犯罪事實
  const lookbackWindow = 5;
  const last5NoCrime = !player.tags.some((t) => t.isCrime && t.turn > turn - lookbackWindow);

  // 驗證聖皇結局 (最難達成的境界)
  if (totalAssets >= 2200 && rp > 95 && last5NoCrime) {
    // 若最終違法選項選擇少於等於 5，才是真正的聖皇；否則降級為聖皇(偽)
    const totalCrimes = tags.filter((t) => t.isCrime).length;
    const isTrueSaint = totalCrimes <= 5;

    return {
      playerId: player.id,
      type: 'saint',
      title: isTrueSaint ? '聖皇' : '聖皇(偽)',
      evaluation: generateEvaluation(tags), // 動態塞入玩家專屬前科稱號
      description: isTrueSaint
        ? '您的企業已超越了凡俗的法律，在商業戰中成為了誠信與財富的化身。'
        : '您表面上名譽極高且財富驚人，但背後累積的暗盤交易讓這份皇冠沾滿了灰塵。',
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 驗證企業巨頭結局 (黑心財閥的寫照)
  if (totalAssets >= 2500 && rp > 20) {
    return {
      playerId: player.id,
      type: 'tycoon',
      title: '企業巨頭',
      evaluation: generateEvaluation(tags),
      description: '您建立了一個無可撼動的商業帝國，雖然名聲並非完美，但力量足以支配整個市場。',
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 驗證優良龍頭結局 (標準通關)
  if (totalAssets >= 2200 && rp > 50) {
    return {
      playerId: player.id,
      type: 'dragonhead',
      title: '優良龍頭企業',
      evaluation: generateEvaluation(tags),
      description: '您成功地在利潤與社會責任之間取得了平衡，是業界公認的典範。',
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 若結算當下名聲歸底，宣告因社會性死亡而被逮捕清算結局
  if (rp <= 20) {
    return {
      playerId: player.id,
      type: 'arrested',
      title: '身敗名裂',
      evaluation: generateEvaluation(tags),
      description: '您的企業名聲已徹底臭名昭著，判定信用破產，您被強制退出商業舞台。',
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 資金清空，無力回天破產結局
  if (g <= 0 && (trustFund || 0) <= 0) {
    return {
      playerId: player.id,
      type: 'bankrupt',
      title: '經濟破產',
      evaluation: generateEvaluation(tags),
      description: '企業資金鏈完全斷裂，積欠龐大債務，您只能黯然宣告破產，退下商業舞台。',
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 打完 50 場卻任何高低優劣標線都沒摸到的平庸者下場
  return {
    playerId: player.id,
    type: 'limit',
    title: '創業夢夢碎',
    evaluation: generateEvaluation(tags),
    description: '在漫長的 50 回合後，您仍未能建立起卓越的成就，創業之路就此止步。',
    stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
  };
}

/**
 * 遊戲階段檢查
 * 每次玩家行動完，系統都會呼叫這裡，檢查遊戲是不是該提早結束了（如突然破產）。
 */
export function resolveGameStatus(
  player: Player,
  turn: number,
  options?: { isManual?: boolean; forceTurn?: number }
): GameStatusResolution {
  const isManual = options?.isManual || false;
  const currentTurn = options?.forceTurn || turn;

  // 1. 特殊開發者作弊/強制收尾按鈕觸發
  if (isManual) {
    const ending = calculateEnding(player, currentTurn);
    return { isGameOver: true, phase: 'victory', endingResult: ending };
  }

  // 2. 常規檢查：只要撞到破產死線，馬上中斷並進入 gameover 結算
  if (checkBankruptcy(player)) {
    const ending = calculateEnding(player, currentTurn);
    // 強制為玩家掛上不可逆的破產印記
    const updatedPlayer = { ...player, isBankrupt: true };
    return { isGameOver: true, phase: 'gameover', endingResult: ending, updatedPlayer };
  }

  // 3. 勝利路徑達成判定 (提早通關)
  // 聖皇路徑需滿足「最後 5 回合無犯罪」之 Saint Bonus
  const lookbackWindow = 5;
  const isLast5TurnsClean = !player.tags.some(
    (t) => t.isCrime && t.turn > currentTurn - lookbackWindow
  );

  const victoryRoute = checkVictory(player, currentTurn, isLast5TurnsClean);
  if (victoryRoute) {
    // 只要達成任何一種勝利路線，即刻結算結局
    const ending = calculateEnding(player, currentTurn);
    // 確保同步玩家狀態
    const updatedPlayer = { ...player };
    return { isGameOver: true, phase: 'victory', endingResult: ending, updatedPlayer };
  }

  // 4. 回合上限保衛機制 (GEMINI.md §3-2: 遊戲只營運 50 回合)
  if (currentTurn > 50) {
    // 時間到，強制送去審判看成績
    const ending = calculateEnding(player, 50);
    return { isGameOver: true, phase: 'gameover', endingResult: ending };
  }

  // 5. 若通過所有考驗，向狀態機回報繼續正常進行遊戲
  return { isGameOver: false, phase: 'play', endingResult: null };
}
