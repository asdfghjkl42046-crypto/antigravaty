'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import ModeSelectScreen from '@/components/ModeSelectScreen';
import SetupScreen from '@/components/SetupScreen';
import Courtroom from '@/components/Courtroom';
import ActionCard from '@/components/ActionCard';
import GameHUD from '@/components/GameHUD';
import PlayerSidebar from '@/components/PlayerSidebar';
import EndingScreen from '@/components/EndingScreen';
import TabNavigation from '@/components/TabNavigation';
import GlobalActionLog from '@/components/GlobalActionLog';
import EngineErrorModal from '@/components/EngineErrorModal';
import { CARDS_DB } from '@/data/cards/CardsDB';
import HRShop from '@/components/HRShop';
import QrScanner from '@/components/QrScanner';
import { TerminalScanner } from '@/components/TerminalScanner';
import { MobileHeader } from '@/components/MobileHeader';
import { PlayerActionCard } from '@/components/PlayerActionCard';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function Home() {
  const {
    phase,
    players,
    currentPlayerIndex,
    turn,
    trial,
    setJudgeMode,
    initGame,
    resetGame,
    performAction,
    endTurn,
    judgePersonality,
    engineError,
    endingResult,
    clearEngineError,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'hrshop' | 'scan'>('home');
  const [isQrActive, setIsQrActive] = useState(false);
  
  // 記錄是否正在進行玩家設定，這是一個過渡狀態
  const [isSettingUp, setIsSettingUp] = useState(false);

  // 確保在客戶端與伺服器端渲染一致
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // 初始模式選擇
  if (!players.length && phase === 'play' && !trial && !isSettingUp) {
    return (
      <ModeSelectScreen 
        onSelect={(mode) => {
          setJudgeMode(mode);
          setIsSettingUp(true);
        }} 
      />
    );
  }

  // 玩家設定流程
  if (players.length === 0 && isSettingUp) {
    return (
      <main className="fixed inset-0 w-screen h-[100dvh] bg-[#000] flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] max-w-full bg-black flex flex-col items-center px-6 py-8 overflow-y-auto no-scrollbar border-x border-white/5">
          <SetupScreen 
            onComplete={(configs) => {
              initGame(configs);
              setIsSettingUp(false);
            }} 
            onBack={() => setIsSettingUp(false)} 
          />
        </div>
      </main>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  // 處理指令解碼執行
  const handleActionCode = async (cardId: string, optionIdx: number) => {
    if (!CARDS_DB[cardId]) return; 
    await performAction(cardId, optionIdx as 1 | 2 | 3);
    if (isQrActive) setIsQrActive(false);
    // 執行成功後跳回主頁預覽數值
    setActiveTab('home');
  };

  return (
    <main className="fixed inset-0 w-screen h-[100dvh] bg-[#000] flex items-center justify-center overflow-hidden font-sans">
      <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] max-w-full bg-[#050505] flex flex-col items-center overflow-hidden shadow-2xl border-x border-white/5 animate-in fade-in duration-700">
        
        {/* 背景點點 */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px:20px] opacity-[0.2] pointer-events-none" />
        
        {/* 頂部 Header */}
        <MobileHeader turn={turn} judgePersonality={judgePersonality} />
        
        {/* 主內容區 */}
        <div className="flex-1 w-full relative overflow-y-auto no-scrollbar pb-32 px-4 flex flex-col">
          
          {phase === 'courtroom' ? (
            <div className="flex-1 h-full w-full">
              <Courtroom />
            </div>
          ) : phase === 'gameover' || phase === 'victory' ? (
            <div className="flex-1 h-full w-full flex items-center justify-center">
              {endingResult && (
                <EndingScreen 
                  result={endingResult} 
                  players={players} 
                  onReset={() => {
                    resetGame();
                    setIsSettingUp(false);
                  }} 
                />
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* 基於當前分頁渲染內容 */}
              {activeTab === 'home' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {players.map((p, idx) => (
                    <PlayerActionCard 
                      key={p.id}
                      player={p}
                      isActive={idx === currentPlayerIndex}
                      onEndTurn={() => {
                        endTurn();
                      }}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'scan' && (
                <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <TerminalScanner 
                    onDecode={handleActionCode}
                    onToggleQr={() => setIsQrActive(!isQrActive)}
                    isQrActive={isQrActive}
                    disabled={currentPlayer?.ap <= 0}
                  />
                  
                  {isQrActive && (
                    <QrScanner 
                      active={isQrActive}
                      onScanSuccess={(code) => {
                        const match = code.trim().toUpperCase().match(/^([A-E]-\d{2})-([1-3])$/);
                        if (match) {
                          handleActionCode(match[1], parseInt(match[2]));
                        }
                      }}
                      onClose={() => setIsQrActive(false)}
                    />
                  )}
                </div>
              )}

              {activeTab === 'hrshop' && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <HRShop onActionResult={() => {}} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-1/3 h-[4px] bg-white/10 rounded-full mb-3 shrink-0 pointer-events-none" />
      </div>

      {engineError && (
        <EngineErrorModal 
          error={engineError} 
          onReset={() => clearEngineError()} 
        />
      )}
    </main>
  );
}
