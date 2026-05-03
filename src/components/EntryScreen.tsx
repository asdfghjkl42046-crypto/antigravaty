'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Users, Building2, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { SYSTEM_STRINGS } from '@/data/SystemStrings';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

interface EntryScreenProps {
  onSelectSingle: () => void;
  onSelectMulti: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onSelectSingle, onSelectMulti }) => {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始原子佈局數據 (直接複製 ModeSelectScreen 的佈局，確保 1:1)
  const [layout, setLayout] = useState<Record<string, AlignmentElement>>({
    logo: {
      top: 8,
      left: 35,
      width: 30,
      height: 15,
      radius: 40,
      label: '核心標誌',
    },
    header_title: {
      top: 26,
      left: 10,
      width: 80,
      height: 6,
      fontSize: 36,
      label: '創業冒險',
    },
    header_subtitle: {
      top: 33,
      left: 10,
      width: 80,
      height: 4,
      fontSize: 28,
      label: '選擇設備使用模式',
    },

    // Single Player (對應原 WB)
    wb_box: {
      top: 42,
      left: 15,
      width: 70,
      height: 26,
      radius: 23,
      label: '單機模式容器',
    },
    wb_title: {
      top: 45.5,
      left: 20,
      width: 60,
      height: 5,
      fontSize: 24,
      label: '單機遊玩',
    },
    wb_sub: {
      top: 50.8,
      left: 20,
      width: 60,
      height: 2,
      fontSize: 10,
      label: 'Local Multiplayer',
    },
    wb_desc: {
      top: 55,
      left: 20,
      width: 60,
      height: 6,
      fontSize: 11,
      label: '單設備進行遊戲，展開法庭博弈。',
    },
    wb_btn: {
      top: 61.6,
      left: 25,
      width: 50,
      height: 4.4,
      radius: 999,
      fontSize: 12,
      label: '確認選擇',
    },
    wb_icon: {
      top: 45,
      left: 68,
      width: 6,
      height: 6,
      fontSize: 20,
      label: '單機圖示',
    },

    // Multiplayer (對應原 AI)
    ai_box: {
      top: 71,
      left: 15,
      width: 70,
      height: 26,
      radius: 23,
      label: '多機連線容器',
    },
    ai_title: {
      top: 74.5,
      left: 20,
      width: 60,
      height: 5,
      fontSize: 24,
      label: '多機連線',
    },
    ai_sub: {
      top: 79.7,
      left: 20,
      width: 60,
      height: 2,
      fontSize: 10,
      label: 'Online Multiplayer',
    },
    ai_desc: {
      top: 84,
      left: 20,
      width: 60,
      height: 6,
      fontSize: 11,
      label: '多設備同步，展開法庭博弈。',
    },
    ai_btn: {
      top: 90.6,
      left: 25.2,
      width: 50,
      height: 4,
      radius: 999,
      fontSize: 12,
      label: '確認選擇',
    },
    ai_icon: {
      top: 74,
      left: 68,
      width: 6,
      height: 6,
      fontSize: 24,
      label: '多機圖示',
    },
  });

  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (containerRef.current && !isDesignMode) {
      requestAnimationFrame(() => setIsReady(false));

      gsap.fromTo(
        '.ui-animate',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power4.out',
          onComplete: () => setIsReady(true),
        }
      );

      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isDesignMode]);

  const layoutStyles = `
    ${Object.entries(layout)
      .map(
        ([id, el]) => `
      .${id}-pos { 
        top: ${el.top}%; 
        left: ${el.left}%; 
        width: ${el.width}%; 
        height: ${el.height}%; 
        border-radius: ${el.radius || 0}px !important; 
        font-size: ${el.fontSize || 14}px !important; 
        position: absolute !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    `
      )
      .join('\n')}
  `;

  return (
    <div className="fixed inset-0 z-[100] w-full h-full flex items-center justify-center overflow-hidden bg-transparent">
      <style dangerouslySetInnerHTML={{ __html: layoutStyles }} />

      <div
        ref={containerRef}
        className="relative w-full h-full select-none text-white overflow-hidden flex flex-col items-center"
      >
        {/* 背景：數位網格與強化漸層 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#020617]" />
          <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at:50%_40%,rgba(30,58,138,0.3)_0%,transparent_70%)]" />
        </div>

        {/* 1. Logo 區 */}
        {layout.logo && (
          <div className="logo-pos flex items-center justify-center relative ui-animate">
            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-[25%] overflow-hidden bg-black/20 shadow-2xl backdrop-blur-sm group">
              <video
                ref={videoRef}
                src="/assets/logo_anim.mp4"
                poster="/ui/logo_poster.png"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        {/* 標題區 */}
        {layout.header_title && (
          <h1 className="header_title-pos font-black tracking-tight text-white leading-tight ui-animate">
            {layout.header_title.label}
          </h1>
        )}
        {layout.header_subtitle && (
          <h2 className="header_subtitle-pos font-black text-transparent bg-clip-text bg-gradient-to-b from-[#93c5fd] to-[#3b82f6] tracking-tight drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] leading-tight ui-animate">
            {layout.header_subtitle.label}
          </h2>
        )}

        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* 單機模式系列 */}
          {layout.wb_box && (
            <div className="ui-animate group bg-[#0f172a]/95 border border-blue-500/40 transition-all overflow-hidden shadow-[inset_0_0_30px_rgba(59,130,246,0.1)] wb_box-pos pointer-events-auto" />
          )}
          {layout.wb_title && (
            <h3 className="wb_title-pos font-black text-white leading-none ui-animate">
              {layout.wb_title.label}
            </h3>
          )}
          {layout.wb_sub && (
            <p className="wb_sub-pos font-bold tracking-[0.2em] text-blue-400/80 uppercase ui-animate">
              {layout.wb_sub.label}
            </p>
          )}
          {layout.wb_icon && (
            <div className="wb_icon-pos text-blue-500/50 ui-animate z-30 pointer-events-none">
              <User className="w-full h-full" />
            </div>
          )}
          {layout.wb_desc && (
            <p className="wb_desc-pos text-slate-400/90 leading-relaxed text-center px-4 ui-animate whitespace-pre-line">
              {layout.wb_desc.label}
            </p>
          )}
          {layout.wb_btn && (
            <button
              onClick={onSelectSingle}
              className={`wb_btn-pos rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-black tracking-widest shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center ui-animate ${isReady ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <span>{layout.wb_btn.label}</span>
            </button>
          )}

          {/* 多機連線系列 */}
          {layout.ai_box && (
            <div className="ui-animate group bg-[#061a1a]/95 border border-emerald-500/40 transition-all overflow-hidden shadow-[inset_0_0_30px_rgba(16,185,129,0.1)] ai_box-pos pointer-events-auto" />
          )}
          {layout.ai_title && (
            <h3 className="ai_title-pos font-black text-white leading-none ui-animate">
              {layout.ai_title.label}
            </h3>
          )}
          {layout.ai_sub && (
            <p className="ai_sub-pos font-bold tracking-[0.2em] text-emerald-400/80 uppercase ui-animate">
              {layout.ai_sub.label}
            </p>
          )}
          {layout.ai_icon && (
            <div className="ai_icon-pos text-emerald-500/50 ui-animate z-30 pointer-events-none">
              <Users className="w-full h-full" />
            </div>
          )}
          {layout.ai_desc && (
            <p className="ai_desc-pos text-slate-400/90 leading-relaxed text-center px-4 ui-animate whitespace-pre-line">
              {layout.ai_desc.label}
            </p>
          )}
          {layout.ai_btn && (
            <button
              onClick={onSelectMulti}
              className={`ai_btn-pos rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-black tracking-widest shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center ui-animate ${isReady ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <span>{layout.ai_btn.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
