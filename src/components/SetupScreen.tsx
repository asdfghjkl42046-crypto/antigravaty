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

  // 初始佈局數據 (根據使用者最新手動調校後的 JSON 更新)
  const [layout, setLayout] = useState<Record<string, AlignmentElement>>({
    p1: { top: 7, left: 20, width: 30, height: 26.5, radius: 30 },
    p2: { top: 7, left: 53, width: 30, height: 26.5, radius: 30 },
    p3: { top: 40, left: 20, width: 30, height: 26.5, radius: 30 },
    p4: { top: 40, left: 53, width: 30, height: 26.5, radius: 30 },
    confirm: { 
      top: 72.81735834251363, 
      left: 16.240476190476194, 
      width: 67.61904761904762, 
      height: 9.310248572981493, 
      radius: 999 
    },
  });

  useEffect(() => {
    if (containerRef.current && !isDesignMode) {
      gsap.fromTo(
        '.ui-animate',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [isDesignMode]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#020617]">
      <div 
        ref={containerRef} 
        className="relative h-full max-h-[92dvh] w-full max-w-[420px] select-none text-white overflow-hidden flex flex-col items-center"
      >
        {/* 設計模式按鈕 (僅開發環境可見) */}
        <button 
          onClick={() => setIsDesignMode(!isDesignMode)}
          className="fixed top-20 right-4 z-[2000] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
          title="切換排版模式"
        >
          {isDesignMode ? <Eye className="w-5 h-5 text-emerald-400" /> : <Settings2 className="w-5 h-5" />}
        </button>

        {/* 背景：數位網格與強化漸層 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#020617]" />
          <div 
            className="absolute inset-0 opacity-[0.12]" 
            style={{ 
              backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
              backgroundSize: '16px 16px'
            }} 
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(30,58,138,0.25)_0%,transparent_70%)]" />
        </div>

        {/* 頂部導航：左側返回，右側改為天平影片 */}
        <div className="w-full flex items-center justify-between ui-animate z-30 px-8 pt-6 relative">
          <button 
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center rounded-[18px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md shadow-xl"
            title="BACK"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          
          {/* 右上角 Logo 影片區：去白邊版本 */}
          <div className="relative ui-animate">
            <div className="w-16 aspect-square rounded-2xl bg-transparent shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center">
                <video
                  src="/assets/logo_anim.mp4"
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 引導文字：向上微調騰出空間 */}
        <div className="w-full mt-6 px-10 ui-animate relative z-10">
          <h2 className="text-3xl font-black tracking-tight text-white">選擇參與人數</h2>
          <p className="text-xs text-slate-400 mt-2 font-medium">請根據您的冒險需求選取合適的團隊規模</p>
        </div>

        {/* 1-4 玩家選擇區 (排版控制區) */}
        <div className="relative w-full flex-grow mt-4">
          
          {/* 排版工具 */}
          {isDesignMode && (
            <AlignmentTool 
              containerRef={containerRef}
              initialElements={layout}
              onUpdate={setLayout}
              renderElement={(id, el) => (
                <div 
                  className={`w-full h-full rounded-[${el.radius}px] flex flex-col items-center justify-center bg-blue-600/20 border-2 border-blue-400/50 shadow-lg`}
                  style={{ borderRadius: `${el.radius}px` }}
                >
                  <p className="font-black text-xs">{id.toUpperCase()}</p>
                </div>
              )}
            />
          )}

          {/* 正常渲染區：同步新視覺風格 */}
          {!isDesignMode && (
            <div className="absolute inset-0">
               {/* 渲染 4 個玩家按鈕 */}
               {[1, 2, 3, 4].map((count) => {
                  const id = `p${count}`;
                  const isActive = selectedCount === count;
                  const el = layout[id];
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedCount(count)}
                      className={`
                        ui-animate absolute flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group overflow-hidden
                        ${isActive 
                          ? 'bg-[#0f172a] border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3),inset_0_0_20px_rgba(59,130,246,0.2)] scale-105 z-20' 
                          : 'bg-[#0f172a]/40 border border-white/10 hover:border-white/30 z-10'
                        }
                      `}
                      style={{ 
                        top: `${el.top}%`,
                        left: `${el.left}%`,
                        width: `${el.width}%`,
                        height: `${el.height}%`,
                        borderRadius: `${el.radius}px` 
                      }}
                      title={`${count} PLAYER`}
                    >
                      {/* 背景裝飾 */}
                      {isActive && <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />}
                      
                      <div className={`mb-3 p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
                        {count === 1 ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                      </div>
                      <div className={`text-2xl font-black transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>{count}</div>
                      <div className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                        {count === 1 ? 'Player' : 'Players'}
                      </div>
                    </button>
                  );
                })}

              {/* 下方確認按鈕 */}
              <button 
                onClick={() => onConfirm(selectedCount)}
                className="ui-animate absolute bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-black tracking-[0.3em] text-sm shadow-[0_8px_25px_rgba(37,99,235,0.4)] active:scale-95 transition-all cursor-pointer border border-white/10 flex items-center justify-center overflow-hidden group"
                style={{ 
                  top: `${layout.confirm.top}%`,
                  left: `${layout.confirm.left}%`,
                  width: `${layout.confirm.width}%`,
                  height: `${layout.confirm.height}%`,
                  borderRadius: `${layout.confirm.radius}px` 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span>確認人數並開始冒險</span>
              </button>
            </div>
          )}
        </div>

        {/* 底部裝飾：已移除 */}
      </div>
    </div>
  );
}
