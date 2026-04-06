'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import ModeSelectScreen from '@/components/ModeSelectScreen';
import SetupScreen from '@/components/SetupScreen';
import DashboardScreen from '@/components/DashboardScreen';

export default function Home() {
  const { players, judgeMode, setJudgeMode, initGame, endTurn, resetGame } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    resetGame(); // 開發階段：每次重整強制清除暫存，必定回到封面
    setMounted(true);
  }, [resetGame]);

  if (!mounted) return null;

  // 判斷當前流程階段
  const isModeSelect = judgeMode === null;
  const isSetup = judgeMode !== null && players.length === 0;
  const isDashboard = players.length > 0;

  const handleModeSelect = (mode: 'website' | 'ai') => {
    setJudgeMode(mode);
  };

  const handleStartGame = (playerCount: number) => {
    // 根據選擇的人數產生玩家配置
    const configs = Array.from({ length: playerCount }, (_, i) => ({
      name: `企業${i + 1}`,
      path: 'normal' as const
    }));
    initGame(configs);
  };

  const handleBackToMode = () => {
    setJudgeMode(null);
  };

  return (
    <main className="w-screen h-[100dvh] bg-black flex justify-center items-center overflow-hidden">
      {isModeSelect && (
        <ModeSelectScreen onStartGame={handleModeSelect} />
      )}
      
      {isSetup && (
        <SetupScreen onBack={handleBackToMode} onConfirm={handleStartGame} />
      )}

      {isDashboard && (
        <DashboardScreen onEndTurn={endTurn} onReset={resetGame} />
      )}
    </main>
  );
}

