import type { Card } from '../../types/game';
import { CARDS_A } from './CARDS_A';
import { CARDS_B } from './CARDS_B';
import { CARDS_C } from './CARDS_C';
import { CARDS_D } from './CARDS_D';
import { CARDS_E } from './CARDS_E';
import { CARDS_START } from './CARDS_START';

/**
 * [機密檔案庫] 地下商業情報網庫存 (Cards DB)
 * 作為所有黑灰產提案與事件的匯流黑市。將 A 到 E 類的所有投資內線消息包裝成巨大的軍火庫，
 * 讓核心引擎在老闆要下單時，能精準、無延遲地抽出對應的致命選項與後果。
 */
export const CARDS_DB: Record<string, Card> = {
  ...CARDS_A,
  ...CARDS_B,
  ...CARDS_C,
  ...CARDS_D,
  ...CARDS_E,
  ...CARDS_START,
};

/**
 * [話術字型檔] 提案書的糖衣包裝字典 (Card UI Text)
 * 專門產生用來蒙蔽股東與檢察官的漂亮詞彙，包含堂口的官方稱呼、狡辯的提示文字，以及要不要做合法假帳的按鈕敘述。
 */
export const CARD_UI_TEXT = {
  // 堂口大分類偽裝名目
  CARD_TYPES: {
    A: '商業區', // 高收益但也高風險
    B: '人才市場', // 補充 IP 的主要途徑
    C: '公益慈善', // 洗白名聲 RP 的好去處
    D: '政府標案', // 特殊事件，可能觸發法規底線
    E: '律師事務所', // 購買黑金或防禦機制
  } as Record<string, string>,

  TYPE_DEFAULT: '未知區域',
  DEFAULT_TITLE: '突發商業危機',
  DEFAULT_DESC:
    '身為公司的劊子手，你正面臨一個黑白邊緣的抉擇。你的這筆簽章將決定公司戶頭的厚度或是明天的新聞頭條。',
  DEFAULT_OPTION: (idx: number) => `選項 ${idx}`,

  // 法庭狡辯產生器：把見不得光的黑道行徑，包裝成冠冕堂皇的「企業改革」塞入法庭筆錄
  LAW_CASE_ACTION: (action: string, caseTerm: string) =>
    `${action}，並透過「${caseTerm}」確保利益。`,

  DEFAULT_ACTION_DESC: '簽字批准此提案，並承擔背後的所有風險與暴利。',
  RISK_ASSESSMENT: 'Legal Risk Assessment', // 掃描器與卡牌風險評估時的警告標語

  // 白黑條款：你要繳保護費給政府換取好名聲，還是大膽逃漏稅把錢全吞了？
  POST_ACTION: {
    DECLARE_TITLE: (title: string) => `【${title}】申報決策`,
    DECLARE_LABEL: '正規申報案',
    DECLARE_DESC: '支付手續費並列入財報，成功申報可獲得額外名聲獎勵。',
    SKIP_LABEL: '略過申報 (黑箱)',
    SKIP_DESC: '隱瞞資金流向，若成功可保留全額，失敗則沒收並產生黑材料。',
  },
};
