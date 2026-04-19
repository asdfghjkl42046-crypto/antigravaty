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
      { type: '被動', desc: '法律護盾：上陣協助，勝訴機率如有神助，提升 30%' },
      {
        type: '被動',
        desc: '扭轉乾坤：旁觀者的質疑將會轉為支持；同時掌握法庭勝率情報',
      },
      {
        type: '主動',
        desc: '隻手遮天：砸下總資產 20%（至少 100 萬）+ 5 IP，讓對方乖乖撤案',
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
      { type: '被動', desc: '敗訴公關：法庭上輸了也能硬拗，敗訴帶來的名聲損失直接減半' },
      { type: '被動', desc: '長期經營：每回合自動 +5 RP；就算押注失敗，名聲也分毫無損' },
    ],
  },
  {
    key: 'accountant',
    name: '資深會計師',
    emoji: '💼',
    icon: Calculator,
    color: 'emerald',
    levels: [
      { type: '被動', desc: '稅務優化：商業類卡片的資金收益，每一份都再多賺 10%' },
      { type: '被動', desc: '罰單打折：法院開出的罰單不用全買單，敗訴罰金直接砍半' },
      {
        type: '被動',
        desc: '合法避稅：連續 2 回合保持清白後，悄悄將 10% 資金轉入海外信託(最多1000萬)',
      },
    ],
  },
  {
    key: 'cto',
    name: '技術長',
    emoji: '💻',
    icon: Cpu,
    color: 'blue',
    levels: [
      { type: '被動', desc: '算力套利：每次打出商業投資卡，有 30% 機會讓 AP 神奇歸還' },
      { type: '被動', desc: '駭客腳本：系統每回合自動替你洗出100萬的隱密黑金入帳' },
      { type: '被動', desc: '反間防火牆：對手惡意挖角時，產生的犯罪標籤及黑料就多一倍' },
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
