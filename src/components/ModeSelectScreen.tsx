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
      
      <div className="w-full h-full flex flex-col items-center px-8 py-8 animate-in fade-in duration-1000 relative">
        
        {/* 1. 頂部 Logo (加大比例) */}
        <div className="mt-6 mb-6 flex flex-col items-center">
            <div className="w-48 h-48 relative">
              {/* Logo 發光背景 */}
              <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full animate-pulse" />
              <GlowLogo />
            </div>
        </div>

        {/* 2. 標題區 (緊湊排版) */}
        <div className="text-center mb-10 flex flex-col items-center gap-1">
          <span className="text-[11px] font-black tracking-[0.4em] text-blue-400/70 uppercase">
            Antigravity Terminal
          </span>
          <h1 className="text-[40px] leading-tight font-black text-white tracking-widest drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
            創業冒險
          </h1>
          <h2 className="text-[28px] font-black text-blue-200/90 tracking-widest mt-[-4px]">
            現代法律篇
          </h2>
        </div>

        {/* 3. 模式選單卡片 (垂直堆疊) */}
        <div className="w-full h-full flex-1 flex flex-col gap-6 justify-center">
          
          {/* C1. 網站模式 (藍色系) */}
          <button
            onClick={() => onSelect('website')}
            className="w-full group relative text-left outline-none transition-all active:scale-95"
          >
            {/* 卡片本體 */}
            <div className="relative w-full rounded-[40px] border border-white/10 bg-gradient-to-b from-[#111c3a] to-[#01050a] p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* 背景內部裝飾氛圍 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[60px] pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                  <Network size={32} className="text-[#3b82f6] drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-wider">網站模式</h3>
                  <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest">Stable Experience</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-[13px] font-medium leading-relaxed mb-8 px-1">
                使用固定動態文案模板，無需等待 AI，享受極速判決體驗。
              </p>
              
              {/* 按鈕：鮮豔藍色 */}
              <div className="w-full py-5 rounded-full bg-blue-600 text-white text-center font-black text-[16px] uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(37,99,235,0.4)] group-hover:bg-blue-500 transition-all flex items-center justify-center relative overflow-hidden">
                開始遊戲
              </div>
            </div>
          </button>

          {/* C2. AI 模式 (綠色系) */}
          <button
            onClick={() => onSelect('ai')}
            className="w-full group relative text-left outline-none transition-all active:scale-95"
          >
            <div className="relative w-full rounded-[40px] border border-white/10 bg-gradient-to-b from-[#063e2a] to-[#01050a] p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/10 blur-[60px] pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  <Sparkles size={32} className="text-[#10b981] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-wider">AI 模式</h3>
                  <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">Infinite Adventure</p>
                </div>
              </div>
              
              <p className="text-slate-400 text-[13px] font-medium leading-relaxed mb-8 px-1">
                由 LLM 生成無限變化的判決，支援自由文字陳述，打造專屬冒險。
              </p>
              
              {/* 按鈕：鮮豔綠色 */}
              <div className="w-full py-5 rounded-full bg-[#10b981] text-[#022c22] text-center font-black text-[16px] uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(16,185,129,0.3)] group-hover:bg-[#15d191] transition-all flex items-center justify-center relative overflow-hidden">
                開始遊戲
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 手機底部 Home Bar */}
      <div className="w-1/3 h-[5px] bg-white/10 rounded-full mt-2 mb-2 shrink-0 pointer-events-none" />
    </div>
  );
}
