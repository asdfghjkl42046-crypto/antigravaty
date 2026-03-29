/**
 * 玩家資產與顯示文字
 * 用於側邊欄顯示玩家各項數值。
 */
export const PLAYER_UI_TEXT = {
  // 集團命脈四大指標
  STATS: {
    RP: '名聲', // Reputation 用來維持企業形象，太低會破產淘汰
    AP: '行動力', // Action Points 每回合花費
  },
  // 側邊欄角力榜的監視字眼
  SIDEBAR: {
    TITLE: '行動順位',
    NOW_PLAYING: 'NOW PLAYING',
    TOTAL_CAPITAL: '資金',
    TRUST_FUND: '海外避稅信託金', // 會計師 LV3 幫你藏匿的絕對無敵金庫
    CRIMINAL_RECORDS: '犯罪前科',
    CURRENCY_UNIT: '萬',
    STAT_LABELS: {
      IP: '人才點券',
      RP: '名聲',
      AP: '行動力',
      BM: '黑料', // 潛在毀滅彈 (惹怒同行或被檢警盯上累積的暗潮)
    },
  },
};
