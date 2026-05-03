'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, ArrowLeft, RefreshCw, LogOut, Play, QrCode, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SYSTEM_STRINGS } from '@/data/SystemStrings';
import { useGameStore } from '@/store/gameStore';

interface LobbyScreenProps {
  onBack: () => void;
  onStartGame: (roomKey: string) => void;
}

interface PlayerRecord {
  id: string;
  room_id: string;
  role: 'host' | 'guest';
  display_name: string;
  is_ready: boolean;
  created_at: string;
}

/**
 * 多機連線大廳 (Lobby)
 * 負責創房、進房、顯示極限亂碼 QR Code。
 */
export default function LobbyScreen({ onBack, onStartGame }: LobbyScreenProps) {
  const [view, setView] = useState<'selection' | 'host' | 'guest' | 'guest_waiting'>('selection');
  const [roomKey, setRoomKey] = useState('');
  const [participants, setParticipants] = useState<{ id: string; name: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [dbRoomId, setDbRoomId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  // 引入同步控制
  const setSyncing = useGameStore(s => (s as any).setSyncing);

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

  const handleHostRoom = async () => {
    setIsGenerating(true);
    const key = generateChaoticKey();
    
    if (!supabase) {
      alert(SYSTEM_STRINGS.LOBBY.ERRORS.SUPABASE_MISSING);
      setIsGenerating(false);
      return;
    }

    try {
      // 1. 在 Supabase 建立房間
      const { data: room, error: roomError } = await supabase
        .from('pvp_rooms')
        .insert([{ room_key: key, status: 'waiting' }])
        .select()
        .single();

      if (roomError) throw roomError;
      setDbRoomId(room.id);
      setRoomKey(key);

      // 2. 將自己加入玩家列表 (不寫死名稱，靠 ID 判斷)
      const { data: players, error: playerError } = await supabase
        .from('pvp_players')
        .insert([{ room_id: room.id, role: 'host', display_name: 'Host' }])
        .select('*');

      if (playerError || !players || players.length === 0) {
        console.error('Player insertion failed:', playerError);
        throw playerError || new Error('無法把自己加入房間');
      }

      setMyPlayerId(players[0].id);
      sessionStorage.setItem('antigravaty_player_id', players[0].id);
      console.log('Host created successfully, ID:', players[0].id);

      setView('host');
    } catch (err) {
      console.error('Failed to create room:', err);
      alert(SYSTEM_STRINGS.LOBBY.ERRORS.INSERT_FAIL);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinRoom = () => {
    setView('guest');
    setScanStatus('idle');
  };

  // 掃描邏輯實作
  const startScanning = async () => {
    if (!scannerRef.current) {
      const html5QrCode = new Html5Qrcode('reader-lobby');
      scannerRef.current = html5QrCode;
    }

    try {
      setIsCameraActive(true);
      setScanStatus('scanning');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, aspectRatio: 1.0 },
        (decodedText) => {
          handleJoinSuccess(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Lobby scan failed:', err);
      setIsCameraActive(false);
      setScanStatus('error');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsCameraActive(false);
    }
  };

  const handleJoinSuccess = async (key: string) => {
    setScanStatus('success');
    await stopScanning();
    setRoomKey(key);

    if (!supabase) {
      alert(SYSTEM_STRINGS.LOBBY.ERRORS.SUPABASE_MISSING);
      setView('selection');
      return;
    }

    try {
      // 1. 查找房間
      const { data: room, error: roomError } = await supabase
        .from('pvp_rooms')
        .select('id')
        .eq('room_key', key)
        .single();

      if (roomError || !room) throw new Error('找不到房間');
      setDbRoomId(room.id);

      // 2. 加入房間
      const { data: players, error: playerError } = await supabase
        .from('pvp_players')
        .insert([{ room_id: room.id, role: 'guest', display_name: 'Player' }])
        .select('*');

      if (playerError || !players || players.length === 0) {
        console.error('Guest join failed:', playerError);
        throw playerError || new Error('加入玩家列表失敗');
      }

      setMyPlayerId(players[0].id);
      sessionStorage.setItem('antigravaty_player_id', players[0].id);
      console.log('Guest joined successfully, ID:', players[0].id);

      setView('guest_waiting');
    } catch (err) {
      console.error('Join failed:', err);
      alert(SYSTEM_STRINGS.LOBBY.ERRORS.ROOM_NOT_FOUND);
      setView('selection');
    }
  };

  // 實時監聽邏輯
  useEffect(() => {
    if (!dbRoomId || !supabase) return;

    // 用 ref 存最新的 myPlayerId，避免 closure 問題
    const currentMyPlayerId = myPlayerId;

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('pvp_players')
        .select('*')
        .eq('room_id', dbRoomId);

      if (error) {
        console.error('Fetch players error:', error);
        return;
      }

      if (data) {
        const formatted = (data as PlayerRecord[]).map((p: PlayerRecord) => ({
          id: p.id,
          name: p.id === currentMyPlayerId ? SYSTEM_STRINGS.LOBBY.SELF_MARK : SYSTEM_STRINGS.LOBBY.OTHER_MARK,
        }));
        setParticipants(formatted);
      }
    };

    // 立即抓一次
    fetchPlayers();

    // Supabase Realtime：任何玩家進出都即時更新
    const playerChannel = supabase
      .channel(`lobby-players-${dbRoomId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pvp_players', filter: `room_id=eq.${dbRoomId}` },
        () => fetchPlayers()
      )
      .subscribe((status: string) => {
        // 訂閱成功後再抓一次，確保加入瞬間就看到最新人數
        if (status === 'SUBSCRIBED') fetchPlayers();
      });

    // 監聽房間狀態（房長按開始）
    const roomChannel = supabase
      .channel(`lobby-room-${dbRoomId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pvp_rooms', filter: `id=eq.${dbRoomId}` },
        async (payload: { new: { status: string } }) => {
          if (payload.new.status === 'preparing') {
            // [客機啟動同步]
            setSyncing(true, "收到開戰訊號", "正在連接至主機節點...");
            await new Promise(r => setTimeout(r, 1000));
            onStartGame(roomKey);
            setSyncing(false);
          }
        }
      )
      .subscribe();

    // 保底輪詢：每 2 秒補一次（應對 WebSocket 偶發延遲）
    const pollInterval = setInterval(fetchPlayers, 2000);

    return () => {
      supabase.removeChannel(playerChannel);
      supabase.removeChannel(roomChannel);
      clearInterval(pollInterval);
    };
  }, [dbRoomId, myPlayerId, roomKey, onStartGame, setSyncing]);

  // 房長啟動遊戲的聯網處理
  const handleHostStartGame = async () => {
    if (!dbRoomId || !supabase) return;
    
    // [房長啟動同步]
    setSyncing(true, "建立宇宙中", "正在廣播同步訊號至所有節點...");

    const { error } = await supabase
      .from('pvp_rooms')
      .update({ status: 'preparing' })
      .eq('id', dbRoomId);
    
    if (error) {
      console.error('Start game failed:', error);
      alert('啟動失敗');
      setSyncing(false);
      return;
    }

    await new Promise(r => setTimeout(r, 1000));
    onStartGame(roomKey);
    setSyncing(false);
  };

  useEffect(() => {
    if (view === 'guest') {
      startScanning();
    } else {
      stopScanning();
    }
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [view]);

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
              {SYSTEM_STRINGS.LOBBY.TITLE}
            </h2>
            <p className="text-slate-500 text-center mb-12 text-sm leading-relaxed tracking-wider">
              {SYSTEM_STRINGS.LOBBY.DESC}
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
                <span className="mt-4 font-black tracking-widest text-sm uppercase">{SYSTEM_STRINGS.LOBBY.CREATE_ROOM}</span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>

              <button
                onClick={handleJoinRoom}
                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all flex flex-col items-center overflow-hidden"
              >
                <QrCode className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="mt-4 font-black tracking-widest text-sm uppercase">{SYSTEM_STRINGS.LOBBY.JOIN_ROOM}</span>
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
                  {SYSTEM_STRINGS.LOBBY.ROOM_OPENED}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                {SYSTEM_STRINGS.LOBBY.WAITING_JOIN.split('...')[0]}
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

            {/* 玩家列表 */}
            <div className="w-full max-w-xs space-y-3 mb-12">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">
                {SYSTEM_STRINGS.LOBBY.CURRENT_PLAYERS(participants.length)}
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
                {SYSTEM_STRINGS.LOBBY.CLOSE_ROOM}
              </button>
              <button
                onClick={handleHostStartGame}
                disabled={participants.length < 2}
                className="flex items-center gap-2 px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95 text-xs font-black uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none"
              >
                <Play size={16} />
                {SYSTEM_STRINGS.SETUP.MODE_SELECT.START_BTN}
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. 房員介面 (相機掃描) */}
        {view === 'guest' && (
          <motion.div
            key="guest"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center w-full px-6"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
                {SYSTEM_STRINGS.LOBBY.JOIN_ROOM}
              </h2>
              <p className="text-slate-500 text-[10px] tracking-widest uppercase font-bold">
                {SYSTEM_STRINGS.LOBBY.GUEST_GUIDE}
              </p>
            </div>

            {/* 掃描器容器 */}
            <div className="relative w-72 h-72 border-4 border-slate-900 rounded-[40px] overflow-hidden bg-black/40 shadow-[0_0_80px_rgba(0,0,0,0.5)] mb-12">
              <div id="reader-lobby" className="w-full h-full object-cover" />

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-slate-900/90 backdrop-blur-md">
                  <ShieldAlert className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
                  <p className="text-[10px] font-black text-slate-500 mb-6 tracking-widest uppercase">
                    需要相機權限以進行掃描
                  </p>
                  <button
                    onClick={startScanning}
                    className="px-8 py-3 bg-emerald-500 text-black font-black text-xs rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    重新啟動相機
                  </button>
                </div>
              )}

              {/* 掃描線動畫 (Framer Motion 版) */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    className="w-full h-[2px] bg-emerald-400 shadow-[0_0_15px_#10b981] absolute left-0"
                  />
                  {/* 角隅裝飾 */}
                  <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-xl" />
                  <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-xl" />
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-xl" />
                  <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-xl" />
                </div>
              )}

              {/* 掃描成功遮罩 */}
              {scanStatus === 'success' && (
                <div className="absolute inset-0 bg-emerald-500/90 flex flex-col items-center justify-center z-30 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <ShieldCheck className="text-emerald-600 w-10 h-10" />
                  </div>
                  <span className="text-black font-black text-xs tracking-[0.3em] uppercase">
                    {SYSTEM_STRINGS.LOBBY.SUCCESS_JOIN}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setView('selection')}
              className="flex items-center gap-3 px-10 py-4 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <ArrowLeft size={16} />
              取消返回
            </button>
          </motion.div>
        )}

        {/* 4. 房員就緒介面 (等待房長開始) */}
        {view === 'guest_waiting' && (
          <motion.div
            key="guest_waiting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-col items-center w-full px-6"
          >
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">
                  {SYSTEM_STRINGS.LOBBY.CONNECTED}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                {SYSTEM_STRINGS.LOBBY.GUEST_WAITING_MSG}
              </h2>
            </div>

            {/* 裝飾性圖示 (取代 QR Code) */}
            <div className="relative mb-16 p-12 bg-white/[0.03] rounded-full border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)]">
              <Users className="w-20 h-20 text-slate-500 opacity-50" />
              <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
            </div>

            {/* 玩家列表 */}
            <div className="w-full max-w-xs space-y-3 mb-16">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">
                {SYSTEM_STRINGS.LOBBY.CURRENT_PLAYERS(participants.length)}
              </h4>
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl transition-all"
                >
                  <span
                    className={`text-xs font-bold ${p.id === 'me' ? 'text-emerald-400' : 'text-slate-300'}`}
                  >
                    {p.name}
                  </span>
                  {/* 統一使用綠點 */}
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                </div>
              ))}
            </div>

            {/* 操作按鈕 (房員只能離開) */}
            <button
              onClick={() => setView('selection')}
              className="flex items-center gap-3 px-10 py-4 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <LogOut size={16} />
              {SYSTEM_STRINGS.LOBBY.EXIT_ROOM}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        /* 覆蓋 html5-qrcode 函式庫內部樣式 */
        #reader-lobby {
          position: relative !important;
          overflow: hidden !important;
          border: none !important;
          background: #000 !important;
        }
        #reader-lobby video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #reader-lobby__scan_region > br,
        #reader-lobby__dashboard,
        #reader-lobby__header_message,
        #qr-shaded-region {
          display: none !important;
        }
      ` }} />
    </div>
  );
}
