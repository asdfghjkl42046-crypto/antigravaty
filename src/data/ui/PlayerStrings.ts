import { SYSTEM_STRINGS } from '../SystemStrings';

/**
 * 【玩家個人數據與側邊欄文案】
 * --------------------------------------------------
 * 對應功能：主畫面側邊欄 (Sidebar) 顯示的資金、前科與各項指標標籤。
 */
export const PLAYER_UI_STRINGS = {
  // 核心點數縮寫 (引用自 SystemStrings)
  get STATS() {
    return {
      RP: SYSTEM_STRINGS.UI_LABELS.RP,
      AP: SYSTEM_STRINGS.UI_LABELS.AP,
    };
  },

  /**
   * 【側邊欄與資訊看板】
   * 出現在 Dashboard 畫面，顯示玩家目前的資產狀態。
   */
  get SIDEBAR() {
    return {
      TITLE: '行動順位',
      NOW_PLAYING: 'NOW PLAYING',
      TOTAL_CAPITAL: SYSTEM_STRINGS.UI_LABELS.MONEY,
      TRUST_FUND: SYSTEM_STRINGS.UI_LABELS.TRUST_FUND,
      CRIMINAL_RECORDS: SYSTEM_STRINGS.UI_LABELS.CONVICTION,
      CURRENCY_UNIT: '萬',
      // 各項能力的標籤
      STAT_LABELS: {
        IP: SYSTEM_STRINGS.UI_LABELS.IP,
        RP: SYSTEM_STRINGS.UI_LABELS.RP,
        AP: SYSTEM_STRINGS.UI_LABELS.AP,
        BM: SYSTEM_STRINGS.UI_LABELS.BM,
      },
    };
  },
};
