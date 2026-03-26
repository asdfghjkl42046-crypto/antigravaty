'use client';

import React from 'react';
import { AlertOctagon, RefreshCw, Terminal } from 'lucide-react';

interface EngineErrorModalProps {
  error: { context: string; message: string } | null;
  onReset: () => void;
}

/**
 * 核心引擎錯誤阻斷器 (Engine Error Modal)
 * 當系統偵測到數值異常 (NaN) 或資料損壞時，會彈出此全螢幕鎖定視窗。
 * 這是為了防止「靜默失敗」導致更嚴重的存檔毀損。
 */
export default function EngineErrorModal({ error, onReset }: EngineErrorModalProps) {
  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full bg-slate-950 border-2 border-red-500/50 rounded-[40px] p-12 shadow-[0_0_100px_rgba(239,68,68,0.2)] flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-300">
        
        {/* 致命錯誤圖示 */}
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
          <AlertOctagon size={48} className="text-red-500" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            FATAL ENGINE ERROR
          </h2>
          <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
            <Terminal size={14} className="text-red-400" />
            <span className="text-xs font-mono text-red-400 font-bold tracking-widest uppercase">
              Circuit Breaker Triggered
            </span>
          </div>
        </div>

        {/* 錯誤詳情箱 */}
        <div className="w-full bg-black/60 border border-white/5 rounded-3xl p-8 font-mono text-left space-y-6">
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Error Context</p>
            <p className="text-blue-400 text-lg font-bold">{error.context}</p>
          </div>
          <div className="h-px bg-white/5" />
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Diagnostics</p>
            <p className="text-red-200 text-base leading-relaxed break-words">
              {error.message}
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
          系統偵測到不可恢復的數值異常，為確保資料完整性，目前已鎖定遊戲進度。
          請點擊下方按鈕強制重啟系統。
        </p>

        {/* 強制回歸按鈕 */}
        <button
          onClick={onReset}
          className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black text-2xl rounded-2xl shadow-xl shadow-red-900/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4 group"
        >
          <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" />
          FORCE SYSTEM REBOOT
        </button>

        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Kernel Integrity Audit v2.88
        </p>
      </div>
    </div>
  );
}
