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

  // --- 非活躍玩家：極致精簡模式 (Mini Mode) ---
  if (!isActive) {
    return (
      <div className="w-full h-[72px] bg-slate-950/20 border border-white/5 rounded-2xl flex items-center px-4 justify-between transition-all duration-300 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
            <img 
              src={`/assets/player_avatar_${player.id}.png`} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as any).src = '/assets/logo.png' }}
            />
          </div>
          <span className="text-sm font-bold text-slate-300 truncate max-w-[80px]">
            {player.name}
          </span>
        </div>
        
        {/* 精簡數值條 */}
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="text-emerald-500 font-bold">{player.g}W</span>
          <span className="text-cyan-400 font-bold">{player.ip}P</span>
          <span className="text-amber-400 font-bold">{player.rp}</span>
          <span className="text-rose-400 font-bold">BM:{player.blackMaterialSources.reduce((acc, s) => acc + s.count, 0)}</span>
          <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
            <span className="text-[12px] font-black text-slate-400">{player.ap}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 活躍玩家：完整資訊模式 (Full Mode) ---
  return (
    <div className="w-full rounded-[32px] p-5 bg-slate-900 border-[2.5px] border-amber-500 shadow-[0_20px_50px_-10px_rgba(245,158,11,0.2)] transition-all duration-500 relative overflow-hidden">
      {/* 點陣背景 */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* 頂部：頭像與 AP */}
      <div className="flex items-center justify-between mb-5 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-amber-500 p-0.5 overflow-hidden">
              <img 
                src={`/assets/player_avatar_${player.id}.png`} 
                alt={player.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { (e.target as any).src = '/assets/logo.png' }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[7px] font-black italic px-1.5 py-0.5 rounded-full border border-white/20 transform rotate-6 scale-110 z-20">
              TURN
            </div>
          </div>
          <h3 className="text-xl font-black text-white tracking-widest">{player.name}</h3>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">AP</span>
          <span className="text-2xl font-black font-mono tracking-tighter text-blue-400">
            {player.ap}/5
          </span>
        </div>
      </div>

      {/* 資源網格：4 欄 */}
      <div className="grid grid-cols-4 gap-1 mb-5 relative px-1 py-3 bg-black/30 rounded-2xl">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[7px] font-black text-emerald-500/60 uppercase">資金</span>
          <span className="text-sm font-black font-mono text-emerald-400">{player.g}W</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[7px] font-black text-cyan-500/60 uppercase">人脈</span>
          <span className="text-sm font-black font-mono text-cyan-400">{player.ip}P</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[7px] font-black text-amber-500/60 uppercase">名聲</span>
          <span className="text-sm font-black font-mono text-amber-400">{player.rp}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[7px] font-black text-rose-500/60 uppercase">黑料</span>
          <span className="text-sm font-black font-mono text-rose-400">
            {player.blackMaterialSources.reduce((acc, s) => acc + s.count, 0)}
          </span>
        </div>
      </div>

      {/* 結束回合按鍵 */}
      <button
        onClick={onEndTurn}
        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl border-t border-white/20 shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mb-4 relative"
      >
        <span className="text-sm font-black text-white tracking-[0.2em] font-mono">結束回合</span>
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px]">➔</div>
      </button>

      {/* 犯罪前科 Accordion */}
      <div className="relative border-t border-white/5 pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-slate-500"
        >
          <span className="text-[8px] font-black uppercase tracking-widest">犯罪前科</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold">{player.tags.length}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-2 flex flex-wrap gap-1 max-h-20 overflow-y-auto no-scrollbar">
            {player.tags.length > 0 ? (
              player.tags.map((tag, idx) => (
                <div key={idx} className="px-2 py-0.5 bg-red-400/10 border border-red-500/20 rounded-full text-[8px] font-bold text-red-400">
                  {tag.text}
                </div>
              ))
            ) : (
              <p className="text-[8px] font-bold text-emerald-500/40 uppercase">身家清白</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
