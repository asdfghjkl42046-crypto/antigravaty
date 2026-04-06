'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, TrendingUp, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player } from '@/types/game';

interface PlayerActionCardProps {
  player: Player;
  isActive: boolean;
  onEndTurn: () => void;
}

/**
 * 19.5:9 玩家行動卡片
 * 依照設計圖實作：垂直堆疊、四格資源、AP 顯示、犯罪前科摺疊與結束回合按鈕。
 */
export const PlayerActionCard: React.FC<PlayerActionCardProps> = ({
  player,
  isActive,
  onEndTurn,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "w-full rounded-[40px] p-6 transition-all duration-500 relative overflow-hidden",
      isActive 
        ? "bg-slate-900 border-[3px] border-amber-500 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.3)] scale-[1.02] z-10" 
        : "bg-slate-950/40 border-2 border-white/5 opacity-80"
    )}>
      
      {/* 點陣背景 */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* 卡片頂部：頭像、名稱、AP */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "w-20 h-20 rounded-full border-2 p-1 overflow-hidden",
              isActive ? "border-amber-500 shadow-lg shadow-amber-500/20" : "border-white/10"
            )}>
              <img 
                src={`/assets/player_avatar_${player.id}.png`} // 根據 ID 切換頭像
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full bg-slate-800"
                onError={(e) => { (e.target as any).src = '/assets/logo.png' }}
              />
            </div>
            {isActive && (
              <div className="absolute -bottom-2 right-0 bg-blue-600 text-[8px] font-black italic px-2 py-0.5 rounded-full border border-white/20 shadow-md transform rotate-12 scale-125 z-20">
                TURN
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className={cn(
              "text-2xl font-black tracking-widest",
              isActive ? "text-white" : "text-slate-400"
            )}>
              {player.name}
            </h3>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
            行動點數 (AP)
          </span>
          <span className={cn(
            "text-3xl font-black font-mono tracking-tighter",
            isActive ? (player.ap > 1 ? "text-blue-400" : "text-red-500") : "text-slate-600"
          )}>
            {player.ap} / 5
          </span>
        </div>
      </div>

      {/* 資源網格：4 欄橫排 */}
      <div className={cn(
        "grid grid-cols-4 gap-2 mb-8 relative px-2 py-4 rounded-3xl",
        isActive ? "bg-black/20" : "bg-transparent"
      )}>
        {/* 資金 (G) */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
            資金 (G)
          </span>
          <span className={cn(
            "text-lg font-black font-mono tracking-tight",
            isActive ? "text-emerald-400" : "text-slate-500"
          )}>
            {player.g}萬
          </span>
        </div>

        {/* 人脈 (IP) */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest">
            人脈 (IP)
          </span>
          <span className={cn(
            "text-lg font-black font-mono tracking-tight",
            isActive ? "text-cyan-400" : "text-slate-500"
          )}>
            {player.ip}
          </span>
        </div>

        {/* 名聲 (RP) */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">
             名聲 (RP)
          </span>
          <span className={cn(
            "text-lg font-black font-mono tracking-tight",
            isActive ? "text-amber-400" : "text-slate-500"
          )}>
            {player.rp}
          </span>
        </div>

        {/* 黑料 (BM) */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest">
            黑料 (BM)
          </span>
          <span className={cn(
            "text-lg font-black font-mono tracking-tight",
            isActive ? "text-rose-400" : "text-slate-500"
          )}>
            {player.blackMaterialSources.reduce((acc, s) => acc + s.count, 0)}
          </span>
        </div>
      </div>

      {/* 行動按鈕 (僅活躍玩家顯示) */}
      {isActive && (
        <button
          onClick={onEndTurn}
          className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[28px] border-t border-white/20 shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all mb-6 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="text-lg font-black text-white tracking-[0.3em] font-mono">
            結束回合
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs border border-white/10">
            ➔
          </div>
        </button>
      )}

      {/* 犯罪前科 Accordion */}
      <div className="relative border-t border-white/5 pt-4 mt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-slate-500 hover:text-slate-400 transition-colors"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            犯罪前科
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold">{player.tags.length}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {player.tags.length > 0 ? (
              player.tags.map((tag, idx) => (
                <div 
                  key={idx} 
                  className="px-3 py-1 bg-red-400/10 border border-red-500/20 rounded-full text-[9px] font-bold text-red-400 shadow-sm"
                >
                  {tag.text}
                </div>
              ))
            ) : (
              <p className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-[0.1em]">
                身家清白，查無不法
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
