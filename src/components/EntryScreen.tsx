'use client';

import React from 'react';
import { User, Users, ShieldAlert } from 'lucide-react';

interface EntryScreenProps {
  onSelectSingle: () => void;
  onSelectMulti: () => void;
}

/**
 * 遊戲模式初次入口
 * 提供單機與多機模式選擇，設計風格延續黑金科技感。
 */
export const EntryScreen: React.FC<EntryScreenProps> = ({ onSelectSingle, onSelectMulti }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1a1a1a,transparent)] opacity-50" />
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
        {/* Logo / Title */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-[1px]">
            <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-4 italic uppercase">
            Antigravity <span className="text-amber-500">Legal Adventure</span>
          </h1>
          <p className="text-slate-500 font-medium tracking-[0.3em] uppercase text-sm">
            創業冒險：法庭攻防戰
          </p>
        </div>

        {/* 模式選擇卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          {/* 單機模式 */}
          <button
            onClick={onSelectSingle}
            className="group relative flex flex-col items-center p-10 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-amber-500/50 hover:bg-white/[0.05] transition-all duration-500"
          >
            <div className="mb-6 p-5 rounded-2xl bg-white/5 group-hover:bg-amber-500/10 group-hover:scale-110 transition-all duration-500">
              <User className="w-10 h-10 text-slate-400 group-hover:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">單機遊玩</h2>
            <p className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">
              傳統單機體驗，挑戰 AI 法官
            </p>
            
            {/* 裝飾線條 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-amber-500 group-hover:w-1/2 transition-all duration-500" />
          </button>

          {/* 多機模式 */}
          <button
            onClick={onSelectMulti}
            className="group relative flex flex-col items-center p-10 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.05] transition-all duration-500"
          >
            <div className="mb-6 p-5 rounded-2xl bg-white/5 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-500">
              <Users className="w-10 h-10 text-slate-400 group-hover:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">多機連線</h2>
            <p className="text-slate-500 text-sm group-hover:text-slate-400 transition-colors">
              與現實好友同步法庭對決
            </p>
            
            {/* 裝飾線條 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue-500 group-hover:w-1/2 transition-all duration-500" />
          </button>
        </div>

        {/* 頁腳 */}
        <div className="mt-20 text-[10px] font-bold text-slate-700 tracking-[0.2em] uppercase">
          Version 1.2.0 | Secured by Hash Chain Technology
        </div>
      </div>
    </div>
  );
};
