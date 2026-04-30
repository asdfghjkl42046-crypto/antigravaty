'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Shield,
  Briefcase,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Feather,
} from 'lucide-react';
import gsap from 'gsap';
import { StartPath, BribeItem } from '@/types/game';
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

export default function PVPRegistrationScreen({
  roomKey,
  onFinalStart,
  onBack,
}: PVPRegistrationScreenProps) {
  // --- 狀態定義 (完全照抄單機版) ---
  const [currentName, setCurrentName] = useState('');
  const [currentOwnerName, setCurrentOwnerName] = useState('');
  const [selectedPath, setSelectedPath] = useState<StartPath | null>(null);
  const [isBookFocused, setIsBookFocused] = useState(false);
  const [showBribeModal, setShowBribeModal] = useState(false);
  const [selectedBribe, setSelectedBribe] = useState<BribeItem | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(0);

  // --- PVP 擴充狀態 ---
  const [dbRoomId, setDbRoomId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<PlayerRecord[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // 初始化
  useEffect(() => {
    const savedId = sessionStorage.getItem('antigravaty_player_id');
    setMyPlayerId(savedId);

    const init = async () => {
      const { data: room } = await supabase.from('pvp_rooms').select('id').eq('room_key', roomKey).single();
      if (room) setDbRoomId(room.id);
    };
    init();

    // 進場動畫
    gsap.fromTo('.ui-fade-in', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
  }, [roomKey]);

  // 實時監聽與自動開始
  useEffect(() => {
    if (!dbRoomId || !myPlayerId) return;

    const fetchPlayers = async () => {
      const { data } = await supabase.from('pvp_players').select('*').eq('room_id', dbRoomId);
      if (data) {
        setParticipants(data);
        const me = data.find((p: PlayerRecord) => p.id === myPlayerId);
        if (me) {
          setIsHost(me.role === 'host');
          setIsReady(me.is_ready);
        }

        // --- 自動開始偵測 (房長執行) ---
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
  }, [dbRoomId, myPlayerId]);

  // 提交到 Supabase
  const handleSubmit = async () => {
    if (!myPlayerId) return;
    
    // 如果選了後門或黑箱，需要先選賄賂 (照抄單機)
    if (selectedPath !== 'normal' && !selectedBribe) {
      setShowBribeModal(true);
      return;
    }

    await supabase.from('pvp_players').update({
      owner_name: currentOwnerName || '未命名業主',
      company_name: currentName || '未命名企業',
      avatar_id: selectedAvatarId.toString(),
      background_card: selectedPath,
      is_ready: true
    }).eq('id', myPlayerId);
    
    setIsBookFocused(false);
  };

  const readyCount = participants.filter(p => p.is_ready).length;
  const totalCount = participants.length;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#020617] text-white font-sans relative overflow-hidden">
      {/* 玩家進度 */}
      <div className="absolute top-8 right-8 z-50 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black tracking-widest text-[10px]">
        玩家 {readyCount} / {totalCount}
      </div>

      {!isBookFocused ? (
        /* --- 註冊主畫面 (100% 照抄單機 UI) --- */
        <div className="w-full h-full flex flex-col items-center justify-start pt-16 mt-safe px-6 ui-fade-in">
          {/* 輸入框 */}
          <div className="w-full max-w-[360px] flex flex-col gap-4 mb-8">
            <div className="relative">
              <input
                type="text"
                value={currentOwnerName}
                onChange={(e) => setCurrentOwnerName(e.target.value)}
                placeholder="請輸入業主姓名"
                className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:border-blue-500/50 transition-all"
              />
              <Feather className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            </div>
            <div className="relative">
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="請輸入企業名稱"
                className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:border-blue-500/50 transition-all"
              />
              <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
            </div>
          </div>

          {/* 頭像網格 */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {MASTERPIECES.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedAvatarId(m.id)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedAvatarId === m.id ? 'border-amber-400 scale-110 shadow-lg' : 'border-white/5 grayscale opacity-40'}`}
              >
                <img src={m.url} alt={m.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="text-center mb-10">
             <div className="text-amber-400 font-black tracking-[0.3em] italic uppercase text-sm">
                {MASTERPIECES[selectedAvatarId].title}
             </div>
             <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">
                {MASTERPIECES[selectedAvatarId].author}
             </div>
          </div>

          {/* 卡片區域 (100% 複製單機版精準參數) */}
          <div className="relative w-full max-w-[500px] h-[300px] flex items-center justify-center transform-style-3d">
            {(['normal', 'backdoor', 'blackbox'] as StartPath[]).map((path, idx) => {
               const isSelected = selectedPath === path;
               const rotations = [-18, 0, 18];
               const offsets = [-95, 0, 95];

               return (
                 <div
                   key={path}
                   onClick={() => setSelectedPath(path)}
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
                       backgroundColor: path === 'normal' ? '#7a4225' : path === 'backdoor' ? '#162b4d' : '#3d0c0c',
                       backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%), url("https://www.transparenttextures.com/patterns/leather.png")',
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

          {/* 底部按鈕 */}
          <div className={`flex flex-col items-center gap-6 transition-all duration-700 mt-8 ${selectedPath ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}>
            {isReady ? (
              <div className="px-14 py-5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full font-black tracking-[0.2em] animate-pulse shadow-2xl backdrop-blur-xl">
                等待對手完成...
              </div>
            ) : (
              <button
                onClick={() => selectedPath && setIsBookFocused(true)}
                className="flex items-center gap-4 bg-white text-black font-black px-14 py-5 rounded-full tracking-[0.5em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
              >
                <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                翻閱卷宗檔案
              </button>
            )}
          </div>
        </div>
      ) : (
        /* --- 讀書模式 (徹底隔離) --- */
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="absolute top-10 left-10">
             <button onClick={() => setIsBookFocused(false)} className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70">
               <ArrowLeft size={20} />
               <span className="text-xs font-black tracking-widest">返回設定</span>
             </button>
           </div>
           <div className="scale-90 sm:scale-100">
             <ParchmentBook activePath={selectedPath!} onPathChange={() => {}} />
           </div>
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
             <button
               onClick={handleSubmit}
               className="bg-blue-600 text-white font-black px-24 py-6 rounded-2xl tracking-[1em] shadow-[0_0_50px_rgba(37,99,235,0.4)] flex items-center gap-3 group"
             >
               確認
               <ChevronRight className="group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
        </div>
      )}

      {/* 賄賂 Modal (略) */}
      {showBribeModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md">
           <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-md">
              <h3 className="text-xl font-black mb-6 tracking-widest text-center italic">選擇機密賄賂</h3>
              <div className="flex flex-col gap-3">
                 {/* 簡化邏輯... */}
                 <button onClick={handleSubmit} className="w-full py-5 bg-blue-600 rounded-xl font-black mt-4">確認提交</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
