'use client';

import React from 'react';
import { Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JUDGE_LABELS } from '@/data/judges/JudgeTemplatesDB';
import { COURT_TEXT } from '@/data/court/CourtData';
import { GLOBAL_UI_TEXT } from '@/data/system/GlobalUI';
import type { JudgePersonality } from '@/types/game';

interface GameHUDProps {
  turn: number; // 當前局勢進度：1/50
  judgePersonality: JudgePersonality | null; // 幕後黑手
  onEndTurn: () => void; // 結束回合
  onDebug?: () => void; // 開啟開發者工具
}

export default function GameHUD({
  turn,
  judgePersonality,
  onEndTurn,
  onDebug,
}: GameHUDProps) {
  return (
    // 漂浮中心：左側固定
    <div className="fixed top-4 left-4 z-[100] flex items-center gap-4 pointer-events-none">
      <div className="flex items-start gap-4 pointer-events-auto">
        
        {/* 1. 法官資訊標牌 (左側核心) */}
        <div className="flex flex-col gap-2">
          <div className="pl-5 pr-8 py-4 bg-slate-950/80 backdrop-blur-2xl border-2 border-slate-800 rounded-[32px] flex items-center gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center shadow-lg">
              <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1.5">
                {COURT_TEXT.JUDGE_TITLE}
              </span>
              <span className="font-black text-2xl tracking-wider text-white">
                {judgePersonality && JUDGE_LABELS[judgePersonality]
                  ? JUDGE_LABELS[judgePersonality].judgeName
                  : '準備中...'}
              </span>
            </div>
          </div>
          
          {/* 回合計數器 (掛在下方) */}
          <div className="ml-4 px-5 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full inline-flex items-center gap-2 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-mono font-black text-blue-100/80 tracking-widest uppercase">
              Case Session: {turn} / 50
            </span>
          </div>
        </div>

        {/* 2. 結束回合按鈕 (大動作) */}
        <button
          onClick={onEndTurn}
          className="group relative h-20 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] border-t border-white/20 shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 overflow-hidden"
        >
          {/* 內部高亮流光 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
          
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Submit Evidence</span>
            <span className="text-xl font-black text-white tracking-widest">結束回合</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white border border-white/10 group-hover:bg-blue-400 group-hover:text-blue-900 transition-colors">
            ➔
          </div>
        </button>

        {/* 3. 上帝模式/外掛按鈕 */}
        {onDebug && (
          <button
            onClick={onDebug}
            className="w-20 h-20 bg-slate-900/80 hover:bg-red-950/40 border-2 border-white/5 rounded-[32px] text-slate-500 hover:text-red-400 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
            title="上帝模式"
          >
            <Bug size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
