'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { gsap } from 'gsap';
import { 
  Gavel, 
  MessageSquare, 
  ShieldAlert, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  User, 
  Scale,
  DollarSign,
  TrendingDown,
  Lock,
  RotateCcw
} from 'lucide-react';
import { TrialStage } from '../types/game';

/**
 * CourtroomScreen - 沉浸式法庭介面
 * 
 * 核心規範：
 * 1. 無滾輪設計：所有長篇文案皆透過 3D 翻頁組件展示。
 * 2. 神祕剪影：法官以黑色剪影呈現。
 * 3. 網站模式優先：僅支援單一法官風格。
 */

// 分頁組件：處理長文案的 3D 翻頁
const PaperFlip: React.FC<{ 
  text: string; 
  onComplete?: () => void;
  title?: string;
}> = ({ text, onComplete, title }) => {
  // 將長文案按段落初步分頁（實際開發中可依長度更精細處理）
  const pages = useMemo(() => {
    const rawPages = text.split('\n\n');
    return rawPages.filter(p => p.trim().length > 0);
  }, [text]);

  const [currentPage, setCurrentPage] = useState(0);
  const paperRef = useRef<HTMLDivElement>(null);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      // GSAP 翻頁動畫
      const tl = gsap.timeline();
      tl.to(paperRef.current, { 
        rotateY: -15, 
        x: -20, 
        duration: 0.2, 
        ease: 'power2.in' 
      });
      tl.to(paperRef.current, { 
        rotateY: -180, 
        x: -100, 
        opacity: 0, 
        duration: 0.3, 
        ease: 'power2.in',
        onComplete: () => {
          setCurrentPage(prev => prev + 1);
          gsap.set(paperRef.current, { rotateY: 180, x: 100, opacity: 0 });
          gsap.to(paperRef.current, { 
            rotateY: 0, 
            x: 0, 
            opacity: 1, 
            duration: 0.4, 
            ease: 'power2.out' 
          });
        }
      });
    } else if (onComplete) {
      onComplete();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      gsap.to(paperRef.current, { 
        rotateY: 180, 
        x: 100, 
        opacity: 0, 
        duration: 0.3, 
        onComplete: () => {
          setCurrentPage(prev => prev - 1);
          gsap.set(paperRef.current, { rotateY: -180, x: -100, opacity: 0 });
          gsap.to(paperRef.current, { 
            rotateY: 0, 
            x: 0, 
            opacity: 1, 
            duration: 0.4 
          });
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full perspective-2000">
      {/* 標題區 */}
      {title && (
        <div className="mb-4 border-l-4 border-yellow-500 pl-3">
          <h2 className="text-yellow-500 font-bold tracking-widest text-lg uppercase italic">{title}</h2>
        </div>
      )}

      {/* 內容區 - 模擬法卷紙張 */}
      <div className="relative flex-grow flex items-center justify-center py-4">
         <div 
           ref={paperRef}
           className="w-full h-full bg-slate-900/80 border border-slate-700/50 rounded-sm p-6 shadow-2xl relative overflow-hidden flex flex-col transform-style-3d"
         >
          {/* 紙張紋理效果 */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
          
          {/* 本文 */}
          <div className="flex-grow text-slate-100 text-lg leading-relaxed font-serif tracking-tight">
            {pages[currentPage]}
          </div>

          {/* 頁碼 */}
          <div className="mt-4 flex justify-between items-center text-slate-500 text-sm font-mono border-t border-slate-800 pt-2">
            <span>VOL. 390-844-LEGAL-NOIR</span>
            <span>PAGE {currentPage + 1} / {pages.length}</span>
          </div>
        </div>
      </div>

      {/* 控制區 - 固定在底部附近 */}
      <div className="flex gap-4 mt-auto pt-6">
        <button 
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`flex-1 py-4 flex items-center justify-center gap-2 border border-slate-700 bg-slate-900/50 transition-all ${currentPage === 0 ? 'opacity-10 grayscale' : 'hover:bg-slate-800 active:scale-95'}`}
        >
          <ChevronLeft size={20} className="text-slate-400" />
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Previous</span>
        </button>
        <button 
          onClick={nextPage}
          className="flex-[2] py-4 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 font-black tracking-[0.2em] shadow-[0_0_20px_rgba(250,204,21,0.1)]"
        >
          <span>{currentPage === pages.length - 1 ? 'PROCEED' : 'NEXT PAGE'}</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default function CourtroomScreen() {
  const { 
    trial, 
    players, 
    setTrialStage, 
    nextBystander, 
    addIntervention, 
    placeBet, 
    submitDefense, 
    resolveTrial,
    withdrawCase,
    extraordinaryAppeal 
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const judgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // 法官剪影呼吸效果
    if (judgeRef.current) {
      gsap.to(judgeRef.current, {
        scale: 1.02,
        opacity: 0.95,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, []);

  if (!mounted || !trial) return null;

  const defendant = players.find(p => p.id === trial.defendantId);
  const actingBystander = trial.bystanderIds[trial.actingBystanderIndex] 
    ? players.find(p => p.id === trial.bystanderIds[trial.actingBystanderIndex])
    : null;

  // --- 各階段渲染邏輯 ---

  // Stage 1: 起訴敘事
  const renderIndictment = () => (
    <div className="h-full">
      <PaperFlip 
        title="刑事起訴書"
        text={`${trial.narrative}\n\n${trial.question}`}
        onComplete={() => setTrialStage(2)}
      />
    </div>
  );

  // Stage 2: 旁聽干預
  const renderIntervention = () => {
    if (!actingBystander) return null;
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-black text-blue-400 uppercase tracking-widest italic">旁聽干預: {actingBystander.name}</h2>
        </div>
        
        <div className="flex-grow flex flex-col justify-center gap-6">
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => {
                addIntervention(actingBystander.id, 'SUPPORT');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="group relative overflow-hidden p-6 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/20 active:scale-95 transition-all flex justify-between items-center"
            >
              <span className="text-2xl font-black text-blue-400">🛡 支持被告</span>
              <span className="text-xl font-mono text-blue-400 opacity-50">+10%</span>
            </button>

            <button 
              onClick={() => {
                addIntervention(actingBystander.id, 'OPPOSE');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="group relative overflow-hidden p-6 border border-red-500/30 bg-red-500/5 hover:bg-red-500/20 active:scale-95 transition-all flex justify-between items-center"
            >
              <span className="text-2xl font-black text-red-400">⚔ 質疑被告</span>
              <span className="text-xl font-mono text-red-400 opacity-50">-10%</span>
            </button>

            <button 
              onClick={() => {
                addIntervention(actingBystander.id, 'ABSTAIN');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="py-6 border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all text-slate-500 font-bold uppercase tracking-widest text-sm"
            >
              ABSTAIN
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stage 3: 場外賭局
  const renderBetting = () => {
    if (!actingBystander) return null;
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-black text-green-400 uppercase tracking-widest italic">場外賭局: {actingBystander.name}</h2>
        </div>
        
        <div className="flex-grow flex flex-col justify-center gap-8">
          <div className="bg-slate-900 border-y border-slate-800 py-6 px-4 text-center">
            <div className="text-5xl font-black text-white glow-blue">
              {(trial.lawCase.survival_rate * 100).toFixed(0)}% 
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                placeBet(actingBystander.id, 'win');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="flex flex-col items-center justify-center gap-3 p-8 border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 active:scale-95 transition-all"
            >
              <span className="font-black text-xl text-green-400">勝訴</span>
            </button>

            <button 
              onClick={() => {
                placeBet(actingBystander.id, 'lose');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="flex flex-col items-center justify-center gap-3 p-8 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <span className="font-black text-xl text-red-400">敗訴</span>
            </button>
            
            <button 
              onClick={() => {
                placeBet(actingBystander.id, 'none');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="col-span-2 py-4 border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all text-slate-500 font-bold uppercase tracking-widest text-xs"
            >
              跳過
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stage 4: 被告辯護
  const renderDefense = () => {
    if (!defendant) return null;
    return (
      <div className="h-full flex flex-col">
        {/* 僅保留標誌性的階段指示與辯護人名稱 */}
        <div className="mb-8 flex items-center gap-3">
          <h2 className="text-xl font-black text-yellow-500 uppercase tracking-[0.1em] italic">
            被告答辯: {defendant.name}
          </h2>
        </div>

        <div className="flex-grow flex flex-col justify-center gap-4">
           <div className="space-y-4">
             {[
               { id: 'J', label: trial.lawCase.defense_j_text },
               { id: 'K', label: trial.lawCase.defense_k_text },
               { id: 'L', label: trial.lawCase.defense_l_text },
             ].map((opt) => (
               <button 
                 key={opt.id}
                 onClick={() => submitDefense(opt.id as any, opt.label || '')}
                 className="group w-full p-6 border border-slate-700 bg-slate-900/50 hover:border-yellow-500/50 hover:bg-yellow-500/5 active:scale-98 transition-all text-left flex gap-6"
               >
                 <div className="flex-shrink-0 w-12 h-12 border border-slate-700 flex items-center justify-center font-black text-2xl text-slate-500 group-hover:border-yellow-500 group-hover:text-yellow-500 transition-colors">
                   {opt.id}
                 </div>
                 <div className="flex-grow flex items-center">
                   <p className="text-slate-200 text-lg leading-relaxed">{opt.label}</p>
                 </div>
               </button>
             ))}
           </div>
        </div>
      </div>
    );
  };

  // Stage 6: 庭審裁決 (Verdict)
  const renderVerdict = () => {
    const isWin = trial.isDefenseSuccess;
    return (
      <div className="h-full flex flex-col">
        <div className={`mb-6 flex items-center justify-center gap-4 py-8 border-y ${isWin ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
          <h2 className={`text-4xl font-black italic tracking-[0.2em] ${isWin ? 'text-green-400' : 'text-red-400'}`}>
            {isWin ? '無罪' : '有罪'}
          </h2>
        </div>

        <div className="flex-grow">
          <PaperFlip 
            title="判決書"
            text={`${trial.judgment}${!isWin && trial.punishmentDetail ? `\n\n${trial.punishmentDetail}` : ''}`}
            onComplete={() => resolveTrial()} 
          />
        </div>

        {!isWin && defendant && !defendant.hasUsedExtraAppeal && (
          <div className="mt-4 px-2">
            <button 
              onClick={() => extraordinaryAppeal()}
              className="w-full py-4 border-2 border-dashed border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm"
            >
              <RotateCcw size={18} />
              <span>非常上訴 (-20% 資金)</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // 渲染當前階段
  const renderContent = () => {
    switch(trial.stage) {
      case 1: return renderIndictment();
      case 2: return renderIntervention();
      case 3: return renderBetting();
      case 4: return renderDefense();
      case 6: return renderVerdict();
      // 階段 5 (律師) 與 7 (上訴) 通常在 store 內部處理邏輯進度
      default: return renderIndictment();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 bg-[#020617] text-white flex flex-col z-50 overflow-hidden"
    >
      {/* 頂部進度條 */}
      <div className="flex h-1 gap-px bg-slate-800">
        {[1, 2, 3, 4, 5, 6].map(s => (
          <div 
            key={s} 
            className={`flex-1 transition-all duration-700 ${trial.stage >= s ? 'bg-yellow-500' : 'bg-transparent'}`} 
          />
        ))}
      </div>

      {/* 法庭背景元件 */}
      <div className="absolute inset-0 pointer-events-none">
         {/* 法官剪影 */}
         <div 
           ref={judgeRef}
           className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 brightness-0 opacity-80 bg-[url('https://www.svgrepo.com/show/440590/judge.svg')] bg-contain bg-center bg-no-repeat drop-shadow-[0_0_40px_rgba(250,204,21,0.2)]"
         />
         
         {/* 底部煙霧/暗角 */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
      </div>

      {/* 內容區域 */}
      <div className="relative z-10 flex-grow pt-32 px-6 pb-24">
        {renderContent()}
      </div>

      {/* 背景雜訊效果 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
    </div>
  );
}
