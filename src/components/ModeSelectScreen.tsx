'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Network, Sparkles, Settings2, Eye, CircleDashed } from 'lucide-react';
import gsap from 'gsap';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

interface ModeSelectScreenProps {
  onStartGame: (mode: 'website' | 'ai') => void;
}

export default function ModeSelectScreen({ onStartGame }: ModeSelectScreenProps) {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 根據使用者最新手動調校後的佈局數據更新預設值 (微調高度以適配內容)
  const [layout, setLayout] = useState<Record<string, AlignmentElement>>({
    website: { 
      top: 0.6, 
      left: 17, 
      width: 66, 
      height: 48, 
      radius: 23 
    },
    ai: { 
      top: 50.137381503841134, 
      left: 17, 
      width: 66, 
      height: 48, 
      radius: 23 
    },
  });

  useEffect(() => {
    if (containerRef.current && !isDesignMode) {
      gsap.fromTo(
        '.ui-animate',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power4.out' }
      );
    }
  }, [isDesignMode]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#020617]">
      <div 
        ref={containerRef} 
        className="relative h-full max-h-[92dvh] w-full max-w-[420px] select-none text-white overflow-hidden flex flex-col items-center"
      >
        {/* 設計模式按鈕 */}
        <button 
          onClick={() => setIsDesignMode(!isDesignMode)}
          className="fixed top-20 right-4 z-[2000] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
          title="切換排版模式"
        >
          {isDesignMode ? <Eye className="w-5 h-5 text-emerald-400" /> : <Settings2 className="w-5 h-5" />}
        </button>

        {/* 底層參考圖 (設計模式) */}
        {isDesignMode && (
          <img 
            src="/ui/ref_mode_select.png" 
            alt="Reference" 
            className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none z-0"
          />
        )}

        {/* 背景：數位網格與強化漸層 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#020617]" />
          <div 
            className="absolute inset-0 opacity-[0.15]" 
            style={{ 
              backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(30,58,138,0.3)_0%,transparent_70%)]" />
        </div>

        {/* 頂部 Logo 區：向上移動騰出空間 */}
        <div className="mt-6 relative z-10 ui-animate">
          <div className="w-24 aspect-square rounded-[28px] bg-white p-[3px] shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <div className="w-full h-full rounded-[25px] overflow-hidden bg-black flex items-center justify-center border border-slate-200/50">
              <video
                src="/assets/logo_anim.mp4"
                autoPlay loop muted playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 標題區：縮減間距 */}
        <div className="mt-4 text-center ui-animate relative z-10">
          <p className="text-[#3b82f6] text-[9px] font-bold tracking-[0.4em] uppercase opacity-80 mb-2">ANTIGRAVITY TERMINAL</p>
          <h1 className="text-4xl font-black tracking-tight text-white leading-tight">創業冒險</h1>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#93c5fd] to-[#3b82f6] tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] leading-tight">現代法律篇</h2>
        </div>

        {/* 模式選取卡片列表 (絕對定位渲染區) */}
        <div className="relative w-full flex-grow mt-2">
          
          {/* 排版工具 */}
          {isDesignMode && (
            <AlignmentTool 
              containerRef={containerRef}
              initialElements={layout}
              onUpdate={setLayout}
              renderElement={(id, el) => (
                <div 
                  className={`w-full h-full border-2 border-white/50 flex flex-col items-center justify-center font-black text-xs
                    ${id === 'website' ? 'bg-blue-600/20' : 'bg-emerald-600/20'}
                  `}
                  style={{ borderRadius: `${el.radius}px` }}
                >
                  <p className="uppercase">{id}</p>
                  <p className="text-[8px] opacity-60">EDIT MODE</p>
                </div>
              )}
            />
          )}

          {/* 正常渲染區：完美還原原圖細節 */}
          {!isDesignMode && (
            <div className="absolute inset-0">
               {/* 網站模式卡片 */}
               <div 
                className="ui-animate group absolute bg-[#0f172a]/95 border border-blue-500/40 p-6 flex flex-col transition-all overflow-hidden shadow-[inset_0_0_30px_rgba(59,130,246,0.1)]"
                style={{ 
                  top: `${layout.website.top}%`, 
                  left: `${layout.website.left}%`,
                  width: `${layout.website.width}%`,
                  height: `${layout.website.height}%`,
                  borderRadius: `${layout.website.radius}px`
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)] shrink-0">
                    <Network className="w-7 h-7 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white leading-none">網站模式</h3>
                    <p className="text-[10px] font-bold text-blue-400/80 tracking-widest mt-2 uppercase">Stable Experience</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400/90 leading-relaxed mt-3">
                  使用固定戲劇性文案模板，無需等待 AI 生成，享受極速判決體驗。
                </p>

                <button 
                  onClick={() => onStartGame('website')}
                  className="mt-6 w-full h-12 rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white text-xs font-black tracking-widest shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <span>開始遊戲</span>
                </button>
              </div>

              {/* AI 輔助模式卡片 */}
              <div 
                className="ui-animate group absolute bg-[#061a1a]/95 border border-emerald-500/40 p-6 flex flex-col transition-all overflow-hidden shadow-[inset_0_0_30px_rgba(16,185,129,0.1)]"
                style={{ 
                  top: `${layout.ai.top}%`, 
                  left: `${layout.ai.left}%`,
                  width: `${layout.ai.width}%`,
                  height: `${layout.ai.height}%`,
                  borderRadius: `${layout.ai.radius}px`
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0">
                    <Sparkles className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white leading-none">AI 模式</h3>
                    <p className="text-[10px] font-bold text-emerald-400/80 tracking-widest mt-2 uppercase">Infinite Adventure</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-400/90 leading-relaxed mt-3">
                  由 LLM 生成無限變化的判決，支援自由文字陳述，打造專屬你的冒險。
                </p>

                <button 
                  onClick={() => onStartGame('ai')}
                  className="mt-6 w-full h-12 rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] text-white text-xs font-black tracking-widest shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <span>開始遊戲</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
