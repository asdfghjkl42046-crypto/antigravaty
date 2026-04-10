'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import GameCanvas from '@/components/GameCanvas';
import ModeSelectScreen from '@/components/ModeSelectScreen';
import SetupScreen from '@/components/SetupScreen';
import PlayerRegistrationScreen from '@/components/PlayerRegistrationScreen';
import DashboardScreen from '@/components/DashboardScreen';

export default function Home() {
  const { players, judgeMode, setJudgeMode, initGame, endTurn, resetGame } = useGameStore();
  const [mounted, setMounted] = useState(false);
  const [plannedPlayerCount, setPlannedPlayerCount] = useState<number | null>(null);
  const [currentRegIndex, setCurrentRegIndex] = useState(0);
  const [registrationList, setRegistrationList] = useState<any[]>([]);

  useEffect(() => {
    resetGame(); // 開發階段：每次重整強制清除暫存，必定回到封面
    setMounted(true);
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

  const handleRegistrationConfirm = async (config: any) => {
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
      {isModeSelect && <ModeSelectScreen onStartGame={handleModeSelect} />}

      {isSetup && <SetupScreen onBack={handleBackToMode} onConfirm={handleStartSetup} />}

      {isRegistration && plannedPlayerCount && (
        <PlayerRegistrationScreen
          playerIndex={currentRegIndex + 1}
          totalPlayers={plannedPlayerCount}
          onBack={handleBackToSetup}
          onConfirm={handleRegistrationConfirm}
        />
      )}

      {isDashboard && (
        <div className="relative w-full h-full">
          <DashboardScreen onEndTurn={endTurn} onReset={resetGame} />
        </div>
      )}
    </GameCanvas>
  );
}
