'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalScannerProps {
  onDecode: (cardId: string, optionIdx: number) => void;
  onToggleQr: () => void;
  isQrActive: boolean;
  disabled?: boolean;
}

/**
 * 數位指令終端 (Manual Commands & QR Integration)
 * 接受 'A-01-1' 格式的指令。
 * 輸入 'A-01' 等不完整指令會顯示錯誤。
 */
export const TerminalScanner: React.FC<TerminalScannerProps> = ({
  onDecode,
  onToggleQr,
  isQrActive,
  disabled
}) => {
  const [inputValue, setInputValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 當組件掛載或切換標籤時，自動聚焦終端機
  useEffect(() => {
    if (!isQrActive) {
      inputRef.current?.focus();
    }
  }, [isQrActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const cmd = inputValue.trim().toUpperCase();
    if (!cmd) return;

    // 正則表達式：[A-E]-[兩位數字]-[1-3]
    const pattern = /^([A-E]-\d{2})-([1-3])$/;
    const match = cmd.match(pattern);

    if (match) {
      const [_, cardId, optionIdxStr] = match;
      const optionIdx = parseInt(optionIdxStr, 10);
      
      // 成功解析：回傳給 page.tsx 執行
      onDecode(cardId, optionIdx);
      setInputValue('');
      setErrorMsg(null);
    } else {
      // 失敗：根據輸入狀況給予具體報錯
      if (/^[A-E]-\d{2}$/.test(cmd)) {
        setErrorMsg('指令不完整：請包含選項編號 (例如: ' + cmd + '-1)');
      } else {
        setErrorMsg('指令無效：格式應為 [類別]-[編碼]-[選項] (如: A-01-1)');
      }
      
      // 錯誤震動效果
      if (typeof window !== 'undefined' && window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* 終端機狀態欄 */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60 font-mono">
            Terminal System v2.0
          </span>
        </div>
        {!isQrActive && (
          <button 
            onClick={onToggleQr}
            className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Camera size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold text-slate-400">開啟攝影機掃描</span>
          </button>
        )}
      </div>

      {/* 核心輸入區塊 */}
      {!isQrActive ? (
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full opacity-50 group-focus-within:opacity-100 transition-opacity" />
          
          <div className={cn(
            "relative flex items-center bg-black/60 backdrop-blur-3xl border-2 rounded-[32px] p-2 transition-all duration-300",
            errorMsg ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border-white/10 focus-within:border-blue-500/50 shadow-2xl"
          )}>
            <div className="pl-6 text-blue-500 font-mono text-xl opacity-50 select-none">
              <Terminal size={24} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="輸入代碼 (例如: A-01-1)..."
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-2xl font-mono tracking-widest text-white placeholder:text-slate-700 uppercase"
              autoComplete="off"
              autoFocus
            />
            <button
              type="submit"
              disabled={disabled || !inputValue}
              className="mr-2 w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all flex items-center justify-center text-white shadow-lg active:scale-90"
            >
              <Cpu size={28} />
            </button>
          </div>

          {/* 錯誤提示氣泡 */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
              <ShieldAlert size={18} className="text-red-400 shrink-0" />
              <p className="text-xs font-bold text-red-400/90 leading-tight">
                {errorMsg}
              </p>
            </div>
          )}
        </form>
      ) : (
        <div className="relative group">
           <button 
             onClick={onToggleQr}
             className="absolute -top-12 right-2 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
           >
             [ 關閉相機 ]
           </button>
           {/* 此處由 page.tsx 渲染 QrScanner */}
        </div>
      )}

      {/* 指令說明區 */}
      <div className="px-6 py-6 bg-white/5 border border-white/5 rounded-[32px] space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Terminal size={12} /> 指令說明範例
        </h4>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between text-xs font-mono p-3 bg-black/40 rounded-xl border border-white/5">
            <span className="text-emerald-400">A-01-1</span>
            <span className="text-slate-500">執行 A-01 提案第一個選項</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono p-3 bg-black/40 rounded-xl border border-white/5">
            <span className="text-amber-400">B-03-2</span>
            <span className="text-slate-500">執行人才市場卡片第二個選項</span>
          </div>
        </div>
        <p className="text-[9px] text-slate-600 font-medium italic mt-2">
          * 請務必依照完整格式輸入，包含編碼與動作索引。
        </p>
      </div>
    </div>
  );
};
