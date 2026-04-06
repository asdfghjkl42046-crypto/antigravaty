'use client';

import React, { useEffect, useRef } from 'react';
import {
  Home,
  Store,
  History,
  Zap,
  Banknote,
  Network,
  Star,
  AlertTriangle,
  ChevronDown,
  LayoutGrid,
  Scan,
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { JUDGE_LABELS } from '@/data/judges/JudgeTemplatesDB';
import { getTotalBlackMaterials } from '@/engine/PlayerEngine';
import gsap from 'gsap';

interface DashboardScreenProps {
  onEndTurn: () => void;
  onReset: () => void;
}

function StatDisc({ label, value, subValue, colorClass, onClick, hasArrow, isLabelWhite }: any) {
  // 擷取基礎顏色用於標籤 (例如 text-emerald-400 -> bg-emerald-500/20)
  const baseColor = colorClass.split('-')[1];
  
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center flex-1 transition-all ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
    >
      <div className={`w-[50px] h-[50px] rounded-full bg-slate-900 border border-white/10 flex flex-col items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] group relative`}>
        {/* 背景裝飾：保留分類色光暈 */}
        <div className={`absolute inset-0 rounded-full opacity-10 bg-${baseColor}-500 blur-[2px]`} />
        
        {/* 分類標籤：適度放大，保持高質感透明白 */}
        <span className="text-[8px] font-black uppercase tracking-tighter z-10 text-white/90">
          {label}
        </span>
        
        <div className="flex flex-col items-center z-10 -mt-0.5">
          <div className="flex items-center space-x-0.5">
            <span className={`text-xs font-black ${colorClass} filter drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]`}>{value}</span>
            {hasArrow && <ChevronDown className={`w-2.5 h-2.5 ${colorClass}`} />}
          </div>
          
          {/* 海外資金預留插槽 */}
          {subValue && (
            <span className="text-[6px] font-bold text-blue-300/90 -mt-1 flex items-center bg-blue-500/15 px-1 rounded-sm border border-blue-400/20">
              <span className="mr-0.5 scale-75">🌐</span>
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 玩家卡片組件：管理自身摺疊狀態
 */
function PlayerCard({ player, isActive }: any) {
  const [showTags, setShowTags] = React.useState(false);
  const bmCount = getTotalBlackMaterials(player);

  return (
    <div className={`dashboard-animate relative p-4 rounded-[28px] border-2 backdrop-blur-sm transition-all duration-500 overflow-visible
      ${showTags ? 'z-[100]' : 'z-10'}
      ${isActive 
        ? 'border-amber-900/40 bg-[#120b02]/50 shadow-[0_12px_25px_rgba(0,0,0,0.4)]' 
        : 'border-white/5 bg-slate-900/20 opacity-70'}
    `}>
      {/* 裝飾發光 */}
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at:50%_-20%,rgba(120,53,15,0.12),transparent)] pointer-events-none rounded-[26px]" />
      )}
      
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className={`w-11 h-11 rounded-full border-2 overflow-hidden shadow-md transition-colors
              ${isActive ? 'border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-white/10'}
            `}>
              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {isActive && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-widest shadow-lg border border-white/10">
                TURN
              </div>
            )}
          </div>
          <div>
            <h2 className={`text-lg font-black tracking-tight transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}>
              {player.name}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-white/70 uppercase mr-1 tracking-widest">行動力</span>
          <span className="text-lg font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]">
            {player.ap}
            <span className="text-xs text-white/30 ml-0.5">/5</span>
          </span>
        </div>
      </div>

      {/* 數值圓盤 (黃金比例回彈) */}
      <div className="flex items-center justify-between space-x-1.5 mb-1.5 relative z-10">
        <StatDisc 
          label="資金" 
          value={`${player.g}萬`} 
          subValue={player.g > 350 ? "40萬" : null} 
          colorClass="text-emerald-400" 
        />
        <StatDisc label="人脈" value={player.ip} colorClass="text-blue-400" />
        <StatDisc label="名聲" value={player.rp} colorClass="text-yellow-400" />
        <StatDisc label="黑料" value={bmCount} colorClass="text-red-400" />
        <StatDisc 
          label="前科" 
          value={player.tags.length} 
          isLabelWhite={true}
          colorClass="text-orange-500" 
          hasArrow={true}
          onClick={() => setShowTags(!showTags)}
        />
        
        {/* 犯罪標籤懸浮雲 */}
        {showTags && (
          <div className="absolute left-0 top-full mt-2 w-full bg-slate-950/98 border border-orange-500/40 backdrop-blur-2xl p-4 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.7)] z-[100] animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex flex-wrap gap-2">
              {player.tags.length > 0 ? player.tags.map((tag: any, tIdx: number) => (
                <span key={tIdx} className="px-2.5 py-1 bg-orange-950/60 border border-orange-500/30 text-[9px] font-black text-orange-400 rounded-md tracking-wider uppercase">
                  {tag.text}
                </span>
              )) : (
                <span className="text-[9px] text-slate-600 font-bold tracking-widest italic">前科清白</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardScreen({ onEndTurn, onReset }: DashboardScreenProps) {
  const { players, turn, currentPlayerIndex, judgePersonality } = useGameStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      '.dashboard-animate',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
    );
  }, []);

  const judgeInfo = judgePersonality ? JUDGE_LABELS[judgePersonality] : null;

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[#020617] text-white overflow-hidden max-w-[420px] mx-auto relative font-sans">
      {/* 1. Header: 狀態列 - 垂直收納 */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 dashboard-animate">
        <div className="flex items-center space-x-3">
          {/* 返回鍵 */}
          <button
            onClick={onReset}
            className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-slate-800 transition-all hover:border-blue-500/50 group"
            title="返回模式選擇"
            aria-label="Back to Mode Select"
          >
            <History className="w-4 h-4 text-slate-400 group-hover:text-blue-400 rotate-180" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] overflow-hidden">
            <video
              src="/assets/logo_anim.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-90 scale-125"
            />
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 tracking-widest leading-none mb-1">
              第 {String(turn).padStart(2, '0')}/50 輪
            </p>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              創業冒險
            </h1>
          </div>
        </div>

        {judgeInfo && (
          <div className="text-right">
            <p className="text-[8px] font-bold text-amber-500/80 uppercase tracking-tighter leading-none mb-1.5">當前法官</p>
            <p className="text-sm font-black text-amber-400 tracking-tight filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{judgeInfo.judgeName}</p>
          </div>
        )}
      </div>

      {/* 2. Player List: 卡片列表 - 極致壓縮間距 */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-1.5 custom-scrollbar">
        {players.map((player, idx) => (
          <PlayerCard key={player.id} player={player} isActive={idx === currentPlayerIndex} />
        ))}
      </div>

      {/* 3. Bottom Nav: 霓虹導覽列 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] dashboard-animate z-50">
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-full h-16 flex items-center justify-around px-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button className="relative group" title="主畫面" aria-label="Home">
            <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full opacity-100 group-hover:bg-blue-500/40 transition-all scale-150" />
            <Home className="w-6 h-6 text-blue-400 relative z-10" />
          </button>

          <button
            className="text-slate-500 hover:text-white transition-colors"
            title="商店"
            aria-label="Market"
          >
            <Store className="w-6 h-6" />
          </button>

          <button
            className="text-slate-500 hover:text-white transition-colors"
            title="掃描卡片"
            aria-label="Scan"
          >
            <Scan className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
