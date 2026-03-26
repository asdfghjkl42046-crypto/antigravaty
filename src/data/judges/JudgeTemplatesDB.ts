import { Traditionalist } from './Traditionalist';
import { Algorithmic } from './Algorithmic';
import { Elegant } from './Elegant';
import { Pragmatic } from './Pragmatic';
import { PowerBroker } from './PowerBroker';
import type { JudgePersonality } from '../../types/game';

// ============================================================
// 型別定義
// ============================================================

/** 蒐集各派系法官在定罪或放人時，那一副副高高在上、極度刻薄的官僚語錄 */
export interface JudgmentTemplate {
  win: string[]; // 當有錢判生、被告拿錢砸出無罪脫身時的法官場面話
  lose: string[]; // 宣判有罪、無情剝奪資產時的嚴厲制裁
  silence: string[]; // (備用紀錄) 被告連律師都請不起、啞口無言時的羞辱
  appeal_win: string[]; // 被雄厚資本與黑材料砸到「非常上訴」大逆轉時的吃癟與錯愕
  appeal_lose: string[]; // 非常上訴失敗、不自量力的罪犯被法槌徹底踩死時的終極嘲諷
}

/** 法庭證物袋：將罪名、狡辯的供詞、被告的本名還有見不得光的黑料，全部當作炸藥塞入劇本中引爆 */
export interface TemplateVars {
  tag?: string;
  lawName?: string;
  sTerm?: string;
  hIntent?: string;
  escape?: string;
  defendant?: string;
  bm?: number;
  trials?: number;
  rp?: number;
}

/** 判官的個人檔案：包含他對外的頭銜偽裝，以及偷偷注入大語言模型裡讓 AI 變成惡棍的暗黑咒語 (Prompt) */
export interface JudgeLabel {
  name: string;
  judgeName: string;
  title: string; // 例如「最高法院榮譽院長」
  style: string; // 法槌或穿著風格
  icon: string;
  prompt_injection: string; // 若開啟 AI 模式，要把這段詠唱傳給 OpenAI 或 Gemini 告訴它個性要怎麼裝
}

// ============================================================
// 判決模板資料庫
// ============================================================

/** [判決總庫] 統整五大惡棍法官 (頑固老人、無情AI、貪婪貴族、騎牆派、黑市掮客) 在結案時的嘴臉與語錄 */
export const JUDGMENT_TEMPLATES: Record<JudgePersonality, JudgmentTemplate> = {
  traditionalist: Traditionalist.JUDGMENT,
  algorithmic: Algorithmic.JUDGMENT,
  elegant: Elegant.JUDGMENT,
  pragmatic: Pragmatic.JUDGMENT,
  power_broker: PowerBroker.JUDGMENT,
};

// ============================================================
// 質詢 / 開場模板
// ============================================================

/** [下馬威辭典] 各大法官剛坐上大位、重擊法槌時用來震懾原告與被告的極度傲慢開場白 */
export const INTERROGATION_TEMPLATES: Record<JudgePersonality, string[]> = {
  traditionalist: Traditionalist.INTERROGATION,
  algorithmic: Algorithmic.INTERROGATION,
  elegant: Elegant.INTERROGATION,
  pragmatic: Pragmatic.INTERROGATION,
  power_broker: PowerBroker.INTERROGATION,
};

// ============================================================
// 賄賂物品標籤 (BribeItem -> Label)
// ============================================================

/** 地下拍賣會：開局時塞在皮箱裡拿去收買法官用的骯髒貢品清單 */
export const BRIBE_LABELS: Record<string, string> = {
  antique: '古董', // 適合老派法官
  crypto: '加密貨幣', // 適合AI或利益導向法官
  art: '限量藝術品', // 適合優雅法官
  wine: '稀有陳年酒',
  intel: '秘密情報', // 適合權勢掮客
};

// ============================================================
// 法官賄賂主題 (JudgePersonality -> Theme)
// ============================================================

/** 分析這些法官道貌岸然的背後，到底隱藏著什麼樣可以被金錢與利益輕易戳中的軟肋 */
export const JUDGE_BRIBE_THEMES: Record<string, string> = {
  traditionalist: '【司法尊嚴】',
  algorithmic: '【數據效率】',
  elegant: '【學術品味】',
  pragmatic: '【實務平衡】',
  power_broker: '【政治現實回報】',
};

// ============================================================
// 旁觀者干預選項
// ============================================================

/** 陪審團的風向球：在純體驗版模式下，圍觀的鄉民落井下石或是瞎挺的無情公版罐頭發言 */
export const BYSTANDER_OPTIONS = [
  { label: '🛡 支持被告', text: '我認為被告的行為屬於合理商業範疇，請法官從寬認定。' },
  { label: '⚔ 質疑被告', text: '我對被告的解釋深表懷疑，建議法庭嚴加審查其行為動機。' },
] as const;

// ============================================================
// 模板填充助工具
// ============================================================

/**
 * 文書偽造大師 (字串替換引擎)：把法官語錄裡面的空白處 {tag}，無縫替換成血淋淋的「內線交易」罪證字眼。
 */
export function fillTemplate(template: string, vars: TemplateVars): string {
  return template
    .replace(/\{tag\}/g, vars.tag ?? '')
    .replace(/\{lawName\}/g, vars.lawName ?? '')
    .replace(/\{sTerm\}/g, vars.sTerm ?? '')
    .replace(/\{hIntent\}/g, vars.hIntent ?? '')
    .replace(/\{escape\}/g, vars.escape ?? '')
    .replace(/\{defendant\}/g, vars.defendant ?? '')
    .replace(/\{bm\}/g, String(vars.bm ?? 0))
    .replace(/\{trials\}/g, String(vars.trials ?? 0))
    .replace(/\{rp\}/g, String(vars.rp ?? 0));
}

/**
 * [引擎工具] 俄羅斯輪盤式的發言：從法官的題庫裡隨機抽出一張嘴臉，並把玩家的罪狀狠狠填進去，確保每次上法院都有不同的壓迫體驗。
 */
export function getRandomTemplate(templates: string[], vars: TemplateVars): string {
  if (!templates || templates.length === 0) return '';
  const idx = Math.floor(Math.random() * templates.length);
  return fillTemplate(templates[idx], vars);
}

/**
 * [名單建檔] 把所有法官的真名、頭銜與弱點歸檔成冊，供戰情室面板 (UI) 隨時調閱這些傢伙的底細
 */
export const JUDGE_LABELS: Record<JudgePersonality, JudgeLabel> = {
  traditionalist: Traditionalist.LABEL,
  algorithmic: Algorithmic.LABEL,
  elegant: Elegant.LABEL,
  pragmatic: Pragmatic.LABEL,
  power_broker: PowerBroker.LABEL,
};
