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
      {/* 左側：Logo & 標題 */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center p-2 shadow-lg">
          <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            第 {turn.toString().padStart(2, '0')}/50 輪
          </span>
          <h1 className="text-2xl font-black text-white tracking-widest leading-tight">
            創業冒險
          </h1>
        </div>
      </div>

      {/* 右側：法官資訊 */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end justify-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            法官
          </span>
          <span className="text-sm font-black text-amber-500 tracking-wider">
            {judgeInfo?.judgeName || '準備中...'}
          </span>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-slate-800 shadow-xl">
          <img 
            src="/assets/judge_avatar.png" // 這裡應為動態頭像，暫代
            alt="Judge" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </header>
  );
};
