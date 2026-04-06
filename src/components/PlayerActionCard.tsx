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

  // --- 非活躍玩家：迷你精簡行 (Mini Row Style) ---
  if (!isActive) {
    return (
      <div className="w-full h-[92px] bg-slate-900/60 border border-white/5 rounded-[24px] flex items-center px-4 justify-between transition-all duration-300 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shrink-0">
            <img 
              src={`/assets/player_avatar_${player.id}.png`} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as any).src = '/assets/logo.png' }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-200">{player.name}</span>
            <span className="text-[10px] font-mono text-slate-500">行動點數: {player.ap}/5</span>
          </div>
        </div>
        
        {/* 精簡數據橫排 */}
        <div className="flex items-center gap-3 text-[11px] font-black">
          <div className="flex flex-col items-center">
            <span className="text-[7px] text-emerald-500/60 uppercase">G</span>
            <span className="text-emerald-400">{player.g}W</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] text-cyan-500/60 uppercase">IP</span>
            <span className="text-cyan-400">{player.ip}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] text-amber-500/60 uppercase">RP</span>
            <span className="text-amber-400">{player.rp}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[7px] text-rose-500/60 uppercase">BM</span>
            <span className="text-rose-400">{player.blackMaterialSources.reduce((acc, s) => acc + s.count, 0)}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- 活躍玩家：數據膠囊模式 (Active Capsule Style) ---
  return (
    <div className="w-full rounded-[40px] p-6 bg-[#0f0a05]/95 border-2 border-[#d97706]/60 shadow-[0_30px_70px_-15px_rgba(217,119,6,0.25)] transition-all duration-500 relative overflow-hidden">
      {/* 點陣背景覆蓋 */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

      {/* 頂部：頭像與 AP */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-22 h-22 rounded-full border-[3px] border-[#d97706] p-1 overflow-hidden shadow-[0_0_20px_rgba(217,119,6,0.3)]">
              <img 
                src={`/assets/player_avatar_${player.id}.png`} 
                alt={player.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => { (e.target as any).src = '/assets/logo.png' }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] font-black italic px-2.5 py-1 rounded-full border-2 border-white/20 transform rotate-6 shadow-md z-20">
              TURN
            </div>
          </div>
          <h3 className="text-3xl font-black text-white tracking-widest leading-none drop-shadow-md">
            {player.name}
          </h3>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">行動點數 (AP)</span>
          <span className="text-4xl font-black font-mono tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]">
            {player.ap}/5
          </span>
        </div>
      </div>

      {/* 核心數據膠囊 (Capsules) */}
      <div className="grid grid-cols-4 gap-2 mb-6 relative z-10">
        <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-3xl py-3 shadow-inner">
          <span className="text-[10px] font-black text-emerald-500/80 uppercase mb-1">資金 (G)</span>
          <span className="text-xl font-black font-mono text-emerald-400">{player.g}萬</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-3xl py-3 shadow-inner">
          <span className="text-[10px] font-black text-cyan-500/80 uppercase mb-1">人脈 (IP)</span>
          <span className="text-xl font-black font-mono text-cyan-400">{player.ip}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-3xl py-3 shadow-inner">
          <span className="text-[10px] font-black text-amber-500/80 uppercase mb-1">名聲 (RP)</span>
          <span className="text-xl font-black font-mono text-amber-400">{player.rp}</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-3xl py-3 shadow-inner">
          <span className="text-[10px] font-black text-rose-500/80 uppercase mb-1">黑料 (BM)</span>
          <span className="text-xl font-black font-mono text-rose-400">
            {player.blackMaterialSources.reduce((acc, s) => acc + s.count, 0)}
          </span>
        </div>
      </div>

      {/* 犯罪前科 Accordion (與參考圖一致) */}
      <div className="relative border-t border-white/10 pt-4 z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-slate-400 font-black"
        >
          <span className="text-[12px] uppercase tracking-widest text-[#d97706]/80">犯罪前科</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">{player.tags.length}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-3 flex flex-wrap gap-2 max-h-24 overflow-y-auto no-scrollbar pb-2">
            {player.tags.length > 0 ? (
              player.tags.map((tag, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 rounded-xl text-[10px] font-black text-red-400 shadow-sm">
                  {tag.text.toUpperCase()}
                </div>
              ))
            ) : (
              <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest">身家清白，查無不法</p>
            )}
          </div>
        )}
      </div>

      {/* 底部按鈕 */}
      <button
        onClick={onEndTurn}
        className="mt-6 w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl border-t border-white/20 shadow-[0_15px_35px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all text-white font-black tracking-[0.2em]"
      >
        結束回合
      </button>
    </div>
  );
};
