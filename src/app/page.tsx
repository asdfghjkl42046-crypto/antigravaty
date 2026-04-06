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
import { Info, RotateCw } from 'lucide-react';

/**
 * 遊戲中央控制核心 (Main Orchestrator)
 * 負責根據全局 Store 狀態切換不同的場景組件。
 * 解決了模式選擇後卡死的問題。
 */
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
    redrawCards,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'scan' | 'hrshop' | 'log'>('scan');
  
  // 記錄是否正在進行玩家設定，這是一個過渡狀態
  const [isSettingUp, setIsSettingUp] = useState(false);

  // 確保在客戶端與伺服器端渲染一致
  useEffect(() => setMounted(true), []);

  // 模擬抽牌邏輯：每回合隨機選出 5 張卡片展示
  // 實際上應該由 Store 管理手牌，但目前的 MVP 版本我們先在前端做簡單過濾
  const currentHand = useMemo(() => {
    const keys = Object.keys(CARDS_DB);
    // 簡單地根據回合數和索引打亂
    return keys.sort((a, b) => (parseInt(a.split('-')[1]) || 0) - (parseInt(b.split('-')[1]) || 0))
              .slice(0, 5);
  }, [turn, players.length]);

  if (!mounted) return null;

  // 1. 初始階段：若還沒選擇模式，也沒有設定玩家，則顯示模式選擇畫面
  if (!players.length && phase === 'play' && !trial && !isSettingUp) {
    if (activeTab !== 'scan') setActiveTab('scan'); // 強制重設
    return (
      <ModeSelectScreen 
        onSelect={(mode) => {
          setJudgeMode(mode);
          setIsSettingUp(true); // 進入設定流程
        }} 
      />
    );
  }

  // 2. 設定玩家階段：輸入姓名與路線
  if (players.length === 0 && isSettingUp) {
    return (
      <main className="fixed inset-0 w-screen h-[100dvh] bg-[#000] flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] max-w-full bg-black flex flex-col items-center px-6 py-8 overflow-y-auto no-scrollbar border-x border-white/5">
          <SetupScreen 
            onComplete={(configs) => {
              initGame(configs);
              setIsSettingUp(false); // 完成後關閉設定旗標
            }} 
            onBack={() => setIsSettingUp(false)} 
          />
        </div>
      </main>
    );
  }

  // 3. 核心遊戲渲染邏輯 (已經有玩家且在遊戲中)
  const currentPlayer = players[currentPlayerIndex];

  return (
    <main className="fixed inset-0 w-screen h-[100dvh] bg-[#000] flex items-center justify-center overflow-hidden font-sans">
      {/* 19.5:9 核心容器 (手機佈局) */}
      <div className="relative aspect-[9/19.5] h-full max-h-[100dvh] max-w-full bg-black flex flex-col items-center overflow-hidden shadow-2xl border-x border-white/5 animate-in fade-in duration-700">
        
        {/* 常駐背景 */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none" />
        
        {/* 常駐 UI 組件 */}
        <GameHUD 
          turn={turn} 
          judgePersonality={useGameStore.getState().judgePersonality} 
          onReset={() => {
            resetGame();
            setIsSettingUp(false);
          }} 
        />
        
        {/* 主內容區 */}
        <div className="flex-1 w-full relative overflow-y-auto no-scrollbar pt-28 pb-20 px-4 flex flex-col">
          
          {/* 場景 A：法庭對決 */}
          {phase === 'courtroom' ? (
            <div className="flex-1 h-full w-full">
              <Courtroom />
            </div>
          ) : phase === 'gameover' || phase === 'victory' ? (
            /* 場景 B：遊戲結束/勝利結算 */
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
            /* 場景 C：主遊戲操作 (卡片/日誌/側邊欄/導覽) */
            <div className="space-y-6 flex flex-col h-full">
              
              <PlayerSidebar players={players} currentPlayerIndex={currentPlayerIndex} />
              
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div className="flex-1">
                {activeTab === 'scan' && (
                  <div className="space-y-6 pb-20">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500/60">當前提案板</h3>
                      <button 
                        onClick={() => redrawCards()}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                      >
                        <RotateCw size={12} /> 重新整理
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {currentHand.map((id) => (
                        <ActionCard 
                          key={id} 
                          cardId={id} 
                          card={CARDS_DB[id]} 
                          onSelect={(idx) => performAction(id, idx)}
                          disabled={currentPlayer?.ap <= 0}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'log' && <GlobalActionLog />}
                
                {activeTab === 'hrshop' && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-600">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Info size={24} className="opacity-20" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-black">人力資源商店即將啟動</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部裝飾棒 */}
        <div className="w-1/3 h-[4px] bg-white/10 rounded-full mb-3 shrink-0 pointer-events-none" />
      </div>

      {/* 錯誤彈窗 */}
      {engineError && (
        <EngineErrorModal 
          error={engineError} 
          onReset={() => clearEngineError()} 
        />
      )}
    </main>
  );
}
