'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore, MASTERPIECES } from '@/store/gameStore';
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
    
    // 印章蓋下動畫 (強力落印 + 畫面震動)
    tl.fromTo(
      '.ending-stamp',
      { scale: 5, opacity: 0, rotation: 45 },
      { 
        scale: 1, 
        opacity: 1, 
        rotation: -15, 
        duration: 0.3, 
        ease: 'power4.in',
        onComplete: () => {
          // 落印瞬間地震效果 (Dossier 微震)
          gsap.to(dossierRef.current, {
            x: '+=3',
            y: '+=3',
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            ease: 'none'
          });
        }
      },
      "+=0.3"
    );

    // 落地回彈 (微小回震)
    tl.to('.ending-stamp', {
      scale: 1.05,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    });

    // 裝飾物件浮現 (明確指定結束旋轉角度以避免衝突)
    tl.fromTo(
      '.ending-prop',
      { scale: 0, opacity: 0, rotation: -30 },
      { scale: 1, opacity: 1, rotation: -45, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' },
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
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#e8dcc4] overflow-hidden shadow-xl hover:scale-110 transition-all duration-500 relative"
                  style={{ zIndex: players.length - i }}
                >
                  <img
                    src={MASTERPIECES[p.avatarId]?.url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${p.name}`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
              ))}
            </div>
          ) : (
            /* 單一頭像 (個人成就/失敗) */
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[6px] border-black/10 overflow-hidden mb-6 shadow-2xl focus-within:scale-105 transition-all duration-700">
              <img
                src={MASTERPIECES[player?.avatarId]?.url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${player?.name || 'Player'}`}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
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

        {/* 頂級火漆印章 (Premium Wax Seal) */}
        <div className="absolute right-0 bottom-24 sm:right-2 sm:bottom-28 pointer-events-none select-none z-10">
          {(() => {
            const isFake = endingResult.title.includes('偽');
            
            const stampConfig: Record<string, { 
              baseColor: string, 
              innerColor: string, 
              label: string, 
              icon: any 
            }> = {
              saint: { 
                baseColor: isFake ? '#5c4d37' : '#d4af37', 
                innerColor: isFake ? '#3a3124' : '#fcf6ba',
                icon: isFake ? ShieldAlert : Crown, 
                label: isFake ? '偽善者' : '神格化' 
              },
              tycoon: { 
                baseColor: '#0f172a', 
                innerColor: '#475569', 
                icon: Pyramid, 
                label: '絕對支配' 
              },
              dragonhead: { 
                baseColor: '#1e3a8a', 
                innerColor: '#60a5fa', 
                icon: Star, 
                label: '正式核准' 
              },
              arrested: { 
                baseColor: '#4c0519', 
                innerColor: '#be123c', 
                icon: Gavel, 
                label: '有罪判定' 
              },
              bankrupt: { 
                baseColor: '#444', 
                innerColor: '#888', 
                icon: CircleSlash, 
                label: '全盤否決' 
              },
              limit: { 
                baseColor: '#2d2d2d', 
                innerColor: '#555', 
                icon: Clock, 
                label: '時效終止' 
              }
            };

            const config = stampConfig[endingResult.type] || stampConfig.limit;
            const Icon = config.icon;

            return (
              <div 
                className="ending-stamp relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                style={{ transform: 'rotate(-15deg)' }}
              >
                {/* 火漆外圈隆起邊緣 (不規則圓形) */}
                <div 
                  className="absolute inset-0 rounded-[45%_55%_50%_50%] opacity-90 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.3),inset_5px_5px_15px_rgba(255,255,255,0.1)]"
                  style={{ backgroundColor: config.baseColor }}
                />
                
                {/* 火漆中心壓印區域 */}
                <div 
                  className="absolute w-[80%] h-[80%] rounded-[50%] shadow-[inset_5px_5px_10px_rgba(0,0,0,0.6),inset_-2px_-2px_8px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center p-2"
                  style={{ backgroundColor: config.baseColor }}
                >
                  <div className="flex flex-col items-center" style={{ color: config.innerColor }}>
                    <Icon size={34} strokeWidth={2.5} className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-0.5" />
                    <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-center leading-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* 微弱高光塗抹層 (模擬光澤) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-full pointer-events-none" />
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

        {/* 復古放大鏡 */}
        <div 
          className="ending-prop absolute top-[15%] right-[2%] sm:right-[10%] drop-shadow-[25px_15px_35px_rgba(0,0,0,0.9)]"
          style={{ transform: 'rotate(-45deg)' }}
        >
          <div className="relative flex flex-col items-center">
            {/* 鏡框與鏡片 */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 border-[8px] border-gradient-to-br from-[#d4af37] via-[#c4a484] to-[#8b4513] border-[#c4a484] rounded-full bg-white/10 backdrop-blur-[3px] shadow-[inset_0_0_20px_rgba(255,255,255,0.2),0_5px_15px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-full h-full bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-40" />
              <Search className="absolute inset-0 m-auto w-12 h-12 text-white/5" />
            </div>

            {/* 金屬頸部 (連接鏡框與手把) */}
            <div className="w-4 h-4 bg-gradient-to-r from-[#8b4513] via-[#c4a484] to-[#8b4513] -mt-1 shadow-md z-10" />

            {/* 復古流線木質手把 */}
            <div 
              className="w-5 h-24 bg-gradient-to-b from-[#3a1d0a] via-[#5d2e13] to-[#2a1408] rounded-[50%_50%_40%_40%] shadow-[inset_2px_0_5px_rgba(255,255,255,0.1),2px_5px_10px_rgba(0,0,0,0.6)]"
              style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 90% 80%, 100% 95%, 80% 100%, 20% 100%, 0% 95%, 10% 80%, 0% 20%)' }}
            />
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
