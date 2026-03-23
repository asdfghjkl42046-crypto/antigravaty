import React from 'react';
import { Gavel, Megaphone, Calculator, Cpu } from 'lucide-react';
import type { RoleType } from '../../types/game';

/**
 * [暗黑獵頭名冊] 地下菁英職能資料庫 (Role Data)
 * 定義了四大走狗（王牌律師、危機公關、做帳會計、洗錢技術長）要如何在商場上替老闆擋刀與搶錢的特性。
 * 同時為他們準備了專屬於自己的色彩配置，像是律師的黃金琥珀色與公關的交際粉色。
 */
export const ROLE_DATA: {
  key: RoleType;
  name: string;
  emoji: string;
  icon: React.ElementType; // 綁定 Lucide icon 元件
  color: string; // 綁定 COLOR_MAP 內的顏色 key
  levels: { type: string; desc: string }[];
}[] = [
  {
    key: 'lawyer',
    name: '王牌律師',
    emoji: '🧑‍⚖️',
    icon: Gavel,
    color: 'amber',
    levels: [
      { type: '被動', desc: '法律防線：自述答辯勝訴基礎機率由 30% 提升至 60%' },
      { type: '被動', desc: '專業過濾：AI 答辯模式下自動識別並移除 1 個錯誤選項' }, // 讀心術：提前猜測法官喜好，拔掉一個鐵定會激怒法庭的錯誤解答
      { type: '主動', desc: '強力收案：答辯失敗後可支付 Max(100萬, 總資產20%) + 5 IP 強制撤告' }, // 隻手遮天 (VIP 級庭外和解)：就算要砸掉兩成身家也要買通司法系統，強行撤回告訴！
    ],
  },
  {
    key: 'pr',
    name: '公關經理',
    emoji: '🎤',
    icon: Megaphone,
    color: 'pink',
    levels: [
      { type: '被動', desc: '負面緩解：卡牌行動導致的名聲（RP）扣除損失自動減半' },
      { type: '被動', desc: '輿論控制：法庭敗訴後產生的社會名聲損失自動減半' },
      { type: '被動', desc: '形象經營：每回合自動 +2 RP；押注失敗時免疫資金懲罰' },
    ],
  },
  {
    key: 'accountant',
    name: '資深會計師',
    emoji: '💼',
    icon: Calculator,
    color: 'emerald',
    levels: [
      { type: '被動', desc: '稅務優化：商業類（A/D 類）卡片資金收益額外提升 10%' },
      { type: '被動', desc: '精算抗罰：經法院裁定之敗訴罰金基數自動減半' },
      { type: 'Streak', desc: '財富轉移：連續 2 回合無犯罪紀錄後，自動將 10% 資金轉入信託' }, // 合法避稅天堂 (信託機制)：把錢乾淨地藏在海外，結算時讓對手望塵莫及
    ],
  },
  {
    key: 'cto',
    name: '技術長',
    emoji: '💻',
    icon: Cpu,
    color: 'blue',
    levels: [
      { type: '被動', desc: '算力優化：打出商業投資（A大類）時 30% 機率返還 1 AP' }, // 駭客腳本：自動化執行商業操作，降低體力損耗
      { type: '被動', desc: '反間防火牆：遭到競爭對手挖角時發動反制，令對方增加惡意黑材料' }, // Pvp 髒彈防禦機制
      { type: '被動', desc: '專利印鈔機：憑藉技術屏障，每回合自動產生 +100 萬 G 研發收益' }, // 被動不勞而獲印鈔機
    ],
  },
];

/**
 * [霓虹編碼] 各大走狗專屬的企業識別色 (Color Map)
 * 用來在黑暗的介面上，為這四種精英罪犯標籤打上他們專屬的燈光與邊框。
 */
export const COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string; glow: string; badge: string }
> = {
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    badge: 'bg-amber-500',
  },
  pink: {
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-400',
    glow: 'shadow-pink-500/20',
    badge: 'bg-pink-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    badge: 'bg-blue-500',
  },
};

/**
 * [人口販子目錄] 暗黑獵頭市場的標語與報價單 (HR UI TEXT)
 */
export const HR_UI_TEXT = {
  TITLE: '人力銀行',
  COST_DESC: '每次升級需 100 IP + 100 萬 G',
  MAX_LEVEL: 'MAX',
  UPGRADE_BTN: (nextLv: number) => `升級 LV${nextLv}`,
  UNLOCKED: '已啟用',
};
