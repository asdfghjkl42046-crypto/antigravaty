import { Traditionalist } from './Traditionalist';
import { Algorithmic } from './Algorithmic';
import { Elegant } from './Elegant';
import { Pragmatic } from './Pragmatic';
import { PowerBroker } from './PowerBroker';
import type { JudgePersonality } from '../../types/game';

// ============================================================
// 型別定義
// ============================================================


/** 對話內容的變數：用來填入人名、款項、罪名等 */
export interface TemplateVars {
  tag?: string;
  lawName?: string;
  defense?: string;
  hIntent?: string;
  defendant?: string;
  bm?: number;
  trials?: number;
  rp?: number;
}

// ============================================================
// 法官的基本資料與 AI 設定
// ============================================================
export interface JudgeLabel {
  name: string; // 本人名稱
  judgeName: string; // 遊戲內顯示的法官名
  title: string; // 稱號
  style: string; // 顯示風格
  icon: string; // 圖示
  prompt_injection: string; // AI 法官的性格設定（給 AI 的指令）
}


// ============================================================
// 質詢 / 開場模板
// ============================================================

/** 開場白代碼庫：收錄法官在開庭時的台詞 */
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

/** 賄賂物品名稱：開局時可以選擇用來收買法官的物品 */
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

/** 每個法官各自喜歡的賄賂類型 */
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
 * 文字替換工具：把台詞中的變數（如 {tag}）替換成實際的內容。
 */
export function fillTemplate(template: string, vars: TemplateVars): string {
  return template
    .replace(/\{tag\}/g, vars.tag ?? '')
    .replace(/\{lawName\}/g, vars.lawName ?? '')
    .replace(/\{defense\}/g, vars.defense ?? '')
    .replace(/\{hIntent\}/g, vars.hIntent ?? '')
    .replace(/\{defendant\}/g, vars.defendant ?? '')
    .replace(/\{bm\}/g, String(vars.bm ?? 0))
    .replace(/\{trials\}/g, String(vars.trials ?? 0))
    .replace(/\{rp\}/g, String(vars.rp ?? 0));
}

/**
 * 隨機挑選台詞：從資料庫中隨機選出一句法官台詞。
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
