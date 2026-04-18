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
  Clock,
  PenTool,
  Search,
  FileText
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

    // 裝飾物件浮現
    tl.fromTo(
      '.ending-prop',
      { scale: 0, opacity: 0, rotate: -30 },
      { scale: 1, opacity: 1, rotate: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' },
      "-=1"
    );

    // 按鈕浮現
    tl.fromTo(
      '.ending-btn',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, [endingResult]);

  if (!endingResult) return null;

  const isLimit = endingResult.type === 'limit';

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden"
    >
      {/* 偵探書桌背景 */}
      <div className="absolute inset-0 bg-[#0c0a09]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-amber-900/20" />
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-amber-500/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* 裝飾性背景紙張 (增加厚度感) */}
      <div className="absolute w-[480px] aspect-[3/4] bg-[#d6cab0] shadow-2xl rotate-[-3deg] -translate-x-2 -translate-y-2 rounded-sm border-l-8 border-black/5 opacity-80" />
      <div className="absolute w-[490px] aspect-[3/4] bg-[#decfae] shadow-xl rotate-[2deg] translate-x-3 translate-y-1 rounded-sm border-l-8 border-black/5 opacity-60" />

      {/* 主體案卷 (Dossier) */}
      <div 
        ref={dossierRef}
        className="relative w-[90%] max-w-[500px] aspect-[3/4] bg-[#e8dcc4] shadow-[20px_40px_100px_rgba(0,0,0,1),inset_0_0_100px_rgba(0,0,0,0.1)] p-8 sm:p-12 flex flex-col items-center border-l-[15px] border-[#c4a484] rounded-r-sm"
      >
        {/* 羊皮紙紋理與更明顯的污漬 */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] opacity-40 pointer-events-none" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-amber-900/10 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-40 h-20 bg-black/10 blur-xl rotate-12 pointer-events-none" />
        {/* 咖啡漬 */}
        <div className="absolute top-1/4 right-8 w-16 h-16 border-4 border-amber-900/10 rounded-full blur-[1px] opacity-30 rotate-12" />

        {/* 頂部標識 */}
        <div className="w-full flex justify-between items-start mb-8 border-b-2 border-black/10 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-[11px] font-black text-black/40 uppercase tracking-[0.4em]">
              絕密調查案卷
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-black/60 italic mt-1 font-serif">
              案件編號: {endingResult.playerId.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <FileText className="w-5 h-5 text-black/30" />
        </div>

        {/* 結局頭像區域 */}
        <div className="flex flex-col items-center mb-8 w-full">
          {isLimit ? (
            /* 集體頭像 (創業夢碎) */
            <div className="flex -space-x-4 mb-6 ending-text">
              {players.map((p, i) => (
                <div 
                  key={p.id}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#e8dcc4] overflow-hidden shadow-xl grayscale hover:grayscale-0 transition-all duration-500 relative"
                  style={{ zIndex: players.length - i }}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${p.name}`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ))}
            </div>
          ) : (
            /* 單一頭像 (個人成就/失敗) */
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[6px] border-black/10 overflow-hidden mb-6 shadow-2xl grayscale focus-within:grayscale-0 transition-all duration-700">
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player?.name || 'Player'}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
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
                label: isFake ? '偽善者' : '神格化' 
              },
              tycoon: { 
                color: 'text-slate-900', 
                border: 'border-slate-900/60', 
                icon: Pyramid, 
                label: '絕對支配' 
              },
              dragonhead: { 
                color: 'text-blue-900', 
                border: 'border-blue-900/60', 
                icon: Star, 
                label: '正式核准' 
              },
              arrested: { 
                color: 'text-rose-950', 
                border: 'border-rose-950/70', 
                icon: Gavel, 
                label: '有罪判定' 
              },
              bankrupt: { 
                color: 'text-stone-700', 
                border: 'border-stone-700/60', 
                icon: CircleSlash, 
                label: '全盤否決' 
              },
              limit: { 
                color: 'text-slate-500', 
                border: 'border-slate-500/50', 
                icon: Clock, 
                label: '時效終止' 
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

      {/* 環境裝飾物件 (福爾摩斯書桌) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 老式鋼筆 */}
        <div className="ending-prop absolute bottom-[15%] left-[10%] sm:left-[20%] -rotate-[35deg] drop-shadow-[10px_10px_15px_rgba(0,0,0,0.8)]">
          <div className="relative">
            <div className="w-1.5 h-48 bg-gradient-to-b from-[#1a1a1a] via-[#333] to-[#1a1a1a] rounded-full" />
            <PenTool className="absolute -top-4 -left-3 w-8 h-8 text-amber-600/80 rotate-[15deg]" />
          </div>
        </div>

        {/* 放大鏡 */}
        <div className="ending-prop absolute top-[20%] right-[5%] sm:right-[15%] rotate-[25deg] drop-shadow-[15px_15px_20px_rgba(0,0,0,0.9)]">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-[10px] border-[#c4a484] rounded-full bg-white/5 backdrop-blur-[2px] shadow-inner" />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-3 h-20 bg-gradient-to-b from-[#c4a484] to-[#8b4513] rounded-b-lg shadow-lg" />
            <Search className="absolute w-12 h-12 text-white/5" />
          </div>
        </div>

        {/* 散落的證言紙張 */}
        <div className="ending-prop absolute bottom-10 right-[10%] rotate-3 opacity-20 hidden md:block">
          <div className="w-32 h-44 bg-white/50 border border-black/10 shadow-lg p-4 flex flex-col space-y-2">
            <div className="w-full h-1 bg-black/20" />
            <div className="w-2/3 h-1 bg-black/20" />
            <div className="w-full h-1 bg-black/20" />
          </div>
        </div>
      </div>

      {/* 底部裝飾 */}
      <div className="absolute bottom-8 text-[10px] font-serif text-white/10 uppercase tracking-[1em] pointer-events-none">
        反重力數據系統 // 程序已終止 // 繼承人選拔結束
      </div>
    </div>
  );
}
