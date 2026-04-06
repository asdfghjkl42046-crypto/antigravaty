'use client';

import { Scale, Network, Sparkles } from 'lucide-react';
import type { JudgeMode } from '@/types/game';

interface ModeSelectScreenProps {
  onSelect: (mode: JudgeMode) => void;
}

/**
 * 遊戲模式選擇畫面 (APP 風格 19.5:9 比例重構版)
 */
export default function ModeSelectScreen({ onSelect }: ModeSelectScreenProps) {
  return (
    // 外層容器：確保置中並提供適當留白
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#0d1117] select-none">
      
      {/* 嚴格限制的 19.5:9 手機比例框 */}
      <div className="relative w-full max-w-[390px] h-[844px] max-h-[90vh] bg-[#030612] rounded-[48px] border-[6px] border-[#0a1128] overflow-hidden flex flex-col items-center px-6 py-10 shadow-2xl shrink-0">
        
        {/* 背景粒子效果與漸層 */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

        {/* 頂部：擬真 3D App Icon */}
        <div className="mt-4 relative group shrink-0">
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full pointer-events-none" />
          <div className="w-[120px] h-[120px] bg-gradient-to-b from-[#eef6ff] to-[#a0c4e8] p-[3px] rounded-[32px] shadow-[0_0_40px_rgba(59,130,246,0.3)] relative z-10 overflow-hidden shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-[#06113b] to-[#020516] rounded-[28px] flex flex-col items-center justify-center relative overflow-hidden">
               {/* 內部藍色光暈 */}
               <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-blue-400/30 blur-2xl rounded-full" />
               <div className="absolute bottom-[-10%] inset-x-0 h-1/2 bg-blue-600/30 blur-xl" />
               {/* 內發光邊框 */}
               <div className="absolute inset-2 border border-blue-400/40 rounded-[20px] pointer-events-none" />
               
               {/* 核心天平 */}
               <Scale size={46} strokeWidth={1.5} className="text-blue-100 drop-shadow-[0_0_12px_rgba(96,165,250,1)] z-10 mb-1.5" />
               <span className="text-[8px] font-black tracking-widest text-blue-100 z-10 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]">ANTIGRAVITY</span>
            </div>
          </div>
        </div>

        {/* 標題區 */}
        <div className="mt-8 flex flex-col items-center gap-1 mb-8 text-center shrink-0">
          <span className="text-[10px] font-black tracking-[0.4em] text-[#3b5b9e] uppercase mb-2">Antigravity Terminal</span>
          <h1 className="text-[34px] leading-[1.1] font-black text-slate-100 tracking-widest">
            創業冒險<br />現代法律篇
          </h1>
        </div>

        {/* 模式選單 */}
        <div className="w-full flex-1 flex flex-col gap-5 min-h-0 justify-start">
          
          {/* 網站模式卡片 (穩定體驗) */}
          <button
            onClick={() => onSelect('website')}
            className="w-full group relative text-left"
          >
            <div className="absolute inset-0 bg-[#2563eb]/10 rounded-[32px] blur-xl transition-opacity group-hover:bg-[#2563eb]/20 pointer-events-none" />
            <div className="relative w-full rounded-[30px] border border-[#2a3c68] bg-gradient-to-b from-[#101d3f] to-[#0c1328] p-5 sm:p-6 shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                  <Network size={22} className="text-[#60a5fa] drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[22px] font-black text-slate-100 tracking-wider">網站模式</h3>
                  <p className="text-[10px] font-black tracking-widest text-[#4f6ea2] uppercase mt-0.5 truncate">Stable Experience</p>
                </div>
              </div>
              <p className="text-[#8ba2cb] text-xs font-medium leading-[1.6] mb-5 sm:mb-6">
                使用固定戲劇性文案模板，無需等待 AI 生成，享受極速判決體驗。
              </p>
              <div className="w-full py-3.5 sm:py-4 rounded-[18px] bg-[#3b82f6] text-white text-center font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(59,130,246,0.3)] group-hover:bg-blue-500 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                開始遊戲
              </div>
            </div>
          </button>

          {/* AI模式卡片 (無限冒險) */}
          <button
            onClick={() => onSelect('ai')}
            className="w-full group relative text-left"
          >
            <div className="absolute inset-0 bg-emerald-500/10 rounded-[32px] blur-xl transition-opacity group-hover:bg-emerald-500/20 pointer-events-none" />
            <div className="relative w-full rounded-[30px] border border-[#1b4438] bg-gradient-to-b from-[#073627] to-[#041913] p-5 sm:p-6 shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  <Sparkles size={22} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[22px] font-black text-slate-100 tracking-wider">AI 模式</h3>
                  <p className="text-[10px] font-black tracking-widest text-[#3b8469] uppercase mt-0.5 truncate">Infinite Adventure</p>
                </div>
              </div>
              <p className="text-[#6fa894] text-xs font-medium leading-[1.6] mb-5 sm:mb-6">
                由 LLM 生成無限變化的判決，支援自由文字陳述，打造專屬你的冒險。
              </p>
              <div className="w-full py-3.5 sm:py-4 rounded-[18px] bg-[#22c55e] text-[#022c22] text-center font-black text-sm uppercase tracking-widest shadow-[0_4px_20px_rgba(34,197,94,0.3)] group-hover:bg-emerald-400 transition-colors relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                開始遊戲
              </div>
            </div>
          </button>

        </div>
        
        {/* 手機底部的休眠指示條 (Home Bar) */}
        <div className="w-1/3 h-1 bg-white/10 rounded-full mt-auto mb-2 shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}
