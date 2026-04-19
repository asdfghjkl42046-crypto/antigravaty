'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Network, Sparkles, Settings2, Eye, CircleDashed, Building2 } from 'lucide-react';
import gsap from 'gsap';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

interface ModeSelectScreenProps {
  onStartGame: (mode: 'website' | 'ai') => void;
}

export default function ModeSelectScreen({ onStartGame }: ModeSelectScreenProps) {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始原子佈局數據 (v5.0 極致顆粒度)
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
      label: '現代法律篇',
    },

    // Website Mode 原子
    wb_box: {
      top: 42,
      left: 15,
      width: 70,
      height: 26,
      radius: 23,
      label: '網站模式容器',
    },
    wb_title: {
      top: 45.5,
      left: 20,
      width: 60,
      height: 5,
      fontSize: 24,
      label: '網站模式',
    },
    wb_sub: {
      top: 50.8,
      left: 20,
      width: 60,
      height: 2,
      fontSize: 10,
      label: 'Web Mode',
    },
    wb_desc: {
      top: 55,
      left: 20,
      width: 60,
      height: 6,
      fontSize: 11,
      label: '使用固定戲劇性文案模板，無需等待 AI 生成',
    },
    wb_btn: {
      top: 61.6,
      left: 25,
      width: 50,
      height: 4.4,
      radius: 999,
      fontSize: 12,
      label: '開始遊戲',
    },
    wb_icon: {
      top: 45,
      left: 68,
      width: 6,
      height: 6,
      fontSize: 20,
      label: '網站圖示',
    },

    // AI Mode 原子
    ai_box: {
      top: 71,
      left: 15,
      width: 70,
      height: 26,
      radius: 23,
      label: 'AI 模式容器',
    },
    ai_title: {
      top: 74.5,
      left: 20,
      width: 60,
      height: 5,
      fontSize: 24,
      label: 'AI 模式',
    },
    ai_sub: {
      top: 79.7,
      left: 20,
      width: 60,
      height: 2,
      fontSize: 10,
      label: 'AI Mode',
    },
    ai_desc: {
      top: 84,
      left: 20,
      width: 60,
      height: 6,
      fontSize: 11,
      label: '由 LLM 生成無限變化的判決，支援自由文字陳述',
    },
    ai_btn: {
      top: 90.6,
      left: 25.2,
      width: 50,
      height: 4,
      radius: 999,
      fontSize: 12,
      label: '開始遊戲',
    },
    ai_icon: {
      top: 74,
      left: 68,
      width: 6,
      height: 6,
      fontSize: 24,
      label: 'AI 圖示',
    },
  });

  const [isReady, setIsReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (containerRef.current && !isDesignMode) {
      // ⚠️ 修正 V26: 避免在 Effect 中同步觸發 setState
      requestAnimationFrame(() => setIsReady(false));
      
      gsap.fromTo(
        '.ui-animate',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power4.out',
          onComplete: () => setIsReady(true),
        }
      );

      // 強制嘗試播放影片，修復行動端與 iOS 的自動播放限制問題
      if (videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('[Video] Autoplay was prevented. User interaction required or Low Power Mode active.', error);
          });
        }
      }
    }
  }, [isDesignMode]);

  // 動態定位類別注入 (支援 v5.0 原子化編輯器)
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
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* 注入動態 CSS 變數 */}
      <style dangerouslySetInnerHTML={{ __html: layoutStyles }} />

      <div
        ref={containerRef}
        className="relative w-full h-full select-none text-white overflow-hidden flex flex-col items-center"
      >
        {/* 設計模式按鈕 - 已隱藏 */}
        {/*
        <button
          onClick={() => setIsDesignMode(!isDesignMode)}
          className="absolute top-20 right-4 z-[2000] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
          title="切換排版模式"
        >
          {isDesignMode ? (
            <Eye className="w-5 h-5 text-emerald-400" />
          ) : (
            <Settings2 className="w-5 h-5" />
          )}
        </button>
        */}

        {/* 底層參考圖 (設計模式) */}
        {isDesignMode && (
          <img
            src="/ui/ref_mode_select.png"
            alt="Reference"
            className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none z-0"
          />
        )}

        {/* 背景：數位網格與強化漸層 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#020617]" />
          <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(30,58,138,0.3)_0%,transparent_70%)]" />
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

        {/* 標題區：原子化 */}
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

        {/* 模式選取卡片列表原子化：疊加模式 */}
        <div
          className={`absolute inset-0 z-20 pointer-events-none transition-all duration-500 ${isDesignMode ? 'opacity-40 grayscale blur-[0.2px]' : 'opacity-100'}`}
        >
          {/* 網站模式系列原子 */}
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
              <Building2 className="w-full h-full" />
            </div>
          )}
          {layout.wb_desc && (
            <p className="wb_desc-pos text-slate-400/90 leading-relaxed text-center px-4 ui-animate">
              {layout.wb_desc.label}
            </p>
          )}
          {layout.wb_btn && (
            <button
              onClick={() => onStartGame('website')}
              className={`wb_btn-pos rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-black tracking-widest shadow-[0_6px_20px_rgba(37,99,235,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center ui-animate ${isReady ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <span>{layout.wb_btn.label}</span>
            </button>
          )}

          {/* AI 模式系列原子 */}
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
              <Sparkles className="w-full h-full" />
            </div>
          )}
          {layout.ai_desc && (
            <p className="ai_desc-pos text-slate-400/90 leading-relaxed text-center px-4 ui-animate">
              {layout.ai_desc.label}
            </p>
          )}
          {layout.ai_btn && (
            <button
              onClick={() => onStartGame('ai')}
              className={`ai_btn-pos rounded-full bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-black tracking-widest shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center ui-animate ${isReady ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <span>{layout.ai_btn.label}</span>
            </button>
          )}
        </div>

        {/* 排版工具 */}
        {isDesignMode && (
          <div className="absolute inset-0 z-30">
            <AlignmentTool
              containerRef={containerRef}
              initialElements={layout}
              onUpdate={setLayout}
              renderElement={(id, el) => (
                <div className="w-full h-full border-2 border-white/50 flex flex-col items-center justify-center font-black text-xs bg-blue-600/20">
                  <p className="uppercase">{id}</p>
                  <p className="text-[8px] opacity-60">EDIT MODE</p>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
