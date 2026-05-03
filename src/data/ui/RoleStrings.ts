import { SYSTEM_STRINGS } from '../SystemStrings';

/**
 * 【人才角色與技能文案】
 * --------------------------------------------------
 * 對應功能：人才市場 (HR)、角色升級、以及法庭/地圖中的技能描述。
 */
export const ROLE_STRINGS = {
  // 職業名稱
  LAW_NAME: '王牌律師',
  PR_NAME: '公關經理',
  ACC_NAME: '資深會計師',
  CTO_NAME: '技術長',

  /**
   * 【王牌律師 (Lawyer) 技能】
   * 專精：法庭勝率、強制撤案。
   */
  get LAW_LEVELS() {
    return [
      { type: '被動', desc: '法律護盾：上陣協助，勝訴機率如有神助，提升 30%' },
      { type: '被動', desc: '扭轉乾坤：旁觀者的質疑將會轉為支持；同時掌握法庭勝率情報' },
      { type: '主動', desc: `隻手遮天：扣除大筆資金(保底100萬) + 5 ${SYSTEM_STRINGS.UI_LABELS.IP}，讓對方強制撤案` },
    ];
  },

  /**
   * 【公關經理 (PR) 技能】
   * 專精：名聲 (RP) 保護、輿論操作。
   */
  get PR_LEVELS() {
    return [
      { type: '被動', desc: `輿論滅火：卡牌行動造成的 ${SYSTEM_STRINGS.UI_LABELS.RP} 扣除自動減半` },
      { type: '被動', desc: `敗訴公關：法庭上輸了也能硬拗，敗訴帶來的名聲損失直接減半` },
      { type: '被動', desc: `長期經營：每回合自動 +5 ${SYSTEM_STRINGS.UI_LABELS.RP}；就算押注失敗，名聲也分毫無損` },
    ];
  },

  /**
   * 【資深會計師 (Accountant) 技能】
   * 專精：資金優化、稅務避險。
   */
  get ACC_LEVELS() {
    return [
      { type: '被動', desc: '稅務優化：增加商業類卡片獲得資金的金額' },
      { type: '被動', desc: '罰單打折：有效減少法院罰金的支出' },
      { type: '被動', desc: '合法避稅：連續 2 回合保持清白後，將部分現金轉入海外信託' },
    ];
  },

  /**
   * 【技術長 (CTO) 技能】
   * 專精：體力 (AP) 套利、黑金洗錢。
   */
  get CTO_LEVELS() {
    return [
      { type: '被動', desc: `算力套利：每次打出商業投資卡，有 30% 機會讓 ${SYSTEM_STRINGS.UI_LABELS.AP} 神奇歸還` },
      { type: '被動', desc: '駭客腳本：系統每回合自動替你洗出100萬的隱密黑金入帳' },
      { type: '被動', desc: '反間防火牆：對手惡意挖角時，產生的犯罪標籤及黑料就多一倍' },
    ];
  },

  /**
   * 【人才市場介面文字】
   * 出現在 StoreScreen.tsx 的人才分頁。
   */
  get HR_UI() {
    return {
      TITLE: '人力銀行',
      COST_DESC: `每次升級需 100 ${SYSTEM_STRINGS.UI_LABELS.IP} + 100 萬 G`,
      MAX_LEVEL: 'MAX',
      UNLOCKED: '已啟用',
    };
  },
};
