'use client';

import React from 'react';
import { Scale, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JUDGE_LABELS } from '@/data/judges/JudgeTemplatesDB';
import { COURT_TEXT } from '@/data/court/CourtData';
import { GLOBAL_UI_TEXT } from '@/data/system/GlobalUI';
import type { JudgePersonality } from '@/types/game';

interface GameHUDProps {
  turn: number; // 當前局勢進度：1/50
  judgePersonality: JudgePersonality | null; // 幕後黑手
  onReset: () => void; // 掀桌按鈕
  onDebug?: () => void; // 上帝模式開關
  children?: React.ReactNode; // 額外擴充功能（如導航按鈕）
}

/**
 * 最高法院：漂浮指揮中心 (GameHUD)
 * 懸浮顯示法官狀態與回合，釋放其餘頂部空間。
 */
export default function GameHUD({
  turn,
  judgePersonality,
  onReset,
  onDebug,
  children,
}: GameHUDProps) {
  return (
    // 漂浮中心：左側固定
    <div className="fixed top-4 left-10 z-[100] flex flex-col gap-4 pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        {/* 法官資訊標牌 */}
        <div className="pl-5 pr-10 py-4 bg-slate-950/80 backdrop-blur-2xl border-2 border-amber-500/40 rounded-[40px] flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:scale-105 group">
          <div className="w-20 h-20 rounded-3xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/40 group-hover:bg-amber-500 transition-colors">
            <Scale size={40} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-amber-500/80 uppercase tracking-[0.3em] leading-none mb-2">
              {COURT_TEXT.JUDGE_TITLE}
            </span>
            <span className="font-black text-4xl tracking-wider text-amber-500">
              {judgePersonality && JUDGE_LABELS[judgePersonality]
                ? JUDGE_LABELS[judgePersonality].judgeName
                : GLOBAL_UI_TEXT.GAME_HUD.SYSTEM_PREPARING}
            </span>
          </div>
        </div>

        {/* 上帝模式/外掛按鈕：緊鄰法官框 */}
        {onDebug && (
          <button
            onClick={onDebug}
            className="p-4 bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/30 rounded-3xl text-red-500 shadow-lg shadow-red-900/20 transition-all hover:scale-110 active:scale-95 pointer-events-auto group"
            title="開啟上帝模式 (外掛功能)"
          >
            <Bug size={32} className="group-hover:animate-bounce" />
          </button>
        )}

        {/* 擴充功能插槽：將原本分散的導航按鈕整合至此 */}
        {children}
      </div>
    </div>
  );
}
