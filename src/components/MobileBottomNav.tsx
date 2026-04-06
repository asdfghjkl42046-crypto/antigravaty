'use client';

import React from 'react';
import { Home, ShoppingBag, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavTab = 'home' | 'hrshop' | 'scan';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

/**
 * 19.5:9 底部導覽欄
 * 依照設計圖實作：具備藍色選中態背景與發光效果。
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavTab; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home size={28} />, label: '主頁' },
    { id: 'hrshop', icon: <ShoppingBag size={28} />, label: '商店' },
    { id: 'scan', icon: <ScanLine size={28} />, label: '掃描' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-3xl border-t border-white/5 px-10 flex items-center justify-between z-[100] pb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center relative group"
            title={tab.label}
            aria-label={tab.label}
          >
            {/* 選中態發光底座 */}
            <div className={cn(
              "absolute -top-1 w-16 h-16 rounded-full bg-blue-500/20 blur-xl transition-all duration-500 scale-150 opacity-0",
              isActive && "opacity-100"
            )} />
            
            {/* 圖示背景容器 (選中時有藍色圓圈) */}
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 z-10",
              isActive ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "text-slate-500 hover:text-slate-400"
            )}>
              {tab.icon}
            </div>
          </button>
        );
      })}
    </nav>
  );
};
