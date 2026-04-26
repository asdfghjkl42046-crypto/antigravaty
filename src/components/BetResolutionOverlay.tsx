'use client';

import React, { useEffect, useRef } from 'react';
import { Coins, TrendingUp, TrendingDown, Users } from 'lucide-react';
import gsap from 'gsap';
import { formatValue } from '@/engine/MathEngine';
import { SystemStrings } from '@/data/SystemStrings';

interface BetResult {
  playerId: string;
  amount: number;
  type: 'ip' | 'rp' | 'g';
}

interface BetResolutionOverlayProps {
  bets: BetResult[];
  onClose: () => void;
}

export default function BetResolutionOverlay({ bets, onClose }: BetResolutionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    tl.fromTo(contentRef.current, 
      { scale: 0.9, y: 30, opacity: 0 }, 
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
    return () => { tl.kill(); };
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: onClose
    });
  };

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[2100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
    >
      <div 
        ref={contentRef}
        className="relative w-full max-w-sm p-8 rounded-[32px] bg-slate-900 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-amber-500/20 rounded-2xl mb-4">
            <Coins className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase">場外押注結算</h2>
          <p className="text-[10px] font-bold text-amber-500/60 tracking-[0.3em] uppercase mt-1">Betting Results</p>
        </div>

        <div className="space-y-3 mb-8">
          {bets.map((bet, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <span className="font-bold text-white text-sm">{bet.playerId}</span>
              </div>
              <div className="flex items-center gap-2">
                {bet.amount >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-lg font-black ${bet.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatValue(bet.amount, bet.type === 'ip' ? SystemStrings.UNITS.IP : bet.type === 'rp' ? SystemStrings.UNITS.RP : SystemStrings.UNITS.MONEY, true)}
                </span>
              </div>
            </div>
          ))}
          {bets.length === 0 && (
            <div className="py-10 text-center text-slate-500 italic text-sm">
              本場無人進行押注
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-[0.3em] rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
        >
          {SystemStrings.UI_LABELS.ACKNOWLEDGE}
        </button>
      </div>
    </div>
  );
}
