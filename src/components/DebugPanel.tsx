'use client';

import React, { useState, useRef } from 'react';
import { Bug, X, ChevronUp, ChevronDown, Zap, Gavel, Crown, Skull, Banknote, Scroll, Siren, Timer } from 'lucide-react';
import Draggable from 'react-draggable';
import { useGameStore } from '@/store/gameStore';

/**
 * 開發者外掛面板
 * 可即時修改當前玩家的資金、人脈、名聲、行動力等數值。
 * 僅用於測試目的。
 */
export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { players, currentPlayerIndex, debugUpdatePlayer, triggerTrial, debugTriggerEnding } = useGameStore();
  const player = players[currentPlayerIndex];

  // React 19 需要為 react-draggable 傳入 nodeRef 以避免 findDOMNode 報錯
  const nodeRefButton = useRef<HTMLDivElement>(null);
  const nodeRefPanel = useRef<HTMLDivElement>(null);

  if (!player) return null;

  // 可調整的數值欄位定義
  const fields: { key: keyof typeof player; label: string; step: number; color: string }[] = [
    { key: 'g', label: '流動資金', step: 100, color: 'text-emerald-400' },
    { key: 'ip', label: '人脈資源', step: 50, color: 'text-blue-400' },
    { key: 'rp', label: '社會名聲', step: 10, color: 'text-yellow-400' },
    { key: 'ap', label: '剩餘行動力', step: 1, color: 'text-purple-400' },
    { key: 'trustFund', label: '信託基金', step: 100, color: 'text-cyan-400' },
  ];

  const handleAdjust = (key: string, delta: number) => {
    const current = (player as any)[key] ?? 0;
    debugUpdatePlayer(player.id, { [key]: Math.max(0, current + delta) });
  };

  // 浮動懸浮按鈕 (關閉狀態)
  if (!isOpen) {
    return (
      <Draggable bounds="parent" nodeRef={nodeRefButton} cancel="button">
        <div 
          ref={nodeRefButton} 
          className="absolute top-20 right-4 z-[9999] opacity-80 md:opacity-50 hover:opacity-100 transition-opacity"
        >
          <button
            onClick={() => setIsOpen(true)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="開啟外掛面板"
            className="w-14 h-14 md:w-12 md:h-12 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:scale-110 active:scale-90 transition-all animate-pulse cursor-pointer touch-manipulation"
          >
            <Bug className="w-7 h-7 md:w-6 md:h-6 text-white pointer-events-none" />
          </button>
        </div>
      </Draggable>
    );
  }

  return (
    <Draggable handle=".drag-handle" bounds="parent" nodeRef={nodeRefPanel} cancel="button">
      <div 
        ref={nodeRefPanel} 
        className="absolute top-20 right-4 z-[9999] w-[calc(100vw-32px)] max-w-72 bg-slate-950/95 backdrop-blur-xl border-2 border-red-500/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300"
      >
        {/* 標題列 (拖曳區) */}
        <div className="drag-handle cursor-move flex items-center justify-between px-4 py-3 border-b border-red-500/20 bg-red-950/20 rounded-t-xl">
          <div className="flex items-center space-x-2 pointer-events-none">
            <Bug className="w-4 h-4 text-red-400" />
            <span className="text-xs font-black text-red-400 uppercase tracking-widest">
              開發者控制台
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title="關閉外掛面板"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5 md:w-4 md:h-4 text-slate-500 pointer-events-none" />
          </button>
        </div>

        {/* 當前玩家資訊 */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
          操控目標
        </p>
        <p className="text-sm font-black text-white">{player.name}</p>
      </div>

      {/* 數值調整區 */}
      <div className="px-4 pb-4 space-y-2">
        {fields.map(({ key, label, step, color }) => (
          <div
            key={key}
            className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2"
          >
            <div className="flex-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                {label}
              </p>
              <p className={`text-sm font-black ${color}`}>
                {(player as any)[key] ?? 0}
              </p>
            </div>
            <div className="flex items-center space-x-1">
            <button
              onClick={() => handleAdjust(key as string, -step)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title={`減少 ${step}`}
              className="w-10 h-10 md:w-8 md:h-8 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center transition-colors active:scale-90 touch-manipulation"
            >
              <ChevronDown className="w-5 h-5 md:w-4 md:h-4 text-red-400" />
            </button>
            <button
              onClick={() => handleAdjust(key as string, step)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              title={`增加 ${step}`}
              className="w-10 h-10 md:w-8 md:h-8 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg flex items-center justify-center transition-colors active:scale-90 touch-manipulation"
            >
              <ChevronUp className="w-5 h-5 md:w-4 md:h-4 text-emerald-400" />
            </button>
            </div>
          </div>
        ))}

        {/* 快速操作 */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <button
            onClick={() => triggerTrial(player.id)}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full py-4 md:py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs md:text-[10px] font-black text-red-400 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-2 touch-manipulation"
          >
            <Gavel className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span>強制開啟庭審</span>
          </button>
          
          <button
            onClick={() =>
              debugUpdatePlayer(player.id, { g: 9999, ip: 999, rp: 100, ap: 5 })
            }
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="w-full py-4 md:py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-xs md:text-[10px] font-black text-amber-400 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-2 touch-manipulation"
          >
            <Zap className="w-4 h-4 md:w-3.5 md:h-3.5" />
            <span>狀態恢復 (資源全滿)</span>
          </button>
        </div>

        {/* 結局捷徑 */}
        <div className="pt-3 border-t border-white/5">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">結局快速跳轉 (測試 UI)</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => debugTriggerEnding('saint', false)}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 p-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg text-[9px] font-black text-yellow-500 transition-all active:scale-95"
            >
              <Crown size={12} /> <span>真．聖皇</span>
            </button>
            <button
              onClick={() => debugTriggerEnding('saint', true)}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 p-2 bg-amber-700/10 hover:bg-amber-700/20 border border-amber-700/20 rounded-lg text-[9px] font-black text-amber-600 transition-all active:scale-95"
            >
              <Crown size={12} className="opacity-50" /> <span>聖皇(偽)</span>
            </button>
            <button
              onClick={() => debugTriggerEnding('tycoon')}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 transition-all active:scale-95"
            >
              <Banknote size={12} /> <span>代號巨頭</span>
            </button>
            <button
              onClick={() => debugTriggerEnding('dragonhead')}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-400 transition-all active:scale-95"
            >
              <Scroll size={12} /> <span>優良龍頭</span>
            </button>
            <button
              onClick={() => debugTriggerEnding('arrested')}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[9px] font-black text-red-500 transition-all active:scale-95"
            >
              <Siren size={12} /> <span>身敗名裂</span>
            </button>
            <button
              onClick={() => debugTriggerEnding('bankrupt')}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 p-2 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-500/20 rounded-lg text-[9px] font-black text-slate-400 transition-all active:scale-95"
            >
              <Skull size={12} /> <span>經濟破產</span>
            </button>
            <button
              onClick={() => debugTriggerEnding('limit')}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-[9px] font-black text-purple-400 transition-all active:scale-95"
            >
              <Timer size={12} /> <span>創業夢碎</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </Draggable>
  );
}

