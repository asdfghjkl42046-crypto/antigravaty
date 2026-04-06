'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import ModeSelectScreen from '@/components/ModeSelectScreen';
import SetupScreen from '@/components/SetupScreen';
import Courtroom from '@/components/Courtroom';
import EndingScreen from '@/components/EndingScreen';
import EngineErrorModal from '@/components/EngineErrorModal';
import { CARDS_DB } from '@/data/cards/CardsDB';
import HRShop from '@/components/HRShop';
import QrScanner from '@/components/QrScanner';
import { TerminalScanner } from '@/components/TerminalScanner';
import { MobileHeader } from '@/components/MobileHeader';
import { PlayerActionCard } from '@/components/PlayerActionCard';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ScaleContainer } from '@/components/ScaleContainer';

export default function Home() {
  const {
    phase,
    players,
    currentPlayerIndex,
    turn,
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
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'scan'>('home');
  const [isQrActive, setIsQrActive] = useState(false);
  
  // 記錄是否正在進行玩家設定
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // --- 1. 模式選擇 ---
  if (!players.length && phase === 'play' && !isSettingUp) {
    return (
      <ScaleContainer>
        <ModeSelectScreen 
          onSelect={(mode) => {
            setJudgeMode(mode);
            setIsSettingUp(true);
          }} 
        />
      </ScaleContainer>
    );
  }

  // --- 2. 玩家設定 ---
  if (players.length === 0 && isSettingUp) {
    return (
      <ScaleContainer>
        <div className="w-full h-full bg-black flex flex-col items-center px-6 py-8 overflow-y-auto no-scrollbar">
          <SetupScreen 
            onComplete={(configs) => {
              initGame(configs);
              setIsSettingUp(false);
            }} 
            onBack={() => setIsSettingUp(false)} 
          />
        </div>
      </ScaleContainer>
    );
  }

  const currentPlayer = players[currentPlayerIndex];

  // 處理指令解碼執行
  const handleActionCode = async (cardId: string, optionIdx: number) => {
    if (!CARDS_DB[cardId]) return; 
    await performAction(cardId, optionIdx as 1 | 2 | 3);
    if (isQrActive) setIsQrActive(false);
    setActiveTab('home');
  };

  // --- 3. 遊戲主標籤頁與判決畫面 ---
  return (
    <ScaleContainer>
      <div className="w-full h-full flex flex-col items-center animate-in fade-in duration-700 relative overflow-hidden">
        {/* 背景點點 */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.2] pointer-events-none" />
        
        {/* 頂部 Header */}
        <MobileHeader turn={turn} judgePersonality={judgePersonality} />
        
        {/* 主內容區：移除捲軸，改為固定比例分配 */}
        <div className="flex-1 w-full relative overflow-hidden px-4 flex flex-col">
          
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
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 基於當前分頁渲染內容 */}
              {activeTab === 'home' && (
                <div className="flex-1 flex flex-col gap-2 py-2 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden">
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
                <div className="flex-1 flex flex-col gap-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
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

              {activeTab === 'shop' && (
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
                  <HRShop onActionResult={() => {}} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部導覽欄位 */}
        <MobileBottomNav activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'scan') setIsQrActive(false);
        }} />
        
        {/* iPhone 指示線裝飾 */}
        <div className="w-1/3 h-[4px] bg-white/10 rounded-full mb-3 shrink-0 z-[110] relative" />
      </div>

      {engineError && (
        <EngineErrorModal 
          error={engineError} 
          onReset={() => clearEngineError()} 
        />
      )}
    </ScaleContainer>
  );
}
