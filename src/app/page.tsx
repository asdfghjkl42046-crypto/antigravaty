'use client';

import React, { useState, useEffect } from 'react';
import ModeSelectScreen from '@/components/ModeSelectScreen';
import { GamePhase, JudgeMode } from '@/types/game';
import { Gavel, Settings, Zap, Scale } from 'lucide-react';
import GlowLogo from '@/components/GlowLogo';

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>('play');
  const [gameMode, setGameMode] = useState<JudgeMode | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSelectMode = (mode: JudgeMode) => {
    setGameMode(mode);
    // 這裡我們暫時維持在 play 階段，由 ModeSelectScreen 內部處理邏輯
    // 或者切換到 courtroom 階段
    setPhase('courtroom');
  };

  if (!mounted) return null;

  return (
    <main className="fixed inset-0 w-screen h-[100dvh] bg-[#000] flex items-center justify-center overflow-hidden font-sans">
      {/* 19.5:9 Core Container */}
      <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] max-w-full bg-black flex flex-col items-center overflow-hidden shadow-2xl border-x border-white/5 animate-in fade-in duration-700">
        
        {/* Global UI Decor */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        {/* Status Bar */}
        <div className="w-full px-6 pt-10 pb-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Scale size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tighter text-white">ANTIGRAVITY</h1>
              <div className="text-[8px] text-blue-500 font-bold uppercase tracking-widest leading-none">Terminal v2.0</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Connected</span>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 w-full relative">
          {phase === 'play' ? (
            <ModeSelectScreen onSelect={handleSelectMode} />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-6 p-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
                <Zap size={40} className="text-blue-500" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white italic mb-2 uppercase">法庭程序啟動</h2>
                <p className="text-slate-400 text-xs leading-relaxed uppercase tracking-widest opacity-60">
                  Initializing Neural Link...<br />
                  Mode: {gameMode === 'ai' ? 'Advanced AI' : 'Standard Logic'}
                </p>
              </div>
              <button 
                onClick={() => setPhase('play')}
                className="mt-8 px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase transition-all active:scale-95"
              >
                Reset Connection
              </button>
            </div>
          )}
        </div>

        {/* Gesture Bar */}
        <div className="w-1/3 h-[4px] bg-white/10 rounded-full mb-3 shrink-0" />
      </div>
    </main>
  );
}
