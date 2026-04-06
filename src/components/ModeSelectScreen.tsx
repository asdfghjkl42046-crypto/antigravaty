'use client';

import { Network, Sparkles, ChevronRight } from 'lucide-react';
import type { JudgeMode } from '@/types/game';
import { GlowLogo } from './GlowLogo';
import { cn } from '@/lib/utils';

interface ModeSelectScreenProps {
  onSelect: (mode: JudgeMode) => void;
}

/**
 * 遊戲模式選擇畫面 - 最終重構版 (Strict 19.5:9 Portrait)
 * 放棄所有響應式縮放，鎖定置中手機佈局，呈現極致發光質感。
 */
export default function ModeSelectScreen({ onSelect }: ModeSelectScreenProps) {
  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-slate-950 flex items-center justify-center overflow-hidden z-[1000] select-none font-sans">
      {/* 1. 全域絕對置中底板 (Background Wrapper) */}
      
      {/* 背景裝飾：更柔和的深沉光點 */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      
      {/* 2. 鎖定 19.5:9 核心容器 (Core Container) */}
      <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] bg-black shadow-[0_0_100px_rgba(0,0,0,0.8)] border-x border-white/5 flex flex-col items-center px-8 py-6 animate-in fade-in duration-1000 overflow-hidden">
        
        {/* 頂部發光氛圍 */}
        <div className="absolute top-0 inset-x-0 h-1/4 bg-gradient-to-b from-blue-950/10 to-transparent pointer-events-none" />

        {/* 內部元件垂直排列 */}
        
        {/* A. 圓形 Logo */}
        <div className="mt-4 mb-4 flex flex-col items-center scale-90">
            <GlowLogo />
        </div>

        {/* B. 文字標題區 */}
        <div className="text-center mb-6 flex flex-col items-center gap-1 px-4">
          <span className="text-[10px] font-black tracking-[0.3em] text-blue-500/80 uppercase">
            Antigravity Terminal
          </span>
          <h1 className="text-[32px] leading-tight font-black text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            創業冒險
          </h1>
          <h2 className="text-[22px] font-medium text-blue-100/70 tracking-widest mt-[-2px]">
            現代法律篇
          </h2>
        </div>

        {/* C. 模式選單卡片 (垂直堆疊) */}
        <div className="w-full flex-1 flex flex-col gap-4 overflow-hidden justify-center pb-6">
          
          {/* C1. 網站模式 (藍色系) */}
          <button
            onClick={() => onSelect('website')}
            className="w-full group relative text-left outline-none transition-all active:scale-95 active:rotate-[1deg]"
          >
            {/* 卡片本體 */}
            <div className="relative w-full rounded-[32px] border border-blue-500/20 bg-gradient-to-b from-[#0f172a] to-[#01050a] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* 背景內部發光 */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[40px] pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                  <Network size={22} className="text-[#3b82f6]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-wider">網站模式</h3>
                  <p className="text-[8px] font-black italic text-blue-500/60 uppercase">Stable Experience</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-5 px-1 line-clamp-2">
                使用固定動態文案模板，無需等待 AI，享受極速判決體驗。
              </p>
              
              <div className="w-full py-3.5 rounded-[18px] bg-blue-600 text-white text-center font-black text-[14px] uppercase tracking-widest shadow-[0_8px_25px_rgba(37,99,235,0.3)]">
                開始遊戲
              </div>
            </div>
          </button>

          {/* C2. AI 模式 (綠色系) */}
          <button
            onClick={() => onSelect('ai')}
            className="w-full group relative text-left outline-none transition-all active:scale-95 active:rotate-[-1deg]"
          >
            <div className="relative w-full rounded-[32px] border border-emerald-500/20 bg-gradient-to-b from-[#064e3b]/30 to-[#01050a] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 blur-[40px] pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  <Sparkles size={22} className="text-[#10b981]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-wider">AI 模式</h3>
                  <p className="text-[8px] font-black italic text-emerald-500/60 uppercase">Infinite Adventure</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-xs font-medium leading-relaxed mb-5 px-1 line-clamp-2">
                由 LLM 生成隨機判決，支援自由陳述，打造專屬冒險。
              </p>
              
              <div className="w-full py-3.5 rounded-[18px] bg-emerald-600 text-[#022c22] text-center font-black text-[14px] uppercase tracking-widest shadow-[0_8px_25px_rgba(16,185,129,0.2)]">
                開始遊戲
              </div>
            </div>
          </button>

        </div>

        {/* 手機底部 Home Bar */}
        <div className="w-1/3 h-[5px] bg-white/10 rounded-full mt-2 mb-2 shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}
