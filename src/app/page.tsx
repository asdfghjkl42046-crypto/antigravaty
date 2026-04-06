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
    engineError,
    endingResult,
    clearEngineError,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'hrshop' | 'log'>('scan');
  const [isQrActive, setIsQrActive] = useState(false);
  
  // 記錄是否正在進行玩家設定，這是一個過渡狀態
  const [isSettingUp, setIsSettingUp] = useState(false);

  // 確保在客戶端與伺服器端渲染一致
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // ... (初始階段 1 & 2 判斷保留)
  if (!players.length && phase === 'play' && !trial && !isSettingUp) {
    if (activeTab !== 'scan') setActiveTab('scan');
    return (
      <ModeSelectScreen 
        onSelect={(mode) => {
          setJudgeMode(mode);
          setIsSettingUp(true);
        }} 
      />
    );
  }

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

  // 處理指令解碼
  const handleActionCode = async (cardId: string, optionIdx: number) => {
    // 檢查卡片是否存在於資料庫
    if (!CARDS_DB[cardId]) {
      // 這裡理論上應由 Terminal 內部攔截，但這做為二次防禦
      return; 
    }
    
    // 發動核心行動引擎
    await performAction(cardId, optionIdx as 1 | 2 | 3);
    
    // 若掃描器開啟，自動關閉以顯示結果
    if (isQrActive) setIsQrActive(false);
  };

  return (
    <main className="fixed inset-0 w-screen h-[100dvh] bg-[#000] flex items-center justify-center overflow-hidden font-sans">
      <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] max-w-full bg-black flex flex-col items-center overflow-hidden shadow-2xl border-x border-white/5 animate-in fade-in duration-700">
        
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />
        
        <GameHUD 
          turn={turn} 
          judgePersonality={useGameStore.getState().judgePersonality} 
          onReset={() => {
            resetGame();
            setIsSettingUp(false);
          }} 
        />
        
        <div className="flex-1 w-full relative overflow-y-auto no-scrollbar pt-28 pb-20 px-4 flex flex-col">
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
            <div className="space-y-6 flex flex-col h-full">
              <PlayerSidebar players={players} currentPlayerIndex={currentPlayerIndex} />
              <TabNavigation activeTab={activeTab} onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab !== 'scan') setIsQrActive(false);
              }} />
              
              <div className="flex-1">
                {activeTab === 'scan' && (
                  <div className="space-y-4">
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
                          // 解析 A-01-1 格式
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

                {activeTab === 'log' && <GlobalActionLog />}
                
                {activeTab === 'hrshop' && (
                  <HRShop onActionResult={(res) => {
                    // 若有需求可在這裡處理升級後的全域通知
                    console.log('HR Upgrade Result:', res);
                  }} />
                )}
              </div>
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
