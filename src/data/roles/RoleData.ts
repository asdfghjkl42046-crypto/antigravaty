import React from 'react';
import { Gavel, Megaphone, Calculator, Cpu } from 'lucide-react';
import type { RoleType } from '../../types/game';

/**
 * 角色能力資料庫
 * 定義了律師、公關、會計、技術長各等級的能力與顏色。
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
      { type: '被動', desc: '法律護盾：自述答辯的勝訴機率提升 30%' },
      { type: '被動', desc: '讀穿把戲：答辯模式下自動剔除 1 個錯誤選項；解鎖法庭勝率可見度' },
      {
        type: '主動',
        desc: '隻手遮天：答辯失敗後可支付 Max(100萬, 總資產20%) + 5 IP，強制撤銷告訴',
      },
    ],
  },
  {
    key: 'pr',
    name: '公關經理',
    emoji: '🎤',
    icon: Megaphone,
    color: 'pink',
    levels: [
      { type: '被動', desc: '輿論滅火：卡牌行動造成的 RP 扣除自動減半' },
      { type: '被動', desc: '敗訴公關：法庭敗訴產生的名聲損失自動減半' },
      { type: '被動', desc: '長期經營：每回合自動 +5 RP；押注失敗時免疫名聲損失' },
    ],
  },
  {
    key: 'accountant',
    name: '資深會計師',
    emoji: '💼',
    icon: Calculator,
    color: 'emerald',
    levels: [
      { type: '被動', desc: '稅務優化：商業類（A/D 類）卡片資金收益額外 +10%' },
      { type: '被動', desc: '罰單打折：法院裁定的敗訴罰金基數自動減半' },
      { type: 'Streak', desc: '合法避稅：連續 2 回合無犯罪紀錄後，自動將 10% 資金轉入信託保全' },
    ],
  },
  {
    key: 'cto',
    name: '技術長',
    emoji: '💻',
    icon: Cpu,
    color: 'blue',
    levels: [
      { type: '被動', desc: '算力套利：打出商業投資（A大類）卡時，30% 機率退還 1 AP' },
      { type: '被動', desc: '專利印鈔機：技術護城河發威，每回合自動產生 +100萬 G 研發收益' },
      { type: '被動', desc: '反間防火牆：遭對手挖角時自動反制，令對方獲得額外黑材料' },
    ],
  },
];

/**
 * 各人才專屬的代表顏色
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

/** 人才升級介面文字 */
export const HR_UI_TEXT = {
  TITLE: '人力銀行',
  COST_DESC: '每次升級需 100 IP + 100 萬 G',
  MAX_LEVEL: 'MAX',
  UPGRADE_BTN: (nextLv: number) => `升級 LV${nextLv}`,
  UNLOCKED: '已啟用',
};
