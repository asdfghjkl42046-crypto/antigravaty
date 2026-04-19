/**
 * 遊戲結局結算
 * 負責判斷玩家是成功還是失敗，並根據過去的紀錄給予評價。
 */

import type { Player, VictoryRoute, EndingResult, Tag, GamePhase } from '../types/game';

// 定義被封裝後的遊戲階段狀態解析介面
export interface GameStatusResolution {
  isGameOver: boolean;
  phase: GamePhase;
  endingResult: EndingResult | null;
  updatedPlayer?: Player;
}

// ============================================================
// 結局文本定義 (文案權威源)
// ============================================================
export const ENDING_CONFIGS: Record<string, { title: string; description: string }> = {
  saint: {
    title: '聖皇',
    description: '您的企業已超越了凡俗的法律，在商業戰中成為了誠信與財富的化身。',
  },
  saintFake: {
    title: '聖皇(偽)',
    description: '您表面上名譽極高且財富驚人，但背後累積的暗盤交易讓這份皇冠沾滿了灰塵。',
  },
  tycoon: {
    title: '企業巨頭',
    description: '您建立了一個無可撼動的商業帝國，雖然名聲並非完美，但力量足以支配整個市場。',
  },
  dragonhead: {
    title: '優良龍頭企業',
    description: '您成功地在利潤與社會責任之間取得了平衡，是業界公認的典範。',
  },
  arrested: {
    title: '身敗名裂',
    description: '您的企業名聲已徹底臭名昭著，判定信用破產，您被強制退出商業舞台。',
  },
  bankrupt: {
    title: '經濟破產',
    description: '企業資金鏈完全斷裂，積欠龐大債務，您只能黯然宣告破產，退下商業舞台。',
  },
  limit: {
    title: '創業夢夢碎',
    description: '在漫長的 50 回合後，您仍未能建立起卓越的成就，創業之路就此止步。',
  },
};

// ============================================================
// 結局判定門檻定義 (全域統一管理點)
// ============================================================
export const BANKRUPTCY_LIMITS = {
  RP_MIN: 20, // 名聲低於此數值則崩盤 (RP < 20)
  CASH_MIN: 0, // 資金與信託均歸零則破產
};

// 破產判定（遊戲失敗條件）

/**
 * 檢查有沒有倒閉
 * 如果名聲太慘，或是沒信託基金下錢歸零了，公司就直接收掉。
 */
export function checkBankruptcy(player: Player): boolean {
  // 名聲低於死線為絕對死線 (社會性死亡)，不可逆
  if (player.rp < BANKRUPTCY_LIMITS.RP_MIN) return true;

  // 若無海外信託且手邊無任何現金流 (資金斷裂)，宣告經濟破產
  if (
    player.g <= BANKRUPTCY_LIMITS.CASH_MIN &&
    (player.trustFund || 0) <= BANKRUPTCY_LIMITS.CASH_MIN
  ) {
    return true;
  }
  return false;
}

// 勝利條件

/**
 * 檢查是否達成獲勝結局
 */
export function checkVictory(
  player: Player,
  currentTurn: number = 0,
  saintBonusActive: boolean = false
): VictoryRoute {
  if (currentTurn < 10) return null;
  const totalAssets = player.g + (player.trustFund || 0);

  // 1. 最高難度「聖皇」
  if (totalAssets >= 2200 && player.rp > 95 && saintBonusActive) {
    return 'saint';
  }
  // 2. 「企業巨頭」：只要不低於破產死線即可達成
  if (totalAssets >= 2500 && player.rp >= BANKRUPTCY_LIMITS.RP_MIN) {
    return 'tycoon';
  }
  // 3. 「優良龍頭企業」
  if (totalAssets >= 2200 && player.rp > 50) {
    return 'dragonhead';
  }

  return null;
}

/**
 * 給予玩家稱號評價
 * 根據你最常犯的罪名，給一個專屬的稱號（比如：稅務達人、技術駭客）。
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
  if (tagCounts['洗錢防制法'] > 3) evaluations.push('洗錢大亨');
  if (tagCounts['妨害電腦使用罪'] > 3) evaluations.push('技術駭客');
  if (tagCounts['個人資料保護法'] > 5) evaluations.push('情報販子');
  if (tagCounts['背信罪'] > 5) evaluations.push('背信狂人');
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
 * 遊戲最後的大結算
 * 看看你最後是光榮退休成為聖皇，還是淪落到身敗名裂。
 */
export function calculateEnding(player: Player, turn: number): EndingResult {
  const { g, rp, tags, totalFinesPaid, trustFund } = player;
  const totalAssets = g + (trustFund || 0);

  // 取最後 5 個回合做聖人(Saint)追溯期驗證，五回合內不可有犯罪事實
  const lookbackWindow = 5;
  const last5NoCrime = !player.tags.some((t) => t.isCrime && t.turn > turn - lookbackWindow);

  // 1. 驗證聖皇結局 (最難達成的境界)
  if (totalAssets >= 2200 && rp > 95 && last5NoCrime) {
    // 若最終違法選項選擇少於等於 5，才是真正的聖皇；否則降級為聖皇(偽)
    const totalCrimes = tags.filter((t) => t.isCrime).length;
    const isTrueSaint = totalCrimes <= 5;
    const config = isTrueSaint ? ENDING_CONFIGS['saint'] : ENDING_CONFIGS['saintFake'];

    return {
      playerId: player.id,
      type: 'saint',
      title: config.title,
      evaluation: generateEvaluation(tags),
      description: config.description,
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 2. 驗證企業巨頭結局 (黑心財閥的寫照)
  if (totalAssets >= 2500 && rp >= 20) {
    const config = ENDING_CONFIGS['tycoon'];
    return {
      playerId: player.id,
      type: 'tycoon',
      title: config.title,
      evaluation: generateEvaluation(tags),
      description: config.description,
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 3. 驗證優良龍頭結局 (標準通關)
  if (totalAssets >= 2200 && rp > 50) {
    const config = ENDING_CONFIGS['dragonhead'];
    return {
      playerId: player.id,
      type: 'dragonhead',
      title: config.title,
      evaluation: generateEvaluation(tags),
      description: config.description,
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 4. 若結算當下名聲歸底，宣告因社會性死亡而被逮捕清算結局
  if (rp < 20) {
    const config = ENDING_CONFIGS['arrested'];
    return {
      playerId: player.id,
      type: 'arrested',
      title: config.title,
      evaluation: generateEvaluation(tags),
      description: config.description,
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 5. 資金清空，無力回天破產結局
  if (g <= 0 && (trustFund || 0) <= 0) {
    const config = ENDING_CONFIGS['bankrupt'];
    return {
      playerId: player.id,
      type: 'bankrupt',
      title: config.title,
      evaluation: generateEvaluation(tags),
      description: config.description,
      stats: { totalProfit: totalAssets, totalFines: totalFinesPaid, finalRp: rp },
    };
  }

  // 6. 打完 50 場卻任何高低優劣標線都沒摸到的平庸者下場
  const config = ENDING_CONFIGS['limit'];
  return {
    playerId: player.id,
    type: 'limit',
    title: config.title,
    evaluation: generateEvaluation(tags),
    description: config.description,
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
  // 當目前的「已嘗試切換後的回合」大於 50，代表第 50 輪已正式結束
  if (currentTurn > 50) {
    const ending = calculateEnding(player, 50);
    return { isGameOver: true, phase: 'gameover', endingResult: ending };
  }

  // 5. 若通過所有考驗，向狀態機回報繼續正常進行遊戲
  return { isGameOver: false, phase: 'play', endingResult: null };
}
