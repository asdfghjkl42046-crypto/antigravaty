'use client';

import React from 'react';
import { Home, ShoppingBag, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavTab = 'home' | 'shop' | 'scan';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

/**
 * 19.5:9 底部導覽欄 - 視覺復刻版
 * 特色：懸浮式圓角、backdrop-blur 玻璃質感、活躍項藍色發光底座。
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home', icon: Home, label: '主畫面' },
    { id: 'shop', icon: ShoppingBag, label: '商店' },
    { id: 'scan', icon: ScanLine, label: '掃描' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] z-50">
      {/* 1. 懸浮容器：深色玻璃質感 */}
      <div className="relative bg-[#020617]/85 backdrop-blur-2xl border border-white/10 rounded-[40px] px-6 py-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex items-center justify-around overflow-hidden">
        
        {/* 背景微點裝飾 */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavTab)}
              className="relative flex flex-col items-center justify-center w-14 h-14 group transition-all"
            >
              {/* 活躍態：藍色發光圓圈背景 */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  <div className="w-12 h-12 bg-blue-600/30 blur-xl rounded-full" />
                  <div className="w-11 h-11 bg-blue-600/15 rounded-full border border-blue-400/30" />
                </div>
              )}

              {/* 圖示主體 */}
              <div className={cn(
                "relative z-10 transition-all duration-500",
                isActive ? "text-blue-400 scale-125" : "text-slate-500 hover:text-slate-300"
              )}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              {/* 活躍時的小點 (可選：增加視覺回饋) */}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-in slide-in-from-bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
