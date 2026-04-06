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
      
      <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] bg-black shadow-[0_0_100px_rgba(0,0,0,0.8)] border-x border-white/5 flex flex-col items-center px-8 py-8 animate-in fade-in duration-1000">
        
        {/* 頂部發光氛圍 */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-blue-950/10 to-transparent pointer-events-none" />

        {/* 內部元件垂直排列 */}
        
        {/* A. 圓形 Logo */}
        <div className="mt-8 mb-8 flex flex-col items-center">
            <GlowLogo />
        </div>

        {/* B. 文字標題區 */}
        <div className="text-center mb-10 flex flex-col items-center gap-1.5 px-4">
          <span className="text-[11px] font-black tracking-[0.4em] text-blue-500/80 uppercase">
            Antigravity Terminal
          </span>
          <h1 className="text-[38px] leading-tight font-black text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            創業冒險
          </h1>
          <h2 className="text-[28px] font-medium text-blue-100/70 tracking-widest mt-[-2px]">
            現代法律篇
          </h2>
        </div>

        {/* C. 模式選單卡片 (垂直堆疊) */}
        <div className="w-full flex-1 flex flex-col gap-6 overflow-hidden">
          
          {/* C1. 網站模式 (藍色系) */}
          <button
            onClick={() => onSelect('website')}
            className="w-full group relative text-left outline-none transition-all active:scale-95 active:rotate-[1deg]"
          >
            {/* 卡片本體 */}
            <div className="relative w-full rounded-[40px] border border-blue-500/20 bg-gradient-to-b from-[#0f172a] to-[#01050a] p-7 shadow-[0_20px_50px_rgba(0,0,0,1)] overflow-hidden">
              {/* 背景內部發光 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[50px] pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                  <Network size={26} className="text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-wider">網站模式</h3>
                  <p className="text-[10px] font-black tracking-widest text-blue-500/60 uppercase mt-0.5">Stable Experience</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-[13px] font-medium leading-relaxed mb-8 px-1">
                使用固定戲劇性文案模板，無需等待 AI 生成，享受極速判決體驗。
              </p>
              
              {/* 按鈕：藍色發光質感 */}
              <div className="w-full py-4.5 rounded-[22px] bg-blue-600 text-white text-center font-black text-[15px] uppercase tracking-widest shadow-[0_10px_35px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
                開始遊戲 <ChevronRight size={18} strokeWidth={3} />
              </div>
            </div>
          </button>

          {/* C2. AI 模式 (綠色系) */}
          <button
            onClick={() => onSelect('ai')}
            className="w-full group relative text-left outline-none transition-all active:scale-95 active:rotate-[-1deg]"
          >
            <div className="relative w-full rounded-[40px] border border-emerald-500/20 bg-gradient-to-b from-[#064e3b]/30 to-[#01050a] p-7 shadow-[0_20px_50px_rgba(0,0,0,1)] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 blur-[50px] pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  <Sparkles size={26} className="text-[#10b981] drop-shadow-[0_0_100px_rgba(16,185,129,0.2)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-wider">AI 模式</h3>
                  <p className="text-[10px] font-black tracking-widest text-emerald-500/60 uppercase mt-0.5">Infinite Adventure</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-[13px] font-medium leading-relaxed mb-8 px-1">
                由 LLM 生成無限變化的判決，支援自由文字陳述，打造專屬您的冒險。
              </p>
              
              {/* 按鈕：綠色發光質感 */}
              <div className="w-full py-4.5 rounded-[22px] bg-[#10b981] text-[#022c22] text-center font-black text-[15px] uppercase tracking-widest shadow-[0_10px_35px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                開始遊戲 <ChevronRight size={18} strokeWidth={4} />
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
