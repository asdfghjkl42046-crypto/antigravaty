'use client'; // 包含 onClick 互動切換機制，必須在客端運算

import React from 'react';
import { MousePointer2, Users, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GLOBAL_UI_TEXT } from '@/data/system/GlobalUI';

// 控制器排線規格：規範切換按鈕要如何與主機板連動
interface TabNavigationProps {
  activeTab: 'scan' | 'hrshop' | 'log'; // 戰情室現在正亮著哪個頻道的監視器
  onTabChange: (tab: 'scan' | 'hrshop' | 'log') => void; // 當總裁切換頻道時發出的調度命令
}

/**
 * 總裁戰術控制面板 (Tab Navigation)
 * 懸浮在螢幕邊界的儀表切換膠囊。
 * 點擊後無情地切換主監控畫面：你要看「行動調查區」、進入「暗黑人力市場」，還是調閱「犯罪追蹤日誌」？
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
