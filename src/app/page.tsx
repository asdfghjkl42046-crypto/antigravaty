'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import GameCanvas from '@/components/GameCanvas';
import ModeSelectScreen from '@/components/ModeSelectScreen';
import SetupScreen from '@/components/SetupScreen';
import PlayerRegistrationScreen from '@/components/PlayerRegistrationScreen';
import DashboardScreen from '@/components/DashboardScreen';
import CourtroomScreen from '@/components/CourtroomScreen';
import EndingScreen from '@/components/EndingScreen';
import { EntryScreen } from '@/components/EntryScreen';
import LobbyScreen from '@/components/multiplayer/LobbyScreen';
import type { PlayerConfig } from '@/types/game';

export default function Home() {
  const { players, judgeMode, setJudgeMode, initGame, endTurn, resetGame, phase } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [plannedPlayerCount, setPlannedPlayerCount] = useState<number | null>(null);
  const [currentRegIndex, setCurrentRegIndex] = useState(0);
  const [registrationList, setRegistrationList] = useState<PlayerConfig[]>([]);
  const [isMultiplayerMode, setIsMultiplayerMode] = useState<boolean | null>(null);

  useEffect(() => {
    resetGame(); // 開發階段：每次重整強制清除暫存，必定回到封面
    
    // 使用非同步方式設置以避免渲染循環警告
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, [resetGame]);

  if (!mounted) return null;

  // 判斷當前流程階段
  const isModeSelect = judgeMode === null;
  const isSetup = judgeMode !== null && players.length === 0 && !plannedPlayerCount;
  const isRegistration = judgeMode !== null && players.length === 0 && !!plannedPlayerCount;
  const isDashboard = players.length > 0;

  const handleModeSelect = (mode: 'website' | 'ai') => {
    setJudgeMode(mode);
  };

  const handleStartSetup = (playerCount: number) => {
    setPlannedPlayerCount(playerCount);
  };

  const handleRegistrationConfirm = async (config: PlayerConfig) => {
    const newList = [...registrationList, config];

    if (newList.length === (plannedPlayerCount || 0)) {
      // 全部註冊完畢
      await initGame(newList);
      setPlannedPlayerCount(null);
      setCurrentRegIndex(0);
      setRegistrationList([]);
    } else {
      // 繼續註冊下一位
      setRegistrationList(newList);
      setCurrentRegIndex(currentRegIndex + 1);
    }
  };

  const handleBackToMode = () => {
    setJudgeMode(null);
  };

  const handleBackToSetup = () => {
    setPlannedPlayerCount(null);
    setCurrentRegIndex(0);
    setRegistrationList([]);
  };

  return (
    <GameCanvas>
      {isMultiplayerMode === null && (
        <EntryScreen 
          onSelectSingle={() => setIsMultiplayerMode(false)} 
          onSelectMulti={() => setIsMultiplayerMode(true)} 
        />
      )}

      {isMultiplayerMode === false && (
        <>
          {isModeSelect && <ModeSelectScreen key="mode-select" onStartGame={handleModeSelect} />}

          {isSetup && <SetupScreen key="game-setup" onBack={handleBackToMode} onConfirm={handleStartSetup} />}

          {isRegistration && plannedPlayerCount && (
            <PlayerRegistrationScreen
              key="registration-screen"
              playerIndex={currentRegIndex + 1}
              totalPlayers={plannedPlayerCount}
              onBack={handleBackToSetup}
              onConfirm={handleRegistrationConfirm}
            />
          )}

          {isDashboard && (
            <div key="game-dashboard" className="relative w-full h-full">
              <DashboardScreen onEndTurn={endTurn} onReset={resetGame} />
              {phase === 'courtroom' && <CourtroomScreen key="court" />}
              {(phase === 'victory' || phase === 'gameover') && <EndingScreen key="ending" />}
            </div>
          )}
        </>
      )}

      {isMultiplayerMode === true && (
        <LobbyScreen 
          onBack={() => setIsMultiplayerMode(null)} 
          onStartGame={(key) => {
            console.log('Room Start with Key:', key);
            // 未來在此處初始化 Supabase 房間狀態
            setIsMultiplayerMode(null); 
          }} 
        />
      )}
    </GameCanvas>
  );
}
