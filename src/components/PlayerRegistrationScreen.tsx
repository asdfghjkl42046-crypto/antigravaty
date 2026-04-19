'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { START_PATH_NAMES } from '@/data/setup/SetupData';
import ParchmentBook from './ParchmentBook';
import { MASTERPIECES } from '@/store/gameStore';

interface PlayerRegistrationScreenProps {
  playerIndex: number;
  totalPlayers: number;
  onConfirm: (config: PlayerConfig) => void;
  onBack: () => void;
}

export default function PlayerRegistrationScreen({
  playerIndex,
  totalPlayers,
  onConfirm,
  onBack,
}: PlayerRegistrationScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentName, setCurrentName] = useState('');
  const [currentOwnerName, setCurrentOwnerName] = useState('');
  const [selectedPath, setSelectedPath] = useState<StartPath | null>(null);
  const [isBookFocused, setIsBookFocused] = useState(false); // 決定書是否放大可翻動
  const [showBribeModal, setShowBribeModal] = useState(false);
  const [selectedBribe, setSelectedBribe] = useState<BribeItem | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  const BRIBE_OPTIONS: { id: BribeItem; name: string; icon: any; color: string; glow: string }[] = [
    {
      id: 'antique',
      name: '傳世古董',
      icon: Shield,
      color: 'text-amber-400',
      glow: 'rgba(251, 191, 36, 0.4)',
    },
    {
      id: 'crypto',
      name: '虛擬貨幣',
      icon: Wallet,
      color: 'text-cyan-400',
      glow: 'rgba(34, 211, 238, 0.4)',
    },
    {
      id: 'art',
      name: '名家油畫',
      icon: Gem,
      color: 'text-fuchsia-400',
      glow: 'rgba(217, 70, 239, 0.4)',
    },
    {
      id: 'wine',
      name: '特供紅酒',
      icon: Wine,
      color: 'text-rose-400',
      glow: 'rgba(244, 63, 94, 0.4)',
    },
    {
      id: 'intel',
      name: '機密情報',
      icon: Award,
      color: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
  ];

  useEffect(() => {
    setCurrentName('');
    setCurrentOwnerName('');
    setSelectedPath(null);
    setIsBookFocused(false);
    setSelectedBribe(null);
    setIsReady(false);

    gsap.fromTo(
      '.ui-fade-in',
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        onComplete: () => setIsReady(true),
      }
    );
  }, [playerIndex]);

  const handlePathSelect = (path: StartPath) => {
    setSelectedPath(path);
  };

  const handleConfirmRegistration = () => {
    if (!selectedPath) return;

    if (selectedPath !== 'normal' && !selectedBribe) {
      setShowBribeModal(true);
      return;
    }

    onConfirm({
      name: currentName.trim() || `企業 ${playerIndex}`,
      ownerName: currentOwnerName.trim() || `業主 ${playerIndex}`,
      path: selectedPath,
      bribeItem: selectedBribe || undefined,
      avatarId: selectedAvatarId,
    });
  };

  const handleBribeSelect = (bribe: BribeItem) => {
    setSelectedBribe(bribe);
  };

  const handleFinalConfirm = () => {
    if (!selectedBribe) return;
    
    onConfirm({
      name: currentName.trim() || `企業 ${playerIndex}`,
      ownerName: currentOwnerName.trim() || `業主 ${playerIndex}`,
      path: selectedPath!,
      bribeItem: selectedBribe,
      avatarId: selectedAvatarId,
    });
    setShowBribeModal(false);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#020617] overflow-hidden text-white font-sans selection:bg-blue-500/30">
      {/* 桌面背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#020617]" />
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-black/80" />
      </div>

      {/* 玩家標記 - 移至遠端右上角，避免衝突 */}
      <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-bold tracking-[0.2em] z-50 text-[10px] ui-fade-in shadow-xl backdrop-blur-md">
        玩家 {playerIndex} / {totalPlayers}
      </div>

      <div
        className={`relative z-10 w-full max-w-7xl h-full flex flex-col items-center ${
          isBookFocused ? 'justify-center pt-0' : 'justify-start pt-16'
        } overflow-hidden pb-10 transition-all duration-700`}
      >
        {/* 1. 企業命名 - 響應式寬度與間距 */}
        {!isBookFocused && (
          <div className="w-full flex flex-col items-center">
            {/* 企業與業主命名 */}
            <div className="w-full max-w-[360px] px-6 mb-4 ui-fade-in transition-all duration-700 ease-out flex flex-col gap-4">
              <div className="relative group">
                <input
                  type="text"
                  value={currentOwnerName}
                  onChange={(e) => setCurrentOwnerName(e.target.value)}
                  placeholder="請輸入業主姓名"
                  className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900/90 transition-all outline-none backdrop-blur-xl shadow-2xl"
                />
                <Feather className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-blue-500/50 transition-colors" />
              </div>
              <div className="relative group">
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  placeholder="請輸入企業名稱"
                  className="w-full bg-slate-900/60 border-2 border-white/10 rounded-2xl px-6 py-4 text-lg font-bold placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900/90 transition-all outline-none backdrop-blur-xl shadow-2xl"
                />
                <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 group-focus-within:text-blue-500/50 transition-colors" />
              </div>
            </div>

            {/* 名畫頭像選取 */}
            <div className="w-full max-w-4xl px-6 mb-2 ui-fade-in">
              <div className="flex flex-col items-center gap-6">
                
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4">
                  {MASTERPIECES.map((m) => {
                    const isSelected = selectedAvatarId === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedAvatarId(m.id)}
                        className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 active:scale-95' : 'grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-105'}`}
                      >
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-white/10 group-hover:border-white/30'}`}>
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

        {/* 2. 交互區 */}
        {!isBookFocused ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center gap-12 ui-fade-in px-4 mt-12">
            {/* 扇形展開場景 - 響應式容器 */}
            <div className="relative w-full max-w-[500px] h-[300px] flex items-center justify-center transform-style-3d">
              {(['normal', 'backdoor', 'blackbox'] as StartPath[]).map((path, idx) => {
                const isSelected = selectedPath === path;
                const rotations = [-18, 0, 18];
                const offsets = [-130, 0, 130];

                return (
                  <div
                    key={path}
                    onClick={() => handlePathSelect(path)}
                    className={`absolute cursor-pointer transition-all duration-500 ease-out transform-style-3d
                       ${isSelected ? 'translate-z-[120px] z-30' : 'z-10 brightness-60 hover:brightness-100 scale-95'}
                     `}
                    style={{
                      transform: `translateX(${offsets[idx]}px) rotateZ(${rotations[idx]}deg) ${isSelected ? 'translateY(-60px) scale(1.1)' : 'translateY(0)'}`,
                    }}
                  >
                    <div
                      className="w-[180px] h-[250px] rounded-xl shadow-[0_40px_80px_rgba(0,0,0,1)] border-r-8 border-black/60 relative overflow-hidden flex flex-col items-center justify-center p-5"
                      style={{
                        backgroundColor:
                          path === 'normal'
                            ? '#7a4225'
                            : path === 'backdoor'
                              ? '#162b4d'
                              : '#3d0c0c',
                        backgroundImage:
                          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%), url("https://www.transparenttextures.com/patterns/leather.png")',
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-70 pointer-events-none"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 80%)',
                        }}
                      />

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
                          {START_PATH_NAMES[path]}
                        </h4>
                      </div>

                      <div
                        className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-blue-500/40 rounded-xl animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 操作提示 */}
            <div
              className={`flex flex-col items-center gap-6 transition-all duration-700 ${selectedPath ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}`}
            >

              <button
                onClick={() => setIsBookFocused(true)}
                className="flex items-center gap-4 bg-white text-black font-black px-14 py-5 rounded-full tracking-[0.5em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
              >
                <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                翻閱卷宗檔案
              </button>
            </div>
          </div>
        ) : (
          /* 讀書模式 */
          <div className="w-full h-full flex items-center justify-center relative animate-in zoom-in-95 duration-700 ease-out">
            {/* 左上角返回鍵 */}
            <div className="absolute top-10 left-10 z-[100] ui-fade-in">
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

            {/* 確認按鈕 */}
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

      {/* 賄賂選擇彈窗 */}
      {showBribeModal && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 sm:p-6">
          <div className="relative w-full max-w-[460px] max-h-[90vh] bg-slate-900 border border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />
            
            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8 flex-shrink-0">
              <div className="p-3 sm:p-4 bg-blue-500/20 rounded-2xl shadow-inner">
                <Coins className="w-6 h-6 sm:w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-widest text-white">賄賂選項</h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-6 sm:mb-8">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {BRIBE_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => handleBribeSelect(opt.id)}
                    className={`flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border transition-all cursor-pointer hover:bg-white/5 active:scale-95 ${selectedBribe === opt.id ? 'border-blue-500 bg-blue-500/30' : 'border-white/5 bg-black/30'}`}
                  >
                    <div className={`p-3 sm:p-4 rounded-xl ${opt.color} bg-white/5 shadow-inner`}>
                      <opt.icon className="w-6 h-6 sm:w-7 h-7" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black tracking-widest text-lg sm:text-xl text-white/90">
                        {opt.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 新增的確認按鈕 */}
            <div className={`transition-all duration-500 ease-out ${selectedBribe ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <button
                onClick={handleFinalConfirm}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl tracking-[0.6em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 transition-all text-sm uppercase"
              >
                確認開始
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
