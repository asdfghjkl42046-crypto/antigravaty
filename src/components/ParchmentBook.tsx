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
 * 3D Parchment Dossier 4.0 - 結構保留重寫版 (滑動交互)
 * 
 * 修改重點：
 * 1. 邏輯結構：100% 保留滑動翻頁 (Pointer Events) 的交互構想。
 * 2. 徹底重寫：重新推導 3D 深度矩陣，將間距設為物理級 20px，根絕穿透。
 * 3. 全繁體化：所有標籤與內部系統文字全數改為繁體中文。
 */
export default function ParchmentBook({ activePath }: ParchmentBookProps) {
  // --- 狀態控制 ---
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [flippingIndex, setFlippingIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pages = useMemo(() => START_PATH_LABELS[activePath] || [], [activePath]);
  const totalPages = pages.length;

  const theme = useMemo(() => {
    switch (activePath) {
      case 'backdoor':
        return {
          coverColor: '#162b4d',
          title: '融資創業卷宗',
          icon: <Shield className="w-8 h-8 text-cyan-400/40" />,
          accent: 'border-cyan-500/30',
        };
      case 'blackbox':
        return {
          coverColor: '#3d0c0c',
          title: '家族企業檔案',
          icon: <PenTool className="w-8 h-8 text-red-500/30" />,
          accent: 'border-red-900/30',
        };
      default:
        return {
          coverColor: '#7a4225',
          title: '標準創業帳本',
          icon: <Scale className="w-8 h-8 text-amber-600/30" />,
          accent: 'border-amber-900/30',
        };
    }
  }, [activePath]);

  // --- 核心交互邏輯：滑動 (Pointer Events) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;

    // 攔截非法訊號 (第一頁不給後翻)
    if (currentPage === 0 && deltaX > 0) return;

    if (!isCoverOpened) {
      if (deltaX < 0) {
        const rot = Math.max(-180, (deltaX / 300) * 180);
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: rot, duration: 0.1, overwrite: true });
      }
    } else {
      if (Math.abs(deltaX) > 20) {
        const isForward = deltaX < 0;
        if (isForward && currentPage >= totalPages) return;
        const targetIdx = isForward ? currentPage : currentPage - 1;
        const target = pageRefs.current[targetIdx];
        if (target) {
          setFlippingIndex(targetIdx);
          const startRot = isForward ? -5 : -160;
          const rot = startRot + (deltaX / 300) * 155;
          gsap.to(target, { 
            rotationY: Math.min(-5, Math.max(-160, rot)), 
            z: 50, 
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
    setIsDragging(false);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);

    if (!isCoverOpened) {
      if (deltaX < -60) {
        setIsCoverOpened(true);
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: -180, z: -10, duration: 0.8, ease: 'power2.out' });
      } else {
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: 0, z: 80, duration: 0.5, ease: 'back.out(1.7)' });
      }
    } else {
      if (Math.abs(deltaX) > 80) {
        const isForward = deltaX < 0;
        if (isForward && currentPage < totalPages) {
          const target = pageRefs.current[currentPage];
          if (target) gsap.to(target, { rotationY: -160, z: 2, duration: 0.6, ease: 'power2.out', onComplete: () => setFlippingIndex(-1) });
          setCurrentPage(prev => prev + 1);
        } else if (!isForward && currentPage > 0) {
          const target = pageRefs.current[currentPage - 1];
          if (target) gsap.to(target, { rotationY: -5, z: 2, duration: 0.6, ease: 'power2.out', onComplete: () => setFlippingIndex(-1) });
          setCurrentPage(prev => prev - 1);
        } else {
          resetPages();
        }
      } else {
        resetPages();
      }
    }
  };

  const resetPages = () => {
    setFlippingIndex(-1);
    const cur = pageRefs.current[currentPage];
    if (cur) gsap.to(cur, { rotationY: -5, z: (totalPages - currentPage) * 20, duration: 0.5, ease: 'back.out(1.2)' });
    if (currentPage > 0) {
      const prev = pageRefs.current[currentPage - 1];
      if (prev) gsap.to(prev, { rotationY: -160, z: (currentPage - 1) * 20, duration: 0.5, ease: 'back.out(1.2)' });
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-auto">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-[420px] h-[540px] perspective-3000 select-none cursor-grab active:cursor-grabbing transform-style-3d touch-none"
      >
        {/* 1. 皮革底盤 - Z: -60px */}
        <div className="absolute inset-0 transform-style-3d" style={{ transform: 'translateZ(-60px)' }}>
          <div 
            className="absolute inset-x-[-10px] inset-y-[-5px] rounded-xl border-r-[12px] border-black/40 shadow-2xl"
            style={{ backgroundColor: theme.coverColor, backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }}
          />
        </div>

        {/* 2. 重生內頁系統 - 20px 物理疊層 */}
        <div className="absolute inset-0 transform-style-3d" style={{ zIndex: 10 }}>
          {pages.map((content, idx) => (
            <div
              key={idx}
              ref={el => { pageRefs.current[idx] = el; }}
              className="absolute inset-0 origin-left transform-style-3d bg-[#fdfaf2] shadow-xl"
              style={{
                transform: `translate3d(0, 0, ${idx < currentPage ? idx * 20 : (totalPages - idx) * 20}px) rotateY(${idx < currentPage ? -160 : -5}deg)`,
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                backfaceVisibility: 'hidden',
                zIndex: idx === flippingIndex ? 500 : (idx < currentPage ? 100 + idx : 100 - idx)
              }}
            >
              <div className="absolute inset-0 p-10 flex flex-col pointer-events-none">
                 <div className="flex items-center justify-between border-b border-amber-900/10 pb-4 mb-8">
                   <span className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em]">卷宗紀錄 - 第 {idx+1} 頁</span>
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-900/20" />
                 </div>
                 <div className="flex-grow overflow-y-auto">
                    <p className="text-[17px] font-serif italic text-amber-950/80 leading-relaxed indent-8 whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-amber-900">
                      {content}
                    </p>
                 </div>
                 <div className="mt-4 flex justify-between items-center text-[9px] font-bold text-amber-900/20 italic tracking-widest">
                   <span>CONFIDENTIAL ARCHIVE</span>
                   <span>頁次 {idx+1} / {totalPages}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. 2.0版 封面系統重製 */}
        <div
          ref={coverRef}
          className="absolute inset-0 origin-left transform-style-3d cursor-pointer"
          style={{
            backgroundColor: theme.coverColor,
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            transform: `translate3d(0, 0, ${isCoverOpened ? -10 : 120}px) rotateY(${isCoverOpened ? -165 : -5}deg)`,
            backfaceVisibility: 'hidden',
            zIndex: 200,
            boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.5), 15px 15px 50px rgba(0,0,0,0.8)'
          }}
        >
          <div className="absolute inset-4 border border-white/10 rounded-sm flex flex-col items-center justify-center p-8 gap-8">
             <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-2xl">
               {theme.icon}
             </div>
             <div className="text-center px-4">
               <div className="h-px w-12 bg-white/20 mx-auto mb-6" />
               <h2 className="text-2xl font-black tracking-[0.3em] text-white/90 uppercase leading-tight">{theme.title}</h2>
               <p className="text-[10px] font-bold text-white/30 tracking-[0.6em] uppercase mt-4">初始創業路徑背景</p>
             </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .transform-origin-left { transform-origin: left center; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
}
