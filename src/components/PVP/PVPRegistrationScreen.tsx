'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Scale,
  Shield,
  Briefcase,
  ChevronRight,
  Wallet,
  Coins,
  Gem,
  Award,
  Feather,
  Wine,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import gsap from 'gsap';
import { PlayerConfig, StartPath, BribeItem } from '@/types/game';
import { SYSTEM_STRINGS } from '@/data/SystemStrings';
import ParchmentBook from '../ParchmentBook'; 
import { MASTERPIECES } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';

interface PVPRegistrationScreenProps {
  roomKey: string;
  onFinalStart: () => void;
  onBack: () => void;
}

interface PlayerRecord {
  id: string;
  room_id: string;
  role: 'host' | 'guest';
  is_ready: boolean;
}

/**
 * PVP 版註冊介面 - [核心邏輯複製自 PlayerRegistrationScreen.tsx]
 * 確保 UI/UX 與單機版 100% 相同，僅增加多機同步機制。
 */
export default function PVPRegistrationScreen({
  roomKey,
  onFinalStart,
  onBack,
}: PVPRegistrationScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- 狀態全量複製自單機版 ---
  const [currentName, setCurrentName] = useState(SYSTEM_STRINGS.REGISTRATION.DEFAULT_CORP_NAME);
  const [currentOwnerName, setCurrentOwnerName] = useState(SYSTEM_STRINGS.REGISTRATION.DEFAULT_OWNER_NAME);
  const [selectedPath, setSelectedPath] = useState<StartPath | null>(null);
  const [isBookFocused, setIsBookFocused] = useState(false);
  const [showBribeModal, setShowBribeModal] = useState(false);
  const [selectedBribe, setSelectedBribe] = useState<BribeItem | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(0);
  const [isReady, setIsReady] = useState(false); // 在 PVP 中這代表「我是否已按下準備」

  // --- PVP 專用狀態 ---
  const [dbRoomId, setDbRoomId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<PlayerRecord[]>([]);

  // --- 賄賂清單全量複製 ---
  const BRIBE_OPTIONS: {
    id: BribeItem;
    name: string;
    icon: React.ElementType;
    color: string;
    glow: string;
  }[] = [
    {
      id: 'antique',
      name: SYSTEM_STRINGS.REGISTRATION.BRIBES.antique,
      icon: Shield,
      color: 'text-amber-400',
      glow: 'rgba(251, 191, 36, 0.4)',
    },
    {
      id: 'crypto',
      name: SYSTEM_STRINGS.REGISTRATION.BRIBES.crypto,
      icon: Wallet,
      color: 'text-cyan-400',
      glow: 'rgba(34, 211, 238, 0.4)',
    },
    {
      id: 'art',
      name: SYSTEM_STRINGS.REGISTRATION.BRIBES.art,
      icon: Gem,
      color: 'text-fuchsia-400',
      glow: 'rgba(217, 70, 239, 0.4)',
    },
    {
      id: 'wine',
      name: SYSTEM_STRINGS.REGISTRATION.BRIBES.wine,
      icon: Wine,
      color: 'text-rose-400',
      glow: 'rgba(244, 63, 94, 0.4)',
    },
    {
      id: 'intel',
      name: SYSTEM_STRINGS.REGISTRATION.BRIBES.intel,
      icon: Award,
      color: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
  ];

  // 1. 初始化與動畫 [對齊單機]
  useEffect(() => {
    const savedId = sessionStorage.getItem('antigravaty_player_id');
    setMyPlayerId(savedId);

    const init = async () => {
      const { data: room } = await supabase.from('pvp_rooms').select('id').eq('room_key', roomKey).single();
      if (room) setDbRoomId(room.id);
    };
    init();

    gsap.fromTo(
      '.ui-fade-in',
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      }
    );
  }, [roomKey]);

  // 2. PVP 監聽邏輯
  useEffect(() => {
    if (!dbRoomId || !myPlayerId) return;

    const fetchPlayers = async () => {
      const { data } = await supabase.from('pvp_players').select('*').eq('room_id', dbRoomId);
      if (data) {
        setParticipants(data);
        const me = data.find((p: PlayerRecord) => p.id === myPlayerId);
        if (me) setIsReady(me.is_ready);

        const readyCount = data.filter((p: PlayerRecord) => p.is_ready).length;
        if (me?.role === 'host' && data.length > 0 && readyCount === data.length) {
          await supabase.from('pvp_rooms').update({ status: 'playing' }).eq('id', dbRoomId);
        }
      }
    };

    fetchPlayers();

    const channel = supabase.channel(`pvp-reg-${dbRoomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pvp_players', filter: `room_id=eq.${dbRoomId}` }, () => fetchPlayers())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pvp_rooms', filter: `id=eq.${dbRoomId}` }, (p: any) => {
        if (p.new.status === 'playing') onFinalStart();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dbRoomId, myPlayerId, onFinalStart]);

  // 3. 提交邏輯 [將單機的 onConfirm 改為 Supabase 寫入]
  const submitRegistration = async (bribe?: BribeItem) => {
    if (!myPlayerId || !supabase) return;
    
    try {
      const { error } = await supabase.from('pvp_players').update({
        display_name: currentName.trim() || SYSTEM_STRINGS.REGISTRATION.DEFAULT_CORP_NAME,
        owner_name: currentOwnerName.trim() || SYSTEM_STRINGS.REGISTRATION.DEFAULT_OWNER_NAME,
        avatar_id: selectedAvatarId.toString(),
        background_card: selectedPath,
        bribe_item: bribe || selectedBribe || null,
        is_ready: true
      }).eq('id', myPlayerId);

      if (error) {
        console.error('[PVP] Registration Update Failed:', error);
        return;
      }
      
      setIsBookFocused(false);
      setShowBribeModal(false);
    } catch (err) {
      console.error('[PVP] Registration Unexpected Error:', err);
    }
  };

  const handlePathSelect = (path: StartPath) => {
    if (!isReady) setSelectedPath(path);
  };

  const handleConfirmRegistration = () => {
    if (!selectedPath) return;
    if (selectedPath !== 'normal' && !selectedBribe) {
      setShowBribeModal(true);
      return;
    }
    submitRegistration();
  };

  const handleBribeSelect = (bribe: BribeItem) => {
    if (!isReady) setSelectedBribe(bribe);
  };

  const handleFinalConfirm = () => {
    if (!selectedBribe) return;
    submitRegistration(selectedBribe);
  };

  const transactionId = useMemo(() => 'TR-REG-7742', []);
  const readyCount = participants.filter(p => p.is_ready).length;
  const totalPlayers = participants.length;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent overflow-visible text-white font-sans selection:bg-blue-500/30">
      {/* 桌面背景 [對齊單機] */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-transparent" />
        <div className="absolute inset-0 opacity-40 bg-[url('/assets/textures/leather.png')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-black/80" />
      </div>

      {/* PVP 準備標記 [僅有的差異點] */}
      <div className="absolute top-6 right-6 mt-safe px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold tracking-[0.2em] z-50 text-[10px] ui-fade-in shadow-xl backdrop-blur-md">
        準備人數 {readyCount} / {totalPlayers}
      </div>

      <div
        className={`relative z-10 w-full max-w-7xl h-full flex flex-col items-center ${
          isBookFocused ? 'justify-center pt-0' : 'justify-start pt-16 mt-safe'
        } pb-10 transition-all duration-700`}
      >
        {/* 1. 企業命名 [對齊單機] */}
        {!isBookFocused && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-[360px] px-6 mb-4 ui-fade-in transition-all duration-700 ease-out flex flex-col gap-4">
              <div className="relative group">
                <input
                  type="text"
                  value={currentOwnerName}
                  onChange={(e) => setCurrentOwnerName(e.target.value)}
                  placeholder={SYSTEM_STRINGS.REGISTRATION.OWNER_PLACEHOLDER}
                  disabled={isReady}
                  className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900/90 transition-all outline-none backdrop-blur-xl shadow-2xl disabled:opacity-50"
                />
                <Feather className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-blue-500/50 transition-colors" />
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  placeholder={SYSTEM_STRINGS.REGISTRATION.CORP_PLACEHOLDER}
                  disabled={isReady}
                  className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900/90 transition-all outline-none backdrop-blur-xl shadow-2xl disabled:opacity-50"
                />
                <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-blue-500/50 transition-colors" />
              </div>
            </div>

            {/* 名畫頭像選取 [對齊單機] */}
            <div className="w-full max-w-4xl px-6 mb-2 ui-fade-in">
              <div className="flex flex-col items-center gap-6">
                <div className="grid grid-cols-5 gap-3 sm:gap-4">
                  {MASTERPIECES.map((m) => {
                    const isSelected = selectedAvatarId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => !isReady && setSelectedAvatarId(m.id)}
                        className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 active:scale-95' : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-105'}`}
                      >
                        <div
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${isSelected ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-white/10 group-hover:border-white/30'}`}
                        >
                          <img
                            src={m.url}
                            alt={m.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-0 duration-300">
                            <Gem size={10} className="text-black" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="h-6 flex flex-col items-center">
                  <span className="text-sm font-bold text-amber-400 tracking-[0.3em] animate-in fade-in slide-in-from-top-1">
                    {MASTERPIECES[selectedAvatarId].title}
                  </span>
                  <span className="text-[9px] text-white/30 tracking-tighter uppercase">
                    {MASTERPIECES[selectedAvatarId].author}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 交互區 [對齊單機] */}
        {!isBookFocused ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-12 ui-fade-in px-4 mt-12 [perspective:1200px]">
            <div className="relative w-full max-w-[500px] h-[300px] flex items-center justify-center transform-style-3d">
              {(['normal', 'backdoor', 'blackbox'] as StartPath[]).map((path, idx) => {
                const isSelected = selectedPath === path;
                const rotations = [-18, 0, 18];
                const offsets = [-95, 0, 95];

                return (
                  <div
                    key={path}
                    onClick={() => handlePathSelect(path)}
                    className={`absolute cursor-pointer transition-all duration-500 ease-out transform-style-3d
                       ${isSelected ? 'z-30' : 'z-10 brightness-60 hover:brightness-100 scale-95'}
                     `}
                    style={{
                      transform: `translate3d(${offsets[idx]}px, ${isSelected ? -60 : 0}px, ${isSelected ? 120 : 0}px) rotateZ(${rotations[idx]}deg) scale(${isSelected ? 1.1 : 1})`,
                    }}
                  >
                    <div
                      className="w-[145px] h-[200px] rounded-xl shadow-[0_40px_80px_rgba(0,0,0,1)] border-r-8 border-black/60 relative overflow-hidden flex flex-col items-center justify-center p-4"
                      style={{
                        backgroundColor:
                          path === 'normal'
                            ? '#7a4225'
                            : path === 'backdoor'
                              ? '#162b4d'
                              : '#3d0c0c',
                        backgroundImage:
                          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%), url("/assets/textures/leather.png")',
                      }}
                    >
                      <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md shadow-inner">
                          {path === 'normal' ? (
                            <Scale className="w-7 h-7 text-white/50" />
                          ) : path === 'backdoor' ? (
                            <Shield className="w-7 h-7 text-white/50" />
                          ) : (
                            <Feather className="w-7 h-7 text-white/50" />
                          )}
                        </div>
                        <h4 className="text-xl font-black tracking-[0.2em] text-white/90 uppercase">
                          {SYSTEM_STRINGS.SETUP.START_PATH_NAMES[path]}
                        </h4>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-blue-500/40 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`flex flex-col items-center gap-6 transition-all duration-700 ${selectedPath ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
            >
              {isReady ? (
                 <div className="px-14 py-5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full font-black tracking-[0.2em] animate-pulse shadow-2xl backdrop-blur-xl">
                    等待對手完成設定...
                 </div>
              ) : (
                <button
                  onClick={() => setIsBookFocused(true)}
                  className="flex items-center gap-4 bg-white text-black font-black px-14 py-5 rounded-full tracking-[0.5em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
                >
                  <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  {SYSTEM_STRINGS.REGISTRATION.OPEN_BOOK_BTN}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* 讀書模式 [對齊單機] */
          <div className="w-full h-full flex items-center justify-center relative animate-in zoom-in-95 duration-700 ease-out">
            <div className="absolute top-10 left-10 z-[100] ui-fade-in">
              <button
                onClick={() => setIsBookFocused(false)}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white/70 hover:text-white hover:bg-slate-800 transition-all active:scale-95 group backdrop-blur-xl shadow-2xl"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black tracking-[0.3em] uppercase">{SYSTEM_STRINGS.REGISTRATION.BACK_TO_SELECT}</span>
              </button>
            </div>
            <div className="w-full flex justify-center scale-90 transition-transform duration-700">
              <ParchmentBook
                key={selectedPath}
                activePath={selectedPath!}
                onPathChange={() => {}}
              />
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
              <button
                onClick={handleConfirmRegistration}
                className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-black px-12 py-4 rounded-xl tracking-[0.8em] border border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all active:scale-95 flex items-center gap-2 group backdrop-blur-md"
              >
                {SYSTEM_STRINGS.REGISTRATION.CONFIRM_BTN}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ⚠️ 賄賂選擇彈窗 [全量對齊單機] */}
      {showBribeModal && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/95 p-4">
          <div className="relative w-full max-w-[420px] max-h-[90%] bg-[#0a0a0b] border-l border-t border-white/5 rounded-sm p-8 shadow-[0_60px_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col items-start px-8">
            <div
              className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
              style={{
                backgroundImage: 'url("/assets/textures/leather.png")',
                backgroundSize: '40px',
              }}
            />

            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/60 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-[1px] h-32 bg-gradient-to-b from-cyan-500/40 to-transparent" />

            <div className="flex flex-col mb-6 flex-shrink-0 z-10 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-cyan-500 animate-pulse" />
                <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.4em]">
                  {SYSTEM_STRINGS.REGISTRATION.BRIBE_MODAL.VERSION}
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-widest text-white uppercase mb-2">
                {SYSTEM_STRINGS.REGISTRATION.BRIBE_MODAL.TITLE}
              </h3>
              <div className="w-12 h-[1px] bg-white/10" />
            </div>

            <div className="flex-1 w-full flex flex-col gap-3 mb-6 overflow-y-auto pr-2 z-10 custom-scrollbar min-h-0">
              {BRIBE_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => !isReady && handleBribeSelect(opt.id)}
                  className={`relative flex items-center gap-4 p-4 transition-all cursor-pointer group border-l-2 ${
                    selectedBribe === opt.id
                      ? 'border-cyan-500 bg-cyan-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className={`p-3 rounded-sm ${opt.color} bg-white/5 shadow-inner flex-shrink-0 transition-transform group-hover:scale-110`}>
                    <opt.icon className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="font-black tracking-[0.2em] text-[15px] text-white/90 uppercase">
                      {opt.name}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      {SYSTEM_STRINGS.REGISTRATION.BRIBE_MODAL.VALUATION}
                    </span>
                  </div>

                  {selectedBribe === opt.id && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  )}
                </div>
              ))}
            </div>

            <div className={`w-full transition-all duration-700 ease-out flex-shrink-0 z-10 ${selectedBribe ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <button
                onClick={handleFinalConfirm}
                disabled={!selectedBribe || isReady}
                className="w-full py-5 bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 font-black rounded-sm tracking-[0.6em] shadow-[0_20px_40px_rgba(0,0,0,0.5)] active:scale-95 transition-all text-xs uppercase flex items-center justify-center gap-2"
              >
                <span>{SYSTEM_STRINGS.REGISTRATION.BRIBE_MODAL.START_GAME}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="absolute bottom-4 left-10 right-10 flex justify-between opacity-10 pointer-events-none">
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase">AUTH_LEVEL_04</span>
              <span className="text-[8px] font-mono font-bold tracking-widest uppercase">TR_ID_{transactionId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
