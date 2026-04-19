'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { START_PATH_LABELS, START_PATH_NAMES } from '@/data/setup/SetupData';
import { StartPath } from '@/types/game';
import { Scale, Feather, Shield, PenTool } from 'lucide-react';

interface ParchmentBookProps {
  activePath: StartPath;
  onPathChange: (path: StartPath) => void;
}

/**
 * 3D Parchment Dossier 2.0 - 徹底重寫版
 * 
 * 修改重點：
 * 1. 拋棄所有舊有的 CSS 補丁邏輯，採用純淨的 3D Transform 矩陣
 * 2. 引入物理三層頁面結構 (Front-Buffer-Back) 徹底根除文字透視重影
 * 3. 強化 Z-index 與 translateZ 的疊加權重，解決閃爍與穿透
 * 4. 確保代碼語法嚴謹，標籤 100% 對稱
 */
export default function ParchmentBook({ activePath }: ParchmentBookProps) {
  // --- 狀態與引用 ---
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [flippingIndex, setFlippingIndex] = useState(-1); // 正在翻轉中的頁面索引
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pages = useMemo(() => START_PATH_LABELS[activePath] || [], [activePath]);
  const totalPages = pages.length;

  // --- 視覺主題定義 ---
  const theme = useMemo(() => {
    switch (activePath) {
      case 'backdoor':
        return {
          coverColor: '#162b4d', 
          title: 'FINANCE_DOSSIER',
          icon: <Shield className="w-8 h-8 text-cyan-400/40" />,
          accent: 'border-cyan-500/30',
        };
      case 'blackbox':
        return {
          coverColor: '#3d0c0c',
          title: 'LEGACY_ARCHIVE',
          icon: <PenTool className="w-8 h-8 text-red-500/30" />,
          accent: 'border-red-900/30',
        };
      default:
        return {
          coverColor: '#7a4225', 
          title: 'NORMAL_LEDGER',
          icon: <Scale className="w-8 h-8 text-amber-600/30" />,
          accent: 'border-amber-900/30',
        };
    }
  }, [activePath]);

  // --- 手勢交互處理 ---
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartX.current;
    
    // --- 強效訊號攔截：第一頁向右滑動作在第一時間截斷 (不參與任何運算) ---
    if (currentPage === 0 && deltaX > 0) return;

    if (!isCoverOpened) {
      // 封面開啟動畫模擬
      if (deltaX < 0) {
        const rot = Math.max(-180, (deltaX / 300) * 180);
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: rot, duration: 0.1, overwrite: true });
      }
    } else {
      // 翻頁動作模擬
      if (Math.abs(deltaX) > 20) {
        const isForward = deltaX < 0;
        if (isForward && currentPage >= totalPages) return;

        const targetIdx = isForward ? currentPage : currentPage - 1;
        const target = pageRefs.current[targetIdx];
        
        if (target) {
          setFlippingIndex(targetIdx); // 標記為正在翻轉，觸發 zIndex 提權
          const startRot = isForward ? -5 : -160;
          const rot = startRot + (deltaX / 300) * 155;
          gsap.to(target, { 
            rotationY: Math.min(-5, Math.max(-160, rot)), 
            z: 30, 
            duration: 0.1, 
            overwrite: true 
          });
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;

    // --- 同步在 Up 時也攔截非法訊號 ---
    if (currentPage === 0 && deltaX > 0) {
      setIsDragging(false);
      resetCurrentPage();
      return;
    }

    setIsDragging(false);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);

    if (!isCoverOpened) {
      if (deltaX < -60) {
        setIsCoverOpened(true);
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: -180, z: -5, duration: 0.8, ease: 'power2.out' });
      } else {
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: 0, z: 80, duration: 0.5, ease: 'back.out(1.7)' });
      }
    } else {
      if (Math.abs(deltaX) > 80) {
        const isForward = deltaX < 0;
        
        if (isForward && currentPage < totalPages) {
          // 翻至下一頁
          const target = pageRefs.current[currentPage];
          if (target) {
            gsap.to(target, { 
              rotationY: -160, 
              z: 1, 
              duration: 0.6, 
              ease: 'power2.out',
              onComplete: () => {
                setFlippingIndex(-1); // 動畫結束，解除提權
              }
            });
          }
          // 狀態變更延後，確保層次更新在動畫開始之後
          setCurrentPage(prev => prev + 1);
        } else if (!isForward && currentPage > 0) {
          // 翻回上一頁
          const target = pageRefs.current[currentPage - 1];
          if (target) {
            gsap.to(target, { 
              rotationY: -5, 
              z: 1, 
              duration: 0.6, 
              ease: 'power2.out',
              onComplete: () => {
                setFlippingIndex(-1);
              }
            });
          }
          setCurrentPage(prev => prev - 1);
        } else {
          resetCurrentPage();
        }
      } else {
        resetCurrentPage();
      }
    }
  };

  const resetCurrentPage = () => {
    setFlippingIndex(-1);
    // 復位目前正在嘗試翻動的頁面 - 使用與 React Style 絕對同步的公式
    const cur = pageRefs.current[currentPage];
    if (cur) {
      const restZ = (totalPages - currentPage) * 0.5;
      gsap.to(cur, { rotationY: -5, z: restZ, duration: 0.5, ease: 'back.out(1.2)' });
    }
    
    if (currentPage > 0) {
      const prev = pageRefs.current[currentPage - 1];
      if (prev) {
        const restZ = (currentPage - 1) * 0.5;
        gsap.to(prev, { rotationY: -160, z: restZ, duration: 0.5, ease: 'back.out(1.2)' });
      }
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-auto">
      {/* 外部縮放框架穩定層 */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-[420px] h-[540px] perspective-3000 select-none cursor-grab active:cursor-grabbing transform-style-3d rotate-x-2 touch-none"
      >
        
        {/* 1. 皮革底座 - 確保背面的穩固渲染 */}
        <div 
          className="absolute inset-0 transform-style-3d pointer-events-none"
          style={{ transform: 'translateZ(-100px)' }}
        >
          {/* 右底蓋 */}
          <div 
            className="absolute left-0 right-[-10px] inset-y-[-5px] rounded-r-xl border-r-[10px] border-black/30 shadow-2xl"
            style={{ 
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")'
            }}
          />
          {/* 左底蓋 (僅在開啟後顯眼) */}
          <div 
            className="absolute left-[-420px] right-0 inset-y-[-5px] rounded-l-xl border-l-[10px] border-black/30"
            style={{ 
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
              transform: isCoverOpened ? 'rotateY(0deg)' : 'rotateY(90deg)'
            }}
          />
        </div>

        {/* 2. 重生版精確內頁系統 */}
        <div className="absolute inset-0 transform-style-3d" style={{ zIndex: 10 }}>
          {pages.map((content, idx) => (
            <div
              key={idx}
              ref={(el) => { pageRefs.current[idx] = el; }}
              className="absolute inset-0 origin-left transform-style-3d"
              style={{
                // 核心 Z 軸排序邏輯：解決 Z-Fighting (視覺 100% 還原為 0.5px 間距)
                transform: idx < currentPage 
                  ? `rotateY(-160deg) translateZ(${idx * 0.5}px)` 
                  : `rotateY(-5deg) translateZ(${(totalPages - idx) * 0.5}px)`,
                zIndex: idx === flippingIndex ? 500 : (idx < currentPage ? 5 + idx : 100 - idx)
              }}
            >
              {/* [正面層] */}
              <div className="absolute inset-0 transform-style-3d backface-hidden">
                {/* 1. 100% 不透明物理背板 - 殺死重影的關鍵 */}
                <div 
                  className="absolute inset-0 bg-[#ecd8b0] shadow-inner"
                  style={{ 
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")',
                    zIndex: 1
                  }}
                />
                
                {/* 2. 摺痕陰影層 */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/25 to-transparent z-[2]" />

                {/* 3. 內文內容層 */}
                <div className="relative z-10 w-full h-full p-10 pl-20 flex flex-col">
                  <div className="mb-4 opacity-20 flex justify-end">{theme.icon}</div>
                  <div className="flex-grow overflow-y-auto custom-scrollbar pr-4">
                    <p className={`text-[#3c2a1c] font-serif text-[17px] leading-relaxed text-justify whitespace-pre-wrap break-all ${idx === 0 ? 'first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left' : ''}`}>
                      {content}
                    </p>
                  </div>
                  <div className="mt-4 text-[9px] font-black opacity-10 italic tracking-widest text-right">
                    P-{idx + 1} / {totalPages}
                  </div>
                </div>
              </div>

              {/* [背面層] - 模擬紙張背面的材質質感 */}
              <div 
                className="absolute inset-0 backface-hidden [transform:rotateY(-180deg)]"
                style={{ 
                  backgroundColor: '#d9c5a3',
                  backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")',
                  zIndex: 0
                }}
              />
            </div>
          ))}
        </div>

        {/* 3. 2.0版 封面系統 */}
        <div
          ref={coverRef}
          className="absolute inset-0 origin-left transform-style-3d"
          style={{
            zIndex: isCoverOpened ? 5 : 200,
            transform: isCoverOpened ? 'rotateY(-180deg) translateZ(-5px)' : 'translateZ(80px)'
          }}
        >
          {/* 封面正面 */}
          <div 
            className="absolute inset-0 rounded-r-xl border-r-[12px] border-black/30 flex flex-col items-center justify-center p-12 backface-hidden shadow-2xl"
            style={{ 
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")'
            }}
          >
            <div className={`w-full h-full border-2 ${theme.accent} border-dashed flex flex-col items-center justify-center p-8`}>
              <div className="mb-6 opacity-30">{theme.icon}</div>
              <h2 className="text-xl font-black text-white/40 tracking-[0.4em] uppercase text-center italic">
                {START_PATH_NAMES[activePath]}
              </h2>
            </div>
          </div>
          
          {/* 封面背面 - 絲絨質感 */}
          <div 
            className="absolute inset-0 backface-hidden [transform:rotateY(-180deg)] rounded-l-xl"
            style={{ backgroundColor: '#1a1a1a', borderLeft: '8px solid rgba(0,0,0,0.5)' }}
          >
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
          </div>
        </div>

      </div>
    </div>
  );
}
