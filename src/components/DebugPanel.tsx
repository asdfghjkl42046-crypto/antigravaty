'use client';

import React, { useState, useRef } from 'react';
import { Bug, X, ChevronUp, ChevronDown, Zap, Gavel } from 'lucide-react';
import Draggable from 'react-draggable';
import { useGameStore } from '@/store/gameStore';

/**
 * 開發者外掛面板
 * 可即時修改當前玩家的資金、人脈、名聲、行動力等數值。
 * 僅用於測試目的。
 */
export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { players, currentPlayerIndex, debugUpdatePlayer, triggerTrial } = useGameStore();
  const player = players[currentPlayerIndex];

  // React 19 需要為 react-draggable 傳入 nodeRef 以避免 findDOMNode 報錯
  const nodeRefButton = useRef<HTMLDivElement>(null);
  const nodeRefPanel = useRef<HTMLDivElement>(null);

  if (!player) return null;

  // 可調整的數值欄位定義
  const fields: { key: keyof typeof player; label: string; step: number; color: string }[] = [
    { key: 'g', label: '資金 (G)', step: 100, color: 'text-emerald-400' },
    { key: 'ip', label: '人脈 (IP)', step: 50, color: 'text-blue-400' },
    { key: 'rp', label: '名聲 (RP)', step: 10, color: 'text-yellow-400' },
    { key: 'ap', label: '行動力 (AP)', step: 1, color: 'text-purple-400' },
    { key: 'trustFund', label: '信託金', step: 100, color: 'text-cyan-400' },
  ];

  const handleAdjust = (key: string, delta: number) => {
    const current = (player as any)[key] ?? 0;
    debugUpdatePlayer(player.id, { [key]: Math.max(0, current + delta) });
  };

  // 浮動懸浮按鈕
  if (!isOpen) {
    return (
      <Draggable bounds="parent" nodeRef={nodeRefButton}>
        <div ref={nodeRefButton} className="absolute top-4 right-4 z-[9999] opacity-50 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsOpen(true)}
            title="開啟外掛面板"
            className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:scale-110 active:scale-95 transition-transform animate-pulse cursor-pointer"
          >
            <Bug className="w-5 h-5 text-white pointer-events-none" />
          </button>
        </div>
      </Draggable>
    );
  }

  return (
    <Draggable handle=".drag-handle" bounds="parent" nodeRef={nodeRefPanel}>
      <div ref={nodeRefPanel} className="absolute top-4 right-4 z-[9999] w-72 bg-slate-950/95 backdrop-blur-xl border-2 border-red-500/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-300">
        {/* 標題列 (拖曳區) */}
        <div className="drag-handle cursor-move flex items-center justify-between px-4 py-3 border-b border-red-500/20 bg-red-950/20 rounded-t-xl">
          <div className="flex items-center space-x-2 pointer-events-none">
            <Bug className="w-4 h-4 text-red-400" />
            <span className="text-xs font-black text-red-400 uppercase tracking-widest">
              Debug 外掛
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            title="關閉外掛面板"
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-slate-500 pointer-events-none" />
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
                title={`減少 ${step}`}
                className="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center transition-colors active:scale-90"
              >
                <ChevronDown className="w-3.5 h-3.5 text-red-400" />
              </button>
              <button
                onClick={() => handleAdjust(key as string, step)}
                title={`增加 ${step}`}
                className="w-7 h-7 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg flex items-center justify-center transition-colors active:scale-90"
              >
                <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>
        ))}

        {/* 快速操作 */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <button
            onClick={() => triggerTrial(player.id)}
            className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>強制開庭 (測試 UI)</span>
          </button>
          
          <button
            onClick={() =>
              debugUpdatePlayer(player.id, { g: 9999, ip: 999, rp: 100, ap: 5 })
            }
            className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-xl text-[10px] font-black text-amber-400 uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>滿血復活 (全資源拉滿)</span>
          </button>
        </div>
      </div>
      </div>
    </Draggable>
  );
}
