import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Scan,
  Keyboard,
  X,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface ScanScreenProps {
  onBack: () => void;
  onEndTurn?: () => void;
}

export default function ScanScreen({ onBack, onEndTurn }: ScanScreenProps) {
  const { processScan } = useGameStore();
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: 'idle',
    msg: '',
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // 初始化相機掃描
  useEffect(() => {
    const html5QrCode = new Html5Qrcode('reader');
    scannerRef.current = html5QrCode;

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setStatus({
        type: 'error',
        msg: '🚨 安全性限制：瀏覽器禁止在非加密連線 (HTTP) 下開啟相機。請將網址改為 https:// 或使用手動輸入編碼。',
      });
      return;
    }

    try {
      setIsCameraActive(true);
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleCodeSubmit(decodedText);
          stopScanning();
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera start failed:', err);
      setStatus({ type: 'error', msg: '啟動失敗：請檢查權限設定，或嘗試重新整理頁面。' });
      setIsCameraActive(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsCameraActive(false);
    }
  };

  const handleCodeSubmit = (code: string) => {
    if (!code.trim()) return;

    const result = processScan(code);
    if (result.success) {
      setStatus({ type: 'success', msg: result.message });
      setManualCode('');
      setTimeout(() => setStatus({ type: 'idle', msg: '' }), 3000);
    } else {
      setStatus({ type: 'error', msg: result.message });
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <Scan className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">
              數據解碼終端
            </h2>
            <p className="text-[9px] font-bold text-amber-500/60 tracking-widest uppercase">
              Encryption Link Established
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          title="關閉掃描器"
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="relative w-64 h-64 border-2 border-slate-800 rounded-[32px] overflow-hidden bg-black/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div id="reader" className="w-full h-full object-cover" />

          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/80 backdrop-blur-sm">
              <ShieldAlert className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
              <p className="text-xs font-bold text-slate-400 mb-6">點擊下方按鈕啟動光學掃描器</p>
              <button
                onClick={startScanning}
                className="px-6 py-2.5 bg-amber-500 text-black font-black text-xs rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                啟動相機
              </button>
            </div>
          )}

          {isCameraActive && (
            <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-500 shadow-[0_0_15px_#f59e0b] animate-scan-line z-20" />
          )}

          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500/50 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-500/50 rounded-br-lg" />
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 shadow-inner">
            <div className="flex items-center space-x-2 mb-3">
              <Keyboard className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                備援編碼輸入
              </span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="例如: A011"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-sm font-black tracking-[0.2em] text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 uppercase"
              />
              <button
                onClick={() => handleCodeSubmit(manualCode)}
                title="解析並同步卡片"
                aria-label="Decode and sync card"
                className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                <Cpu size={18} />
              </button>
            </div>
          </div>

          {/* 結束回合快速按鍵 (用戶要求：放在輸入代碼底下) */}
          {onEndTurn && (
            <button
              onClick={onEndTurn}
              title="結束目前回合並儲存所有變動"
              aria-label="End turn"
              className="w-full mt-2 py-4 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 rounded-2xl transition-all active:scale-95 group flex items-center justify-center space-x-3 shadow-[0_4px_20px_rgba(239,68,68,0.2)]"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black text-red-100 uppercase tracking-[0.2em]">
                結束目前回合
              </span>
              <ChevronRight
                size={16}
                className="text-red-400 group-hover:translate-x-1 transition-transform"
              />
            </button>
          )}
        </div>

        {status.msg && (
          <div
            className={`fixed top-24 left-1/2 -translate-x-1/2 w-[80%] max-w-[300px] p-4 rounded-2xl border-2 backdrop-blur-xl flex items-start space-x-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-[100] ${
              status.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
                : 'bg-red-950/90 border-red-500 text-red-100'
            }`}
          >
            <div className="mt-0.5">
              {status.type === 'success' ? (
                <CheckCircle2 size={20} className="text-emerald-400" />
              ) : (
                <AlertCircle size={20} className="text-red-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-black tracking-tight leading-relaxed">{status.msg}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto mb-2 text-center opacity-20">
        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.5em]">
          Antigravity Protocol Hardware Sync
        </p>
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan-line {
          animation: scan-line 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
}
