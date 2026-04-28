'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, ArrowLeft, RefreshCw, LogOut, Play, QrCode } from 'lucide-react';

interface LobbyScreenProps {
  onBack: () => void;
  onStartGame: (roomKey: string) => void;
}

/**
 * 多機連線大廳 (Lobby)
 * 負責創房、進房、顯示極限亂碼 QR Code。
 */
export default function LobbyScreen({ onBack, onStartGame }: LobbyScreenProps) {
  const [view, setView] = useState<'selection' | 'host' | 'guest'>('selection');
  const [roomKey, setRoomKey] = useState('');
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 極限亂碼生成器：20 個字元，包含所有特殊符號，鍵盤極難手動輸入
  const generateChaoticKey = () => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    const array = new Uint8Array(20);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((v) => chars[v % chars.length])
      .join('');
  };

  const handleHostRoom = () => {
    setIsGenerating(true);
    // 模擬網路延遲與數位合成感
    setTimeout(() => {
      const key = generateChaoticKey();
      setRoomKey(key);
      setParticipants([{ id: 'host', name: '房長 (你)' }]);
      setView('host');
      setIsGenerating(false);
    }, 1500);
  };

  const handleJoinRoom = () => {
    setView('guest');
    // 未來這裡會啟動相機掃描器
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#020617] text-white overflow-hidden font-mono">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-black" />

      {/* 頂部導航 */}
      <div className="absolute top-10 left-10 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">返回入口</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* 1. 模式選擇介面 */}
        {view === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="relative z-10 flex flex-col items-center max-w-xl w-full px-6"
          >
            <div className="mb-12 p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <Users className="w-16 h-16 text-blue-400" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">
              Multiplayer <span className="text-blue-500 text-glow">Lobby</span>
            </h2>
            <p className="text-slate-500 text-center mb-12 text-sm leading-relaxed tracking-wider">
              建立全球唯一的加密房間，與好友展開實時數據同步對局。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <button
                onClick={handleHostRoom}
                disabled={isGenerating}
                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex flex-col items-center overflow-hidden"
              >
                {isGenerating ? (
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                )}
                <span className="mt-4 font-black tracking-widest text-sm uppercase">建立房間</span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>

              <button
                onClick={handleJoinRoom}
                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex flex-col items-center overflow-hidden"
              >
                <QrCode className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="mt-4 font-black tracking-widest text-sm uppercase">加入房間</span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
            </div>
          </motion.div>
        )}

        {/* 2. 房長介面 (顯示 QR Code) */}
        {view === 'host' && (
          <motion.div
            key="host"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center w-full px-6"
          >
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-[10px] font-black text-blue-400 tracking-[0.5em] uppercase">
                  加密房間已開啟
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                等待玩家加入
              </h2>
            </div>

            {/* QR Code 顯示區 */}
            <div className="relative mb-10 p-4 bg-white rounded-3xl shadow-[0_0_80px_rgba(255,255,255,0.1)] border-8 border-slate-900 group">
              <QRCodeSVG
                value={roomKey}
                size={220}
                level="H"
                includeMargin={true}
                fgColor="#020617"
              />
              {/* 掃描線動畫 */}
              <div className="absolute inset-0 bg-blue-500/5 overflow-hidden rounded-2xl pointer-events-none">
                <div className="w-full h-[2px] bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] absolute top-0 animate-[scan_3s_linear_infinite]" />
              </div>
            </div>

            {/* 亂碼金鑰顯示 */}
            <div className="mb-10 p-4 bg-black/40 border border-white/5 rounded-2xl w-full max-w-sm">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
                加密房間密鑰 (Room Key)
              </p>
              <div className="text-xs font-mono text-blue-400 break-all text-center tracking-widest bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                {roomKey}
              </div>
            </div>

            {/* 玩家列表 */}
            <div className="w-full max-w-xs space-y-3 mb-12">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">
                目前玩家 ({participants.length} / 4)
              </h4>
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl"
                >
                  <span className="text-xs font-bold text-slate-300">{p.name}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-4">
              <button
                onClick={() => setView('selection')}
                className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
              >
                <LogOut size={16} />
                關閉房間
              </button>
              <button
                onClick={() => onStartGame(roomKey)}
                disabled={participants.length < 1}
                className="flex items-center gap-2 px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95 text-xs font-black uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none"
              >
                <Play size={16} />
                開始遊戲
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. 房員介面 (等待掃描 - 未來實作) */}
        {view === 'guest' && (
          <motion.div
            key="guest"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center w-full px-6"
          >
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
                加入加密房間
              </h2>
              <p className="text-slate-500 text-[10px] tracking-widest">
                請掃描房長手機螢幕上的 QR CODE
              </p>
            </div>

            <div className="w-64 h-64 border-2 border-dashed border-emerald-500/30 rounded-3xl flex items-center justify-center bg-emerald-500/5 mb-12 relative overflow-hidden">
              <QrCode className="w-16 h-16 text-emerald-500/20" />
              <div className="absolute inset-4 border-2 border-emerald-500 rounded-2xl opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent animate-pulse" />
            </div>

            <button
              onClick={() => setView('selection')}
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft size={16} />
              取消返回
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes scan {
          0% {
            top: 0%;
          }
          100% {
            top: 100%;
          }
        }
        .text-glow {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
