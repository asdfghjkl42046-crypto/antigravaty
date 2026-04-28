import { SYSTEM_STRINGS } from '../SystemStrings';

/**
 * 玩家資產與顯示文字 (正名：犯罪證據)
 * 使用 Getter 確保在 SystemStrings 初始化後才讀取值，防止循環引用。
 */
export const PLAYER_UI_STRINGS = {
  get STATS() {
    return {
      RP: SYSTEM_STRINGS.UI_LABELS.RP,
      AP: SYSTEM_STRINGS.UI_LABELS.AP,
    };
  },
  get SIDEBAR() {
    return {
      TITLE: '行動順位',
      NOW_PLAYING: 'NOW PLAYING',
      TOTAL_CAPITAL: SYSTEM_STRINGS.UI_LABELS.MONEY,
      TRUST_FUND: SYSTEM_STRINGS.UI_LABELS.TRUST_FUND,
      CRIMINAL_RECORDS: SYSTEM_STRINGS.UI_LABELS.CONVICTION,
      CURRENCY_UNIT: '萬',
      STAT_LABELS: {
        IP: SYSTEM_STRINGS.UI_LABELS.IP,
        RP: SYSTEM_STRINGS.UI_LABELS.RP,
        AP: SYSTEM_STRINGS.UI_LABELS.AP,
        BM: SYSTEM_STRINGS.UI_LABELS.BM,
      },
    };
  },
};
