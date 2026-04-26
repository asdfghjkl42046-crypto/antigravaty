'use client';

import React, { useEffect, useRef } from 'react';
import { 
  Banknote, 
  Star, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Zap,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import type { NumericalDiffs } from '@/types/game';
import gsap from 'gsap';

interface ResolutionOverlayProps {
  title: string;
  message: string;
  diffs: NumericalDiffs;
  type?: 'success' | 'failure' | 'neutral' | 'passive';
  onClose: () => void;
}

export default function ResolutionOverlay({ 
  title, 
  message, 
  diffs, 
  type = 'success', 
  onClose 
}: ResolutionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    tl.fromTo(contentRef.current, 
      { scale: 0.8, y: 20, opacity: 0 }, 
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      '-=0.1'
    );

    // 數字滾動動畫 (簡單實作)
    const counters = document.querySelectorAll('.resolution-counter');
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target') || '0');
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          const isNegative = target < 0;
          const absVal = Math.abs(Math.round(obj.val));
          counter.textContent = `${isNegative ? '-' : '+'}${absVal}${counter.getAttribute('data-unit') || ''}`;
        }
      });
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: onClose
    });
  };

  const getStatusColor = () => {
    switch (type) {
      case 'success': return 'border-emerald-500/50 text-emerald-400';
      case 'failure': return 'border-red-500/50 text-red-400';
      case 'passive': return 'border-blue-500/50 text-blue-400';
      default: return 'border-white/20 text-white';
    }
  };

  const getStatusBg = () => {
    switch (type) {
      case 'success': return 'bg-emerald-950/80';
      case 'failure': return 'bg-red-950/80';
      case 'passive': return 'bg-blue-950/80';
      default: return 'bg-slate-900/90';
    }
  };

  const StatItem = ({ label, value, icon: Icon, color, unit = '' }: any) => {
    if (value === 0) return null;
    const isNegative = value < 0;
    const displayColor = isNegative ? 'text-red-400' : color;

    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div className={`mb-2 p-2 rounded-full ${isNegative ? 'bg-red-500/10' : 'bg-white/5'}`}>
          <Icon className={`w-6 h-6 ${displayColor}`} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span 
          className={`text-xl font-black resolution-counter ${displayColor}`}
          data-target={value}
          data-unit={unit}
        >
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
    );
  };

  return (
    <div 
      ref={overlayRef}
      onClick={handleClose}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm cursor-pointer"
    >
      <div 
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md p-8 rounded-[40px] border-t-2 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden ${getStatusBg()} ${getStatusColor()}`}
      >
        {/* 背景裝飾 */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at:50%_0%,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        
        {/* 標題與圖示 */}
        <div className="flex flex-col items-center mb-8 relative z-10 text-center">
          <div className="mb-4">
            {type === 'success' && <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-pulse" />}
            {type === 'failure' && <XCircle className="w-16 h-16 text-red-400" />}
            {type === 'passive' && <TrendingUp className="w-16 h-16 text-blue-400" />}
            {type === 'neutral' && <ShieldCheck className="w-16 h-16 text-amber-400" />}
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2 uppercase">{title}</h2>
          <div className="h-1 w-12 bg-current opacity-30 rounded-full" />
        </div>

        {/* 數值變動矩陣 */}
        <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
          <StatItem label="資金" value={diffs.g} icon={Banknote} color="text-emerald-400" unit="萬" />
          <StatItem label="名聲" value={diffs.rp} icon={Star} color="text-yellow-400" />
          <StatItem label="技術" value={diffs.ip} icon={Cpu} color="text-blue-400" />
          <StatItem label="黑料" value={diffs.bm} icon={AlertTriangle} color="text-orange-500" />
          {diffs.trust && diffs.trust > 0 && (
             <div className="col-span-2 mt-1">
                <StatItem label="海外信託" value={diffs.trust} icon={ShieldCheck} color="text-blue-300" unit="萬" />
             </div>
          )}
        </div>

        {/* 文案敘述 */}
        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 relative z-10 mb-8">
          <p className="text-sm font-medium text-slate-300 leading-relaxed text-center italic">
            「{message}」
          </p>
        </div>

        {/* 旁觀者下注 (如有) */}
        {diffs.bets && diffs.bets.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3 text-center">旁觀者盈虧</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {diffs.bets.map((bet, i) => (
                <div key={i} className="px-3 py-1 bg-black/30 rounded-full border border-white/10 text-[11px] font-bold">
                  {bet.playerId}: <span className={bet.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {bet.amount >= 0 ? '+' : ''}{bet.amount}萬
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 人才收益拆解 (Breakdown) */}
        {diffs.breakdown && diffs.breakdown.length > 0 && (
          <div className="mb-8 space-y-2">
            <h4 className="text-[10px] font-black text-blue-400/70 uppercase tracking-[0.2em] mb-3 text-center">人才產出細目</h4>
            {diffs.breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{item.name}</span>
                  <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">Level {item.level} 運作中</span>
                </div>
                <div className="flex flex-col items-end">
                  {item.g !== undefined && item.g !== 0 && (
                    <span className="text-xs font-black text-emerald-400">+{item.g} 萬 G</span>
                  )}
                  {item.rp !== undefined && item.rp !== 0 && (
                    <span className="text-xs font-black text-yellow-400">+{item.rp} RP</span>
                  )}
                  {item.trust !== undefined && item.trust !== 0 && (
                    <span className="text-xs font-black text-blue-300">-{item.trust} 萬 G (轉移信託)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 確認按鈕 */}
        <button
          onClick={handleClose}
          className={`w-full py-5 rounded-[24px] font-black text-sm tracking-[0.3em] uppercase transition-all shadow-xl active:scale-95
            ${type === 'success' ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 
              type === 'failure' ? 'bg-red-500 text-white shadow-red-500/20' : 
              'bg-blue-500 text-white shadow-blue-500/20'}
          `}
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
}
