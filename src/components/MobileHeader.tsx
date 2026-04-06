'use client';

import React from 'react';
import { JUDGE_LABELS } from '@/data/judges/JudgeTemplatesDB';
import type { JudgePersonality } from '@/types/game';

interface MobileHeaderProps {
  turn: number;
  judgePersonality: JudgePersonality | null;
}

/**
 * 19.5:9 頂部狀態列
 * 依照設計圖實作：左側 Logo/輪次/標題，右側法官資訊。
 */
export const MobileHeader: React.FC<MobileHeaderProps> = ({ turn, judgePersonality }) => {
  const judgeInfo = judgePersonality ? JUDGE_LABELS[judgePersonality] : null;

  return (
    <header className="w-full h-24 px-6 flex items-center justify-between z-50">
      {/* 左側：輪次 & 標題 (精準縮小間距) */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <video 
            src="/assets/logo_anim.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase leading-none mb-1">
            第 {turn.toString().padStart(2, '0')}/50 輪
          </span>
          <h1 className="text-2xl font-black text-white tracking-[0.1em] leading-none">
            創業冒險
          </h1>
        </div>
      </div>

      {/* 右側：法官 (金橘色復刻) */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end justify-center">
          <div className="flex items-center gap-1.5 mb-1 leading-none">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              法官
            </span>
            {/* 這裡可以加一個小三角形或裝飾項，但參考圖是純文字 */}
          </div>
          <span className="text-base font-black text-amber-500 tracking-wider drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            {judgeInfo?.judgeName || '方格爾'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <img 
            src={`/assets/player_avatar_1.png`} // 示意法官頭像
            alt="Judge" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </header>
  );
};
