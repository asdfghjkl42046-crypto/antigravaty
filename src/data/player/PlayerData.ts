/**
 * [總裁底氣] 玩家資產與黑歷史監視器文案 (Player Data UI)
 * 主要服務於左側監視器 (PlayerSidebar)，
 * 把那些冰冷的系統底層代號轉換成讓你腎上腺素飆升的財富名目與定罪指標。
 */
export const PLAYER_UI_TEXT = {
  // 集團命脈四大指標
  STATS: {
    IP: '人才點數', // Influence Points 用來挖角升級
    G: '資金', // Gold 用來付罰金或購買裝備卡
    RP: '名聲', // Reputation 用來維持企業形象，太低會破產淘汰
    AP: '行動力', // Action Points 每回合花費
  },
  // 側邊欄角力榜的監視字眼
  SIDEBAR: {
    TITLE: '行動順位',
    NOW_PLAYING: 'NOW PLAYING',
    TOTAL_CAPITAL: '流動黑金(G)',
    TRUST_FUND: '海外避稅信託(G)', // 會計師 LV3 幫你藏匿的絕對無敵金庫
    CRIMINAL_RECORDS: '犯罪前科',
    CURRENCY_UNIT: '萬',
    STAT_LABELS: {
      IP: '人才點數',
      RP: '名聲',
      AP: '行動力',
      BM: '黑料(BM)', // 潛在毀滅彈 (惹怒同行或被檢警盯上累積的暗潮)
    },
  },
};
