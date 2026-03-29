'use client'; // 包含 onClick 互動切換機制，必須在客端運算

import React from 'react';
import { MousePointer2, Users, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GLOBAL_UI_TEXT } from '@/data/system/GlobalUI';

// 控制器排線規格：規範切換按鈕要如何與主機板連動
interface TabNavigationProps {
  activeTab: 'scan' | 'hrshop' | 'log'; // 目前選取的分頁
  onTabChange: (tab: 'scan' | 'hrshop' | 'log') => void; // 切換分頁的函式
}

/**
 * 下方分頁導覽列
 * 讓玩家在「投資」、「團隊」、「紀錄」三個主要畫面之間切換。
 */
export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  // 將三大情報網的按鈕模組先行實例化註冊
  const TABS = [
    { id: 'scan', label: GLOBAL_UI_TEXT.TABS.SCAN, icon: <MousePointer2 size={28} /> },
    { id: 'hrshop', label: GLOBAL_UI_TEXT.TABS.HR, icon: <Users size={28} /> },
  ] as const;

  return (
    // 戰術膠囊底座：半透明磨砂包覆的科技感外殼
    <div className="flex gap-3 p-2 bg-black/40 border border-white/10 rounded-3xl w-fit z-50">
      {/* 工廠流水線：透過陣列迴圈動態壓出這三顆戰術按鈕 */}
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all text-2xl whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
