'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { useGameStore } from '@/store/gameStore';
import { START_PATH_LABELS, START_PATH_NAMES } from '@/data/setup/SetupData';
import { ChevronRight, FileText, Monitor } from 'lucide-react';

gsap.registerPlugin(TextPlugin);

/**
 * StoryScreen - 敘事劇場元件
 * 負責在遊戲開始前，以黑白電影 (Noir) 風格展示每位玩家的開局背景故事。
 */
export default function StoryScreen() {
  const { players, finishStory } = useGameStore();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const player = players[currentPlayerIndex];
  const storyText = player ? START_PATH_LABELS[player.startPath || 'normal'] : '';
  const pathName = player ? START_PATH_NAMES[player.startPath || 'normal'] : '';

  useEffect(() => {
    if (!player || !textRef.current) return;

    // 清除舊動畫與內容
    gsap.killTweensOf(textRef.current);
    textRef.current.innerText = '';
    
    // 進入動畫
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );

    // 打字機效果 (修正: 不再依賴 TextPlugin 處理長段落，我們使用逐字顯示)
    const chars = storyText.split('');
    let currentText = '';
    const tl = gsap.timeline();

    chars.forEach((char, i) => {
      tl.to({}, {
        duration: 0.03, // 每字速度
        onStart: () => {
          currentText += char;
          if (textRef.current) textRef.current.innerText = currentText;
        }
      });
    });

    return () => {
      tl.kill();
    };
  }, [currentPlayerIndex, player, storyText]);

  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      // 播放淡出動畫後轉換下一位
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          setCurrentPlayerIndex(currentPlayerIndex + 1);
        }
      });
    } else {
      // 全員播放完畢
      gsap.to(containerRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          finishStory();
        }
      });
    }
  };

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center overflow-hidden">
      {/* 底部雜訊背景效果 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      
      {/* 掃描線效果 */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,118,0.02))] bg-[length:100%_4px,3px_100%]" />

      <div 
        ref={containerRef}
        className="relative w-full max-w-2xl px-8 flex flex-col items-center"
      >
        {/* 頭部裝飾 */}
        <div className="w-full flex items-center justify-between mb-12 opacity-50">
          <div className="flex items-center gap-3">
            <Monitor className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-cyan-500/80">
              Personal Dossier // {player.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500">
              SECURE LINK ESTABLISHED
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* 角色標題 */}
        <div className="w-full mb-8">
          <h2 className="text-4xl font-black text-white italic tracking-tighter mb-2">
            {pathName}
          </h2>
          <div className="h-1 w-12 bg-cyan-500" />
        </div>

        {/* 故事本文 (打字機區塊) */}
        <div className="w-full min-h-[300px]">
          <div 
            ref={textRef}
            className="text-lg leading-relaxed text-slate-300 font-serif tracking-tight whitespace-pre-wrap selection:bg-cyan-500/30"
          >
            {/* 動態注入內容 */}
          </div>
        </div>

        {/* 底部動作 */}
        <div className="w-full mt-16 flex justify-end">
          <button
            onClick={handleNext}
            className="group flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full transition-all active:scale-95"
          >
            <span className="text-sm font-black tracking-[0.2em] text-white uppercase">
              {currentPlayerIndex < players.length - 1 ? '閱畢，接續下一位' : '準備啟動命運'}
            </span>
            <ChevronRight className="w-5 h-5 text-cyan-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 裝飾性文字元素 */}
      <div className="absolute bottom-10 left-10 opacity-20 hidden md:block">
        <div className="text-[8px] font-mono text-slate-500 leading-tight">
          STATUS: INFILTRATION_COMPLETE<br />
          LOCAL_TIME: {new Date().toLocaleTimeString()}<br />
          ENCRYPTION: AES-256-GCM
        </div>
      </div>
    </div>
  );
}
