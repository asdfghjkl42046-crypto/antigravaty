import { SYSTEM_STRINGS } from '../SystemStrings';

/**
 * 企業人才 (Roles) 相關文案
 * 使用 Getter 確保在 SystemStrings 初始化後才讀取值，防止循環引用。
 */
export const ROLE_STRINGS = {
  HR_UI: {
    TITLE: '人脈與發展',
    SUBTITLE: '招募關鍵人才，強化企業運營。',
    LEVEL_PREFIX: '等級',
    HIRE_BTN: '確認招募',
    UPGRADE_BTN: '晉勝人才',
  },
  
  get DESCRIPTIONS() {
    return {
      LAWYER: [
        { type: '主動', desc: `法庭救濟：花費 資金 + 5 ${SYSTEM_STRINGS.UI_LABELS.IP}，強制撤銷本次起訴。` },
        { type: '被動', desc: `風險管控：降低行動產生的 ${SYSTEM_STRINGS.UI_LABELS.RP} 損失風險。` }
      ],
      CFO: [
        { type: '被動', desc: `資金倍增：所有掃描行動產生的資金收益提升 10%。` },
        { type: '主動', desc: `資金洗白：將 ${SYSTEM_STRINGS.UI_LABELS.RP} 轉換為海外信託資金。` }
      ],
      CTO: [
        { type: '被動', desc: `研發回饋：每次掃描行動有 30% 機率退還 ${SYSTEM_STRINGS.UI_LABELS.AP}。` },
        { type: '主動', desc: '技術壟斷：產生額外的黑材料，增加競爭對手的罰金風險。' }
      ],
      COO: [
        { type: '被動', desc: `運營優化：每回合自動產生 +2 ${SYSTEM_STRINGS.UI_LABELS.IP}。` },
        { type: '主動', desc: `產能全開：消耗所有 ${SYSTEM_STRINGS.UI_LABELS.AP}，換取三倍的資金收益。` }
      ],
    };
  },

  get COST_DESC() {
    return `晉升費用：100 ${SYSTEM_STRINGS.UI_LABELS.IP} + 100 萬 G`;
  }
};
