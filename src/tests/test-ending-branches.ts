import { checkVictory, generateEvaluation, resolveGameStatus } from '../engine/EndingEngine';
import type { Player } from '../types/game';

async function testEndingBranches() {
  console.log('🏆 [分支覆蓋] EndingEngine 結局與評價專項測試');

  // 初始化測試對象
  const dummyPlayer: Player = {
    id: 'p1',
    name: '玩家1',
    g: 0,
    rp: 0,
    ip: 0,
    ap: 5,
    tags: [],
    blackMaterialSources: [],
    trustFund: 0,
    isBankrupt: false,
    consecutiveCleanTurns: 0,
    totalTrials: 0,
    totalFinesPaid: 0,
    skipNextCard: false,
    genesisHash: '',
    lastHash: '',
    totalIncome: 0,
    hasUsedExtraAppeal: false,
    totalTagsCount: 0,
  };

  // --- 1. 勝利條件判定 (checkVictory) ---
  console.log('\n[1] 勝利條件分支 (測試 20 回合):');

  // 分支 1: 聖皇 (G >= 2200, RP > 95, 且有 bonus)
  dummyPlayer.g = 2200;
  dummyPlayer.rp = 96;
  let ending = checkVictory(dummyPlayer, 20, true);
  console.log(
    `  聖皇達標 (G=2200, RP=96, Turn=20, SaintBonus=true) -> 結局: ${ending} (預期: saint) => ${ending === 'saint' ? '✅' : '❌'}`
  );

  // 分支 2: 錯失聖皇 (Bonus=false) -> 降級為企業巨頭或優良龍頭
  ending = checkVictory(dummyPlayer, 20, false);
  console.log(
    `  錯失聖皇 (SaintBonus=false) -> 結局: ${ending} (預期: tycoon) => ${ending === 'tycoon' ? '✅' : '❌'}`
  );

  // 分支 3: 企業巨頭 (G >= 2500, RP > 20)
  dummyPlayer.g = 2500;
  dummyPlayer.rp = 21;
  ending = checkVictory(dummyPlayer, 20, false);
  console.log(
    `  企業巨頭達標 (G=2500, RP=21) -> 結局: ${ending} (預期: tycoon) => ${ending === 'tycoon' ? '✅' : '❌'}`
  );

  // 分支 4: 優良龍頭企業 (G >= 2200, RP > 50)
  dummyPlayer.g = 2200;
  dummyPlayer.rp = 51;
  ending = checkVictory(dummyPlayer, 20, false);
  console.log(
    `  優良龍頭達標 (G=2200, RP=51) -> 結局: ${ending} (預期: dragonhead) => ${ending === 'dragonhead' ? '✅' : '❌'}`
  );

  // 分支 5: 創業夢碎 (未達標)
  dummyPlayer.g = 2100;
  dummyPlayer.rp = 100;
  ending = checkVictory(dummyPlayer, 20, false);
  console.log(
    `  創業夢碎 (G=2100 未達標) -> 結局: ${ending} (預期: null) => ${ending === null ? '✅' : '❌'}`
  );

  // 分支 6: 遊戲未結束時不判定結局 (測試少於 15 回合)
  ending = checkVictory(dummyPlayer, 10, false);
  console.log(
    `  尚未結束 (Turn=10) -> 結局: ${ending} (預期: null) => ${ending === null ? '✅' : '❌'}`
  );

  // --- 2. 評價系統 (generateEvaluation) ---
  console.log('\n[2] 多重評價稱號分支:');
  // 洗錢(M-01/M-02), 駭客([B-06]或包含資訊/電腦/個資), 逃稅(T-01/包含稅), 法外狂徒(其他), 誠信楷模

  // 分支 1: 誠信楷模
  dummyPlayer.tags = [];
  let evalTitle = generateEvaluation(dummyPlayer.tags);
  console.log(
    `  無標籤 -> 評價: ${evalTitle} (預期包含: 誠信楷模) => ${evalTitle.includes('誠信楷模') ? '✅' : '❌'}`
  );

  // 分支 2: 洗錢大亨 + 逃稅達人
  dummyPlayer.tags = [
    {
      id: 1,
      turn: 1,
      text: '洗錢防制法',
      netIncome: 0,
      hash: '',
      isResolved: false,
      timestamp: '',
      isCrime: true,
    },
    {
      id: 2,
      turn: 1,
      text: '稅捐稽徵法',
      netIncome: 0,
      hash: '',
      isResolved: false,
      timestamp: '',
      isCrime: true,
    },
  ];
  evalTitle = generateEvaluation(dummyPlayer.tags);
  console.log(
    `  洗錢+逃稅標籤 -> 評價: ${evalTitle} (預期: 洗錢大亨 / 逃稅達人) => ${evalTitle.includes('洗錢大亨') && evalTitle.includes('逃稅達人') ? '✅' : '❌'}`
  );

  // 分支 3: 技術駭客/情報販子 + 法外狂徒
  dummyPlayer.tags = [
    {
      id: 3,
      turn: 1,
      text: '妨害電腦使用罪',
      netIncome: 0,
      hash: '',
      isResolved: false,
      timestamp: '',
      isCrime: true,
    },
    {
      id: 4,
      turn: 1,
      text: '其他罪名',
      netIncome: 0,
      hash: '',
      isResolved: false,
      timestamp: '',
      isCrime: true,
    },
  ];
  evalTitle = generateEvaluation(dummyPlayer.tags);
  console.log(
    `  駭客+其他標籤 -> 評價: ${evalTitle} (預期: 技術駭客 / 法外狂徒) => ${evalTitle.includes('技術駭客') && evalTitle.includes('法外狂徒') ? '✅' : '❌'}`
  );

  // --- 3. 狀態分流系統 (resolveGameStatus) ---
  console.log('\n[3] 遊戲狀態分流 (resolveGameStatus) 測試:');

  // 情境 1: 提早聖皇達成 (滿足 5 回合清白)
  dummyPlayer.g = 2200;
  dummyPlayer.rp = 100;
  dummyPlayer.tags = []; // 歷史總犯罪 = 0，絕對是 True Saint
  let status = resolveGameStatus(dummyPlayer, 20);
  console.log(
    `  提早聖皇達成 (Turn 20, Tags=0) -> 狀態: ${status.phase}, 標題: ${status.endingResult?.title} => ${status.phase === 'victory' && status.endingResult?.title === '聖皇' ? '✅' : '❌'}`
  );

  // 情境 2: 聖皇(偽) 分支判定
  dummyPlayer.tags = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: i + 100,
      turn: 1,
      text: '輕微違規',
      netIncome: 0,
      hash: '',
      isCrime: true,
    })) as any; // 超過 5 個犯罪
  status = resolveGameStatus(dummyPlayer, 20);
  console.log(
    `  提早聖皇(偽)達成 (Turn 20, Tags=6) -> 標題: ${status.endingResult?.title} => ${status.endingResult?.title === '聖皇(偽)' ? '✅' : '❌'}`
  );

  // 情境 3: 企業巨頭提早達成
  dummyPlayer.g = 3000;
  dummyPlayer.rp = 30; // 即使有犯罪也沒關係
  status = resolveGameStatus(dummyPlayer, 20);
  console.log(
    `  提早巨頭達成 (Turn 20) -> 狀態: ${status.phase}, 結局: ${status.endingResult?.type} => ${status.phase === 'victory' && status.endingResult?.type === 'tycoon' ? '✅' : '❌'}`
  );

  console.log('\n✅ EndingEngine 結局與評價分支覆蓋測試完成。');
}

testEndingBranches().catch(console.error);
