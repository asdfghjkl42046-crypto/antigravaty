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
  display_name: string;
  is_ready: boolean;
  avatar_id: string;
  owner_name: string;
  company_name: string;
}

export default function PVPRegistrationScreen({
  roomKey,
  onFinalStart,
  onBack,
}: PVPRegistrationScreenProps) {
  const [dbRoomId, setDbRoomId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<PlayerRecord[]>([]);
  const [isHost, setIsHost] = useState(false);

  // 本地表單狀態 (照抄單機版)
  const [currentName, setCurrentName] = useState('');
  const [currentOwnerName, setCurrentOwnerName] = useState('');
  const [selectedPath, setSelectedPath] = useState<StartPath | null>(null);
  const [isBookFocused, setIsBookFocused] = useState(false);
  const [showBribeModal, setShowBribeModal] = useState(false);
  const [selectedBribe, setSelectedBribe] = useState<BribeItem | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false); // 這裡指「我」是否按了準備

  // 1. 初始化房間與玩家身份
  useEffect(() => {
    const init = async () => {
      // 根據 roomKey 找房間
      const { data: room } = await supabase
        .from('pvp_rooms')
        .select('id')
        .eq('room_key', roomKey)
        .single();
      
      if (room) {
        setDbRoomId(room.id);
        
        // 抓取當前玩家列表，找到「自己」
        const { data: players } = await supabase
          .from('pvp_players')
          .select('*')
          .eq('room_id', room.id);
        
        if (players) {
          // 在 PVP 環境下，我們假設 Session 只有一個，
          // 但為了簡化，我們先拿第一個 matching 的當作自己 (實際上應該由 Lobby 傳入 myPlayerId)
          // ⚠️ 修正：為了準確，我們從本地存儲或 State 獲取 (這裡先由 participants 判斷)
          setParticipants(players);
          const host = players.find((p: PlayerRecord) => p.role === 'host');
          // 這裡需要改進，應該由父組件傳入 myPlayerId
        }
      }
    };
    init();
  }, [roomKey]);

  // 接收來自 Lobby 的 myPlayerId (待會修改 page.tsx 傳入)
  // 為了現在能動，我們暫時從 sessionStorage 拿
  useEffect(() => {
    const savedId = sessionStorage.getItem('antigravaty_player_id');
    if (savedId) setMyPlayerId(savedId);
  }, []);

  // 2. 實時監聽所有人準備狀態
  useEffect(() => {
    if (!dbRoomId) return;

    const fetchAll = async () => {
      const { data } = await supabase
        .from('pvp_players')
        .select('*')
        .eq('room_id', dbRoomId);
      if (data) {
        setParticipants(data);
        const me = data.find((p: PlayerRecord) => p.id === myPlayerId);
        if (me) {
          setIsHost(me.role === 'host');
          setIsReady(me.is_ready);
        }
      }
    };

    fetchAll();

    const channel = supabase
      .channel(`reg-${dbRoomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pvp_players', filter: `room_id=eq.${dbRoomId}` },
        () => fetchAll()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pvp_rooms', filter: `id=eq.${dbRoomId}` },
        (payload: any) => {
          if (payload.new.status === 'playing') onFinalStart();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [dbRoomId, myPlayerId]);

  const readyCount = participants.filter((p: PlayerRecord) => p.is_ready).length;
  const totalCount = participants.length;
  const allReady = readyCount === totalCount && totalCount > 0;

  // 提交設定
  const handleConfirmRegistration = async () => {
    if (!selectedPath) return;

    if (selectedPath !== 'normal' && !selectedBribe) {
      setShowBribeModal(true);
      return;
    }

    await submitToSupabase();
  };

  const submitToSupabase = async (bribe?: BribeItem) => {
    if (!myPlayerId) return;
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('pvp_players')
      .update({
        owner_name: currentOwnerName || '未命名業主',
        company_name: currentName || '未命名企業',
        avatar_id: selectedAvatarId.toString(),
        is_ready: true,
        background_card: selectedPath
      })
      .eq('id', myPlayerId);

    if (error) {
      alert('更新狀態失敗');
    }
    setIsSubmitting(false);
  };

  const handleFinalConfirm = () => {
    if (!selectedBribe) return;
    submitToSupabase(selectedBribe);
    setShowBribeModal(false);
  };

  // 房長正式啟動遊戲
  const handleHostStartGame = async () => {
    if (!dbRoomId || !allReady) return;
    
    await supabase
      .from('pvp_rooms')
      .update({ status: 'playing' })
      .eq('id', dbRoomId);
  };

  const BRIBE_OPTIONS = [
    { id: 'antique', name: '傳世古董', icon: Shield, color: 'text-amber-400' },
    { id: 'crypto', name: '虛擬貨幣', icon: Wallet, color: 'text-cyan-400' },
    { id: 'art', name: '名家油畫', icon: Gem, color: 'text-fuchsia-400' },
    { id: 'wine', name: '特供紅酒', icon: Wine, color: 'text-rose-400' },
    { id: 'intel', name: '機密情報', icon: Award, color: 'text-emerald-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#020617] overflow-visible text-white font-sans relative">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-black/80" />
      </div>

      {/* 實時進度標記 */}
      <div className="absolute top-6 right-6 mt-safe px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold tracking-[0.2em] z-50 text-[10px] shadow-xl backdrop-blur-md">
        準備進度 {readyCount} / {totalCount}
      </div>

      <div className={`relative z-10 w-full max-w-7xl h-full flex flex-col items-center ${isBookFocused ? 'justify-center pt-0' : 'justify-start pt-16 mt-safe'} pb-10 transition-all duration-700`}>
        {!isBookFocused && (
          <div className="w-full flex flex-col items-center">
            {/* 表單區 */}
            <div className="w-full max-w-[360px] px-6 mb-4 flex flex-col gap-4">
              <div className="relative group">
                <input
                  type="text"
                  value={currentOwnerName}
                  onChange={(e) => setCurrentOwnerName(e.target.value)}
                  placeholder="請輸入業主姓名"
                  disabled={isReady}
                  className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-slate-600 focus:border-blue-500/50 transition-all outline-none backdrop-blur-xl disabled:opacity-50"
                />
                <Feather className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  placeholder="請輸入企業名稱"
                  disabled={isReady}
                  className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-slate-600 focus:border-blue-500/50 transition-all outline-none backdrop-blur-xl disabled:opacity-50"
                />
                <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
              </div>
            </div>

            {/* 頭像選取 */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {MASTERPIECES.map((m) => {
                const isSelected = selectedAvatarId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => !isReady && setSelectedAvatarId(m.id)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-amber-400 scale-110 shadow-lg' : 'border-white/10 grayscale opacity-40'}`}
                  >
                    <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isBookFocused ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-12 [perspective:1200px]">
             {/* 卡片選擇區 (簡化版視覺) */}
             <div className="relative w-full max-w-[500px] h-[260px] flex items-center justify-center transform-style-3d">
              {(['normal', 'backdoor', 'blackbox'] as StartPath[]).map((path, idx) => {
                const isSelected = selectedPath === path;
                const rotations = [-15, 0, 15];
                return (
                  <div
                    key={path}
                    onClick={() => !isReady && setSelectedPath(path)}
                    className={`absolute cursor-pointer transition-all duration-500 ${isSelected ? 'z-30 -translate-y-8 scale-110' : 'z-10 brightness-50'}`}
                    style={{ transform: `translateX(${(idx - 1) * 100}px) rotate(${rotations[idx]}deg)` }}
                  >
                    <div className="w-[130px] h-[180px] rounded-xl border-2 border-white/10 flex flex-col items-center justify-center gap-4"
                         style={{ backgroundColor: path === 'normal' ? '#7a4225' : path === 'backdoor' ? '#162b4d' : '#3d0c0c' }}>
                       {path === 'normal' ? <Scale /> : path === 'backdoor' ? <Shield /> : <Feather />}
                       <span className="text-xs font-bold tracking-widest">{SYSTEM_STRINGS.SETUP.START_PATH_NAMES[path]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-4">
               {!isReady ? (
                 <button
                   onClick={handleConfirmRegistration}
                   className="bg-white text-black font-black px-16 py-5 rounded-full tracking-[0.4em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                 >
                   準備完成
                 </button>
               ) : (
                 <div className="flex flex-col items-center gap-4">
                    <div className="px-8 py-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl font-bold animate-pulse">
                       等待其他玩家中...
                    </div>
                    {isHost && allReady && (
                      <button
                        onClick={handleHostStartGame}
                        className="bg-amber-500 text-black font-black px-16 py-5 rounded-full tracking-[0.4em] hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                      >
                        啟動正式博弈
                      </button>
                    )}
                 </div>
               )}
            </div>
          </div>
        ) : (
          /* 讀書模式 - 精準還原單機版視覺 */
          <div className="w-full h-full flex items-center justify-center relative animate-in zoom-in-95 duration-700 ease-out">
            <div className="absolute top-10 left-10 z-[100]">
              <button
                onClick={() => setIsBookFocused(false)}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-white/70 hover:text-white hover:bg-slate-800 transition-all active:scale-95 group backdrop-blur-xl shadow-2xl"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-black tracking-[0.3em] uppercase">返回選擇</span>
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
                確認
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 賄賂 Modal (照抄) */}
      {showBribeModal && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0b] border border-white/10 rounded-2xl p-8 w-full max-w-[400px] flex flex-col gap-6 shadow-2xl">
            <h3 className="text-xl font-black tracking-widest text-center italic">機密賄賂清單</h3>
            <div className="flex flex-col gap-2">
              {BRIBE_OPTIONS.map(opt => (
                <div key={opt.id} onClick={() => setSelectedBribe(opt.id as BribeItem)}
                     className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${selectedBribe === opt.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}>
                  <opt.icon className={opt.color} />
                  <span className="font-bold">{opt.name}</span>
                </div>
              ))}
            </div>
            <button onClick={handleFinalConfirm} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl tracking-[0.5em] disabled:opacity-30" disabled={!selectedBribe}>
              確認提交
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
