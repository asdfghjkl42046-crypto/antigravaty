'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Gavel, Layers } from 'lucide-react';
import { SYSTEM_STRINGS } from '@/data/SystemStrings';

interface LoadingScreenProps {
  isLoading: boolean;
  progress: number;
  variant?: 'default' | 'court' | 'defense';
  message?: string;
}

/**
 * LoadingScreen - 極簡等待畫面 (支援多主題)
 * default: 暖黑焦糖色
 * court: 深邃紫色 (被起訴專用)
 * defense: 科技冷藍 (答辯準備專用)
 */
export default function LoadingScreen({ 
  isLoading, 
  progress, 
  variant = 'default',
  message 
}: LoadingScreenProps) {
  const isCourt = variant === 'court';
  const isDefense = variant === 'defense';
  
  const defaultMsg = isCourt ? '最高法院提審中' : (isDefense ? '準備辯護策略' : SYSTEM_STRINGS.LOADING.DEFAULT);
  const [displayMessage, setDisplayMessage] = useState(message || defaultMsg);
  
  const tips = isCourt 
    ? SYSTEM_STRINGS.LOADING.COURT_TIPS 
    : (isDefense ? SYSTEM_STRINGS.LOADING.DEFENSE_TIPS : SYSTEM_STRINGS.LOADING.TIPS);

  useEffect(() => {
    if (!isLoading) return;
    const i = Math.min(Math.floor((progress / 100) * tips.length), tips.length - 1);
    setDisplayMessage(tips[i]);
  }, [progress, isLoading, tips]);

  // 主題色配置
  const theme = {
    bg: isCourt ? 'bg-[#120e26]' : (isDefense ? 'bg-[#0c4a6e]' : 'bg-[#292524]'),
    accent: isCourt 
      ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' 
      : (isDefense ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.5)]'),
    icon: isCourt ? 'text-purple-500/40' : (isDefense ? 'text-sky-400/40' : 'text-amber-600/40'),
    text: isCourt ? 'text-purple-800/60' : (isDefense ? 'text-sky-800/60' : 'text-amber-800/60'),
    subtext: isCourt ? 'text-purple-600/50' : (isDefense ? 'text-sky-600/50' : 'text-amber-600/50'),
    mono: isCourt ? 'text-purple-500' : (isDefense ? 'text-sky-400' : 'text-amber-500'),
  };

  // 卡片翻轉動畫組件 (用於 defense 模式)
  const CardStack = () => (
    <div className="relative w-16 h-20">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, rotateY: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            rotateY: [0, 180, 360],
            z: [0, 50, 0]
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity, 
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className={`absolute inset-0 border-2 ${isDefense ? 'border-sky-500/30' : 'border-amber-500/30'} rounded-md bg-white/5 backdrop-blur-sm flex items-center justify-center overflow-hidden`}
        >
          {/* 卡片背面紋理 */}
          <div className="w-full h-full p-2">
            <div className={`w-full h-full border ${isDefense ? 'border-sky-500/10' : 'border-amber-500/10'} rounded flex items-center justify-center`}>
               <div className={`w-2 h-2 rounded-full ${isDefense ? 'bg-sky-500/20' : 'bg-amber-500/20'}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed inset-0 z-[9999] ${theme.bg} flex flex-col items-center justify-center overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'url("/assets/textures/leather.png")' }} 
          />
          
          {/* Logo 區域 */}
          <motion.div
            animate={!isDefense ? { opacity: [0.4, 0.7, 0.4] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-10"
          >
            {isCourt && <Gavel className={`w-12 h-12 ${theme.icon}`} strokeWidth={1} />}
            {isDefense && <CardStack />}
            {!isCourt && !isDefense && <Scale className={`w-12 h-12 ${theme.icon}`} strokeWidth={1} />}
          </motion.div>

          {/* 連續性實心進度條 */}
          <div className="w-64 flex flex-col items-center">
            <div className="w-full h-[1px] bg-white/5 relative mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "linear" }}
                className={`absolute top-0 left-0 h-full ${theme.accent}`}
              />
            </div>

            <div className="w-full flex justify-between items-center px-1">
              <motion.p
                key={displayMessage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-[9px] ${theme.text} font-black tracking-[0.3em] uppercase`}
              >
                {displayMessage}
              </motion.p>
              <span className={`text-[9px] font-mono ${theme.subtext}`}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* 底部裝飾 */}
          <div className="absolute bottom-10 left-10 opacity-10">
            <span className={`text-[8px] font-mono ${theme.mono} tracking-widest`}>
              {isCourt ? 'COURT_AUTH_SEQUENCE' : (isDefense ? 'DEFENSE_STRATEGY_GEN' : 'SYS_INIT_SEQUENCE_LOADED')}
            </span>
          </div>
          <div className="absolute bottom-10 right-10 opacity-10">
            <span className={`text-[8px] font-mono ${theme.mono} tracking-widest`}>
              {isCourt ? 'CRIMINAL_SCAN_ACTIVE' : (isDefense ? 'PREPARING_PLEAD_FILES' : 'TR_AUTH_ACTIVE')}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
