import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Scan,
  Keyboard,
  ShieldAlert,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { PlayerCard } from './DashboardScreen';

interface ScanScreenProps {
  onBack: () => void;
  onEndTurn?: () => void;
  onNavigate?: (tab: 'home' | 'shop') => void;
}

export default function ScanScreen({ onBack, onEndTurn, onNavigate }: ScanScreenProps) {
  const { processScan, players, currentPlayerIndex } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const nextPlayerIndex = (currentPlayerIndex + 1) % Math.max(1, players.length);
  const nextPlayer = players[nextPlayerIndex];
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({
    type: 'idle',
    msg: '',
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>(''); // 防抖：避免鏡頭連續掃到同一張卡

  // 初始化相機掃描並自動啟動
  useEffect(() => {
    let isMounted = true;
    const html5QrCode = new Html5Qrcode('reader');
    scannerRef.current = html5QrCode;

    // 自動啟動相機
    const autoStart = async () => {
      try {
        if (!isMounted) return;
        setIsCameraActive(true);
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, aspectRatio: 1.0 },
          (decodedText) => {
            if (decodedText === lastScannedRef.current) return;
            lastScannedRef.current = decodedText;
            setTimeout(() => {
              lastScannedRef.current = '';
            }, 2000);
            handleCodeSubmit(decodedText);
          },
          () => {}
        );
      } catch {
        // 自動啟動失敗（權限等），回退到手動模式
        if (isMounted) setIsCameraActive(false);
      }
    };
    autoStart();

    return () => {
      isMounted = false;
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {}); // 忽略停止時的錯誤
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        { fps: 10, aspectRatio: 1.0 },
        (decodedText) => {
          // 冷卻機制：同一代碼 2 秒內不重複處理
          if (decodedText === lastScannedRef.current) return;
          lastScannedRef.current = decodedText;
          setTimeout(() => {
            lastScannedRef.current = '';
          }, 2000);
          handleCodeSubmit(decodedText);
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

      // 延遲跳轉以確保玩家能看見成功訊息
      setTimeout(() => {
        if (result.type === 'talent') onNavigate?.('shop');
      }, 1000);
    } else {
      setStatus({ type: 'error', msg: result.message });
    }
    // 所有提示統一 2.5 秒後自動消失（確保使用者能看清回饋）
    setTimeout(() => setStatus({ type: 'idle', msg: '' }), 2500);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 bg-slate-950 py-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* 企業資源與數據看板 (原裝 UI 重用) */}
      <div className="w-full flex-shrink-0 z-[100] relative mb-1 mt-4">
        {currentPlayer && <PlayerCard player={currentPlayer} isActive={true} />}
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center space-y-4">
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
              <span className="text-xs font-black text-red-100 uppercase tracking-widest whitespace-nowrap">
                {currentPlayer?.name}結束回合，換{nextPlayer?.name}
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
            className={`absolute top-24 left-1/2 -translate-x-1/2 w-[80%] max-w-[300px] p-4 rounded-2xl border-2 backdrop-blur-xl flex items-start space-x-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-[100] ${
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

        /* 覆蓋 html5-qrcode 函式庫內部樣式，避免畫面分裂 */
        #reader {
          position: relative !important;
          overflow: hidden !important;
          border: none !important;
        }
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
        /* 隱藏函式庫自帶的掃描框與多餘 UI */
        #reader img,
        #reader canvas,
        #reader__scan_region > br,
        #reader__dashboard,
        #reader__header_message,
        #qr-shaded-region {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        #reader__scan_region {
          width: 100% !important;
          height: 100% !important;
          min-height: unset !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
      `}</style>
    </div>
  );
}
