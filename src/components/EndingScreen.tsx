'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { EndingType } from '@/types/game';
import gsap from 'gsap';
import { 
  History, 
  Banknote, 
  Star, 
  AlertOctagon, 
  Crown, 
  Skull,
  RotateCcw,
  FileSearch,
  ShieldAlert,
  Pyramid,
  Gavel,
  CircleSlash,
  Clock
} from 'lucide-react';

export default function EndingScreen() {
  const { endingResult, resetGame, players, currentPlayerIndex } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLDivElement>(null);
  
  const player = players[currentPlayerIndex];

  useEffect(() => {
    if (!endingResult) return;

    const tl = gsap.timeline();
    
    // 背景與案卷劃入動畫
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1 })
      .fromTo(
        dossierRef.current, 
        { y: 600, rotation: -5, scale: 0.8, opacity: 0 }, 
        { y: 0, rotation: 1, scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.2)' },
        "-=0.5"
      );
      
    // 文字逐行浮現
    tl.fromTo(
      '.ending-text',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.2, ease: 'power2.out' }
    );
    
    // 印章蓋下動畫
    tl.fromTo(
      '.ending-stamp',
      { scale: 3, opacity: 0, rotation: 45 },
      { scale: 1, opacity: 1, rotation: -15, duration: 0.4, ease: 'bounce.out' },
      "+=0.3"
    );

    // 按鈕浮現
    tl.fromTo(
      '.ending-btn',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, [endingResult]);

  if (!endingResult) return null;

  const isVictory = ['saint', 'tycoon', 'dragonhead'].includes(endingResult.type);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden"
    >
      {/* 偵探書桌背景 */}
      <div className="absolute inset-0 bg-[#0c0a09]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-amber-900/10" />
        {/* 檯燈光源效果 */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[120px] rounded-full" />
      </div>

      {/* 主體案卷 (Dossier) */}
      <div 
        ref={dossierRef}
        className="relative w-[90%] max-w-[500px] aspect-[3/4] bg-[#e8dcc4] shadow-[20px_40px_80px_rgba(0,0,0,0.9),inset_0_0_100px_rgba(0,0,0,0.1)] p-8 sm:p-12 flex flex-col items-center border-l-[15px] border-[#c4a484] rounded-r-lg"
      >
        {/* 羊皮紙紋理與污漬 */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-40 pointer-events-none" />
        <div className="absolute top-10 right-10 w-24 h-24 bg-amber-900/5 blur-xl rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-32 h-12 bg-black/5 blur-lg rotate-12 pointer-events-none" />

        {/* 頂部標識 */}
        <div className="w-full flex justify-between items-start mb-12 border-b-2 border-black/10 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.3em]">
              Confidential Dossier
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-black/60 italic">
              Case Ref: {endingResult.playerId.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <FileSearch className="w-6 h-6 text-black/20" />
        </div>

        {/* 結局標題與人物 */}
        <div className="flex flex-col items-center mb-8 w-full">
          <div className="w-20 h-20 rounded-full border-4 border-black/10 overflow-hidden mb-6 shadow-lg grayscale focus-within:grayscale-0 transition-all duration-700">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player?.name || 'Player'}`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          
          <h2 className="ending-text text-3xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight mb-2 text-center drop-shadow-sm">
            {endingResult.title}
          </h2>
          <div className="ending-text flex items-center bg-black/5 px-4 py-1 rounded-full border border-black/10">
            <span className="text-[10px] sm:text-xs font-black text-black/60 tracking-widest uppercase">
              {endingResult.evaluation}
            </span>
          </div>
        </div>

        {/* 敘事描述 */}
        <div className="ending-text flex-1 w-full mb-8 relative">
          <p className="text-sm sm:text-base font-serif italic text-black/80 leading-relaxed text-center px-4">
            「 {endingResult.description} 」
          </p>
        </div>

        {/* 數據統計區 */}
        <div className="ending-text w-full grid grid-cols-2 gap-4 mb-10">
          <div className="flex flex-col items-center p-3 bg-black/5 rounded-xl border border-black/10">
            <Banknote className="w-4 h-4 text-emerald-700 mb-1" />
            <span className="text-[8px] font-black text-black/40 uppercase">總資產結算</span>
            <span className="text-sm font-black text-black">{endingResult.stats.totalProfit} 萬</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-black/5 rounded-xl border border-black/10">
            <Star className="text-amber-700 w-4 h-4 mb-1" />
            <span className="text-[8px] font-black text-black/40 uppercase">最終信用</span>
            <span className="text-sm font-black text-black">{endingResult.stats.finalRp} RP</span>
          </div>
          <div className="col-span-2 flex flex-col items-center p-2 bg-black/5 rounded-xl border border-black/10">
            <span className="text-[8px] font-black text-black/40 uppercase">法治代價累計 (罰金)</span>
            <span className="text-sm font-black text-red-800">{endingResult.stats.totalFines} 萬</span>
          </div>
        </div>

        {/* 印章層 */}
        <div className="absolute right-6 bottom-32 sm:right-12 sm:bottom-40 pointer-events-none">
          {(() => {
            const isFake = endingResult.title.includes('偽');
            
            const stampConfig: Record<string, { color: string, border: string, icon: any, label: string }> = {
              saint: { 
                color: isFake ? 'text-amber-900/40' : 'text-amber-600', 
                border: isFake ? 'border-amber-950/30' : 'border-amber-600/60',
                icon: isFake ? ShieldAlert : Crown, 
                label: isFake ? 'MASKED' : 'DIVINE' 
              },
              tycoon: { 
                color: 'text-slate-900', 
                border: 'border-slate-900/60', 
                icon: Pyramid, 
                label: 'DOMINATED' 
              },
              dragonhead: { 
                color: 'text-blue-900', 
                border: 'border-blue-900/60', 
                icon: Star, 
                label: 'APPROVED' 
              },
              arrested: { 
                color: 'text-rose-950', 
                border: 'border-rose-950/70', 
                icon: Gavel, 
                label: 'GUILTY' 
              },
              bankrupt: { 
                color: 'text-stone-700', 
                border: 'border-stone-700/60', 
                icon: CircleSlash, 
                label: 'REJECTED' 
              },
              limit: { 
                color: 'text-slate-500', 
                border: 'border-slate-500/50', 
                icon: Clock, 
                label: 'EXPIRED' 
              }
            };

            const config = stampConfig[endingResult.type] || stampConfig.limit;
            const Icon = config.icon;

            return (
              <div className={`ending-stamp w-24 h-24 sm:w-32 sm:h-32 border-8 ${config.border} rounded-full flex items-center justify-center -rotate-12`}>
                <div className={`flex flex-col items-center ${config.color} font-black`}>
                  <Icon size={32} />
                  <span className="text-sm sm:text-base tracking-widest uppercase">{config.label}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 按鈕區域 */}
        <button 
          onClick={resetGame}
          className="ending-btn mt-auto w-full group relative flex items-center justify-center p-4 bg-[#1a1a1a] hover:bg-black text-[#e8dcc4] rounded-xl transition-all active:scale-95 shadow-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <RotateCcw className="w-5 h-5 mr-3 group-hover:rotate-[-180deg] transition-transform duration-500" />
          <span className="font-black tracking-[0.4em] uppercase text-xs sm:text-sm">歸檔並重啟人生</span>
        </button>
      </div>

      {/* 底部裝飾 */}
      <div className="absolute bottom-8 text-[10px] font-serif text-white/10 uppercase tracking-[1em] pointer-events-none">
        Antigravity // System Terminated // Successor Selection Over
      </div>
    </div>
  );
}
