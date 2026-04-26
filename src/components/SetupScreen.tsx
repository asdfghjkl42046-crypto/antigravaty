'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, Users, Settings2, Eye } from 'lucide-react';
import gsap from 'gsap';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

interface SetupScreenProps {
  onBack: () => void;
  onConfirm: (playerCount: number) => void;
}

export default function SetupScreen({ onBack, onConfirm }: SetupScreenProps) {
  const [selectedCount, setSelectedCount] = useState<number>(2);
  const [isDesignMode, setIsDesignMode] = useState(false); // 控制排版模式
  const containerRef = useRef<HTMLDivElement>(null);

  // 初始原子佈局數據 (v5.0 極致顆粒度)
  const [layout, setLayout] = useState<Record<string, AlignmentElement>>({
    header_title: {
      top: 15,
      left: 10,
      width: 80,
      height: 6,
      fontSize: 32,
      label: '選擇參與人數',
    },
    header_subtitle: {
      top: 21,
      left: 10,
      width: 80,
      height: 4,
      fontSize: 14,
      label: '這是一場關於法律、權力與金錢的較量\n請選擇參與這場博弈的人數。',
    },

    // P1
    p1_box: { top: 30, left: 20, width: 30, height: 19, radius: 30, label: 'P1 容器' },
    p1_num: { top: 35, left: 32.5, width: 5, height: 4, fontSize: 32, label: '1' },
    p1_label: { top: 43, left: 30, width: 10, height: 2, fontSize: 9, label: 'PLAYER' },
    p1_icon: { top: 40, left: 33, width: 4, height: 3, fontSize: 16, label: '小人' },

    // P2
    p2_box: { top: 30, left: 53, width: 30, height: 19, radius: 30, label: 'P2 容器' },
    p2_num: { top: 35, left: 65.5, width: 5, height: 4, fontSize: 32, label: '2' },
    p2_label: { top: 43, left: 63, width: 10, height: 2, fontSize: 9, label: 'PLAYERS' },
    p2_icon: { top: 40, left: 66, width: 4, height: 3, fontSize: 16, label: '小人' },

    // P3
    p3_box: { top: 50, left: 20, width: 30, height: 19, radius: 30, label: 'P3 容器' },
    p3_num: { top: 55, left: 32.5, width: 5, height: 4, fontSize: 32, label: '3' },
    p3_label: { top: 63, left: 30, width: 10, height: 2, fontSize: 9, label: 'PLAYERS' },
    p3_icon: { top: 60, left: 33, width: 4, height: 3, fontSize: 16, label: '小人' },

    // P4
    p4_box: { top: 50, left: 53, width: 30, height: 19, radius: 30, label: 'P4 容器' },
    p4_num: { top: 55, left: 65.5, width: 5, height: 4, fontSize: 32, label: '4' },
    p4_label: { top: 63, left: 63, width: 10, height: 2, fontSize: 9, label: 'PLAYERS' },
    p4_icon: { top: 60, left: 66, width: 4, height: 3, fontSize: 16, label: '小人' },

    confirm: {
      top: 83.3,
      left: 15,
      width: 70,
      height: 8,
      radius: 999,
      fontSize: 16,
      label: '確認人數並開始冒險',
    },
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 移除同步 setIsReady(false) 避免渲染循環，因為初始值已為 false
    if (containerRef.current && !isDesignMode) {
      gsap.fromTo(
        '.ui-animate',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out',
          onComplete: () => setIsReady(true),
        }
      );
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
      {/* 注入動態對位變數 */}
      <style dangerouslySetInnerHTML={{ __html: layoutStyles }} />

      <div
        ref={containerRef}
        className="relative w-full h-full select-none text-white overflow-hidden flex flex-col items-center"
      >
        {/* 設計模式按鈕 (僅開發環境可見) - 已隱藏 */}
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

        {/* 背景：數位網格與強化漸層 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-transparent" />
          <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(30,58,138,0.25)_0%,transparent_70%)]" />
        </div>

        {/* 頂部導航：左側返回，右側改為天平影片 */}
        <div className="w-full flex items-center justify-between ui-animate z-30 px-8 pt-safe mt-4 relative">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-[18px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md shadow-xl"
            title="BACK"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>

          {/* 右上角 Logo 影片區：去白邊版本 */}
          <div className="relative ui-animate">
            <div className="w-16 aspect-square rounded-2xl bg-transparent shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 backdrop-blur-xl group">
                <video
                  src="/assets/logo_anim.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 引導文字：左對齊 Noir 風格 */}
        {layout.header_title && (
          <h2 className="header_title-pos font-black tracking-[0.2em] text-white reg-animate text-left pl-10 border-l-4 border-blue-600/50 h-auto flex items-center">
            {layout.header_title.label}
          </h2>
        )}
        {layout.header_subtitle && (
          <div className="header_subtitle-pos reg-animate pl-10 mt-1 w-full max-w-[80%] flex flex-col items-start">
            <div className="flex items-start gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500/50 to-transparent rounded-full mt-1" />
              <p className="text-slate-400 font-medium whitespace-pre-line leading-relaxed text-left text-[13px] tracking-tight">
                {layout.header_subtitle.label}
              </p>
            </div>
          </div>
        )}

        {/* 1-4 玩家選擇區原子化：疊加模式 */}
        <div
          className={`absolute inset-0 z-20 pointer-events-none transition-all duration-500 ${isDesignMode ? 'opacity-40 grayscale blur-[0.2px]' : 'opacity-100'}`}
        >
          {[1, 2, 3, 4].map((count, idx) => {
            const prefix = `p${count}`;
            if (!layout[`${prefix}_box`]) return null;
            const isActive = selectedCount === count;
            return (
              <React.Fragment key={prefix}>
                <button
                  onClick={() => setSelectedCount(count)}
                  className={`
                        ui-animate flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group overflow-hidden ${isReady ? 'pointer-events-auto' : 'pointer-events-none'}
                        ${prefix}_box-pos
                        ${
                          isActive
                            ? 'bg-[#0f172a] border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3),inset_0_0_20px_rgba(59,130,246,0.2)] scale-105 z-30'
                            : 'bg-[#0f172a]/40 border border-white/10 hover:border-white/30 z-20'
                        }
                      `}
                  title={`${count} PLAYER`}
                />

                {/* 數字 */}
                {layout[`${prefix}_num`] && (
                  <div
                    className={`${prefix}_num-pos font-black transition-colors pointer-events-none z-40 ${isActive ? 'text-white' : 'text-slate-300'}`}
                  >
                    {layout[`${prefix}_num`].label}
                  </div>
                )}

                {/* 標籤 */}
                {layout[`${prefix}_label`] && (
                  <div
                    className={`${prefix}_label-pos font-bold tracking-[0.2em] uppercase transition-colors pointer-events-none z-40 ${isActive ? 'text-blue-400' : 'text-slate-500'}`}
                  >
                    {layout[`${prefix}_label`].label}
                  </div>
                )}

                {/* 圖示 (動態數量與靈動動畫) */}
                {layout[`${prefix}_icon`] && (
                  <div
                    className={`${prefix}_icon-pos transition-all duration-500 pointer-events-none z-40 flex items-center justify-center
                    ${isActive ? 'text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] scale-110' : 'text-slate-600 opacity-60 scale-100'}
                  `}
                  >
                    <div className="relative w-full h-full animate-bounce-subtle">
                      {idx === 0 && <User className="w-full h-full" />}
                      {idx === 1 && (
                        <>
                          <User className="absolute -left-1 -top-1 w-4/5 h-4/5 opacity-50" />
                          <User className="absolute left-1 top-1 w-full h-full" />
                        </>
                      )}
                      {idx === 2 && (
                        <div className="relative w-full h-full scale-100">
                          <User className="absolute left-1/2 -translate-x-1/2 -top-1 w-3/4 h-3/4 z-10" />
                          <User className="absolute left-0 bottom-0 w-2/3 h-2/3 opacity-60" />
                          <User className="absolute right-0 bottom-0 w-2/3 h-2/3 opacity-60" />
                        </div>
                      )}
                      {idx === 3 && (
                        <div className="relative w-full h-full">
                          <User className="absolute -left-1 -top-1 w-3/4 h-3/4 opacity-40" />
                          <User className="absolute left-1 -top-1 w-3/4 h-3/4 opacity-70" />
                          <Users className="absolute left-0 top-1 w-full h-full" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* 下方確認按鈕 */}
          {layout.confirm && (
            <button
              onClick={() => onConfirm(selectedCount)}
              className={`ui-animate bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-black tracking-[0.3em] text-sm shadow-[0_8px_25px_rgba(37,99,235,0.4)] active:scale-95 transition-all cursor-pointer border border-white/10 flex items-center justify-center overflow-hidden group confirm-pos ${isReady ? 'pointer-events-auto' : 'pointer-events-none'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>確認人數並開始冒險</span>
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
                <div className="w-full h-full flex flex-col items-center justify-center bg-blue-600/20 border-2 border-blue-400/50 shadow-lg">
                  <p className="font-black text-xs">{id.toUpperCase()}</p>
                </div>
              )}
            />
          </div>
        )}

        {/* 底部裝飾：已移除 */}
      </div>
    </div>
  );
}
