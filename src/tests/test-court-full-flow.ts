import { CourtEngine } from '../engine/CourtEngine';
import { settleBet } from '../engine/MechanicsEngine';
import type { Player } from '../types/game';

async function testCourtFullFlow() {
  console.log('⚖️  [法庭全程序] 賄賂、過場與押注流程驗證');

  const dummyPlayer: Player = {
    id: 'p1',
    name: 'PC',
    g: 1000,
    rp: 50,
    ip: 200,
    ap: 5,
    tags: [
      {
        id: 99,
        turn: 1,
        text: '測試法案',
        netIncome: 200,
        hash: 'a',
        isResolved: false,
        timestamp: '',
        isCrime: true,
      },
    ],
    blackMaterialSources: [{ tag: '測試法案', count: 1, actionId: 99, turn: 1 }],
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
    roles: {},
  };

  // --- 1. 賄賂與法官個性契合度 (getBribeScore / CourtEngine.calculatePenalty) ---
  console.log('\n[1] 賄賂品與法官契合度減免:');

  // 法官：traditionalist (傳統派) -> antique: 5 -> 減免 20%
  dummyPlayer.bribeItem = 'antique';
  // 基礎罰金 = 200 * 3.0 = 600
  // antique 給 traditionalist 得分 5 => > 5 => fineMultiplier *= 0.8 => 600 * 0.8 = 480
  let res = CourtEngine.calculatePenalty(dummyPlayer, '測試法案');
  console.log(
    `  traditionalist + antique -> 罰金: ${res.fine} (預期: 480) => ${res.fine === 480 ? '✅' : '❌'}`
  );

  // 法官：algorithmic (演算法) -> antique: 1 -> 無減免 => 600
  res = CourtEngine.calculatePenalty(dummyPlayer, '測試法案');
  console.log(
    `  algorithmic + antique -> 罰金: ${res.fine} (預期: 600) => ${res.fine === 600 ? '✅' : '❌'}`
  );

  // 法官：elegant (優雅派) -> art: 5 -> 減免 20% => 480
  dummyPlayer.bribeItem = 'art';
  res = CourtEngine.calculatePenalty(dummyPlayer, '測試法案');
  console.log(
    `  elegant + art -> 罰金: ${res.fine} (預期: 480) => ${res.fine === 480 ? '✅' : '❌'}`
  );

  // --- 2. 押注收益與公關減免 (settleBet) ---
  console.log('\n[2] 階段 3 押注收益結算:');

  // 押注勝訴 -> 實際勝訴 -> IP +30
  let betRes = settleBet(dummyPlayer, 'win', true);
  console.log(
    `  押勝/實際勝 -> IP收益: ${betRes.ipGain} (預期: 30) => ${betRes.ipGain === 30 ? '✅' : '❌'}`
  );

  // 押注勝訴 -> 實際敗訴 -> RP -10
  betRes = settleBet(dummyPlayer, 'win', false);
  console.log(
    `  押勝/實際敗 -> RP收益: ${betRes.rpGain} (預期: -10) => ${betRes.rpGain === -10 ? '✅' : '❌'}`
  );

  // 裝備公關 LV3 免疫
  dummyPlayer.roles = { pr: 3 };
  betRes = settleBet(dummyPlayer, 'win', false);
  console.log(
    `  押勝/實際敗 (具備公關 LV3) -> RP收益: ${betRes.rpGain} (預期: 0) => ${betRes.rpGain === 0 ? '✅' : '❌'}`
  );

  console.log('\n✅ 法庭全程序流程覆蓋測試完成。');
}

testCourtFullFlow().catch(console.error);
