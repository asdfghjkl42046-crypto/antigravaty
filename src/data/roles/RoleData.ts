import React from 'react';
import { Gavel, Megaphone, Calculator, Cpu } from 'lucide-react';
import type { RoleType } from '../../types/game';

/**
 * 角色能力資料庫
 * 定義了律師、公關、會計、技術長各等級的能力與顏色。
 */
export type RoleColor = 'amber' | 'pink' | 'emerald' | 'blue';

export const ROLE_UPGRADE_COST = {
  g: 100, // 升級所需的資金 (100萬)
  ip: 100, // 升級所需的技術點數 (100點)
};

import { ROLE_STRINGS } from '../ui/RoleStrings';

export const ROLE_DATA: {
  key: RoleType;
  name: string;
  emoji: string;
  icon: React.ElementType; // 綁定 Lucide icon 元件
  color: RoleColor; // 綁定 COLOR_MAP 內的顏色 key
  levels: { type: string; desc: string }[];
}[] = [
  {
    key: 'lawyer',
    name: ROLE_STRINGS.LAW_NAME,
    emoji: '🧑‍⚖️',
    icon: Gavel,
    color: 'amber',
    levels: ROLE_STRINGS.LAW_LEVELS,
  },
  {
    key: 'pr',
    name: ROLE_STRINGS.PR_NAME,
    emoji: '🎤',
    icon: Megaphone,
    color: 'pink',
    levels: ROLE_STRINGS.PR_LEVELS,
  },
  {
    key: 'accountant',
    name: ROLE_STRINGS.ACC_NAME,
    emoji: '💼',
    icon: Calculator,
    color: 'emerald',
    levels: ROLE_STRINGS.ACC_LEVELS,
  },
  {
    key: 'cto',
    name: ROLE_STRINGS.CTO_NAME,
    emoji: '💻',
    icon: Cpu,
    color: 'blue',
    levels: ROLE_STRINGS.CTO_LEVELS,
  },
];


/**
 * 各人才專屬的代表顏色
 */
export const COLOR_MAP: Record<
  RoleColor,
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
