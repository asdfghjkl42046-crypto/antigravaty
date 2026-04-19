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
 * 3D Parchment Dossier 6.0 - 完備交互版 (雙面 + 翻頁 + 合書 + 左翼)
 */
export default function ParchmentBook({ activePath }: ParchmentBookProps) {
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [flippingIndex, setFlippingIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const leftWingRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pages = useMemo(() => START_PATH_LABELS[activePath] || [], [activePath]);
  const totalPages = pages.length;

  const theme = useMemo(() => {
    switch (activePath) {
      case 'backdoor':
        return {
          coverColor: '#162b4d',
          title: '融資創業',
          icon: <Shield className="w-8 h-8 text-cyan-400/40" />,
          accent: 'border-cyan-500/30',
          textAccent: 'text-cyan-600/60',
          lineAccent: 'bg-cyan-900/20',
          dropCap: 'text-cyan-900/80'
        };
      case 'blackbox':
        return {
          coverColor: '#3d0c0c',
          title: '家族企業',
          icon: <PenTool className="w-8 h-8 text-red-500/30" />,
          accent: 'border-red-900/30',
          textAccent: 'text-red-700/60',
          lineAccent: 'bg-red-900/20',
          dropCap: 'text-red-900/80'
        };
      default:
        return {
          coverColor: '#7a4225',
          title: '白手起家',
          icon: <Scale className="w-8 h-8 text-amber-600/30" />,
          accent: 'border-amber-900/30',
          textAccent: 'text-amber-900/40',
          lineAccent: 'bg-amber-900/20',
          dropCap: 'text-amber-900'
        };
    }
  }, [activePath]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;

    if (!isCoverOpened) {
      if (deltaX < 0) {
        const rot = Math.max(-180, (deltaX / 300) * 180);
        if (coverRef.current)
          gsap.to(coverRef.current, { rotationY: rot, duration: 0.1, overwrite: true });
        if (leftWingRef.current)
          gsap.to(leftWingRef.current, { rotationY: rot, duration: 0.1, overwrite: true });
      }
    } else {
      const isForward = deltaX < 0;

      // 合上封面預覽 (第一頁且右翻)
      if (!isForward && currentPage === 0) {
        const rot = -180 + (deltaX / 300) * 175;
        if (coverRef.current)
          gsap.to(coverRef.current, { rotationY: Math.min(-5, rot), z: 50, duration: 0.1 });
        if (leftWingRef.current)
          gsap.to(leftWingRef.current, { rotationY: Math.min(90, rot + 180), duration: 0.1 });
        return;
      }

      // 標準內頁翻轉預覽
      if (Math.abs(deltaX) > 20) {
        if (isForward && currentPage >= totalPages) return;
        const targetIdx = isForward ? currentPage : currentPage - 1;
        if (targetIdx < 0) return;
        const target = pageRefs.current[targetIdx];
        if (target) {
          setFlippingIndex(targetIdx);
          const startRot = isForward ? -5 : -160;
          const rot = startRot + (deltaX / 300) * 155;
          gsap.to(target, {
            rotationY: Math.min(-5, Math.max(-160, rot)),
            z: 150,
            duration: 0.1,
            overwrite: true,
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
        gsap.to(coverRef.current, { rotationY: -180, z: -10, duration: 0.8, ease: 'power2.out' });
        gsap.to(leftWingRef.current, {
          rotationY: 0,
          duration: 0.8,
          ease: 'power2.out',
          onStart: () => {
            if (leftWingRef.current) leftWingRef.current.style.visibility = 'visible';
          },
        });
      } else {
        gsap.to(coverRef.current, { rotationY: 0, z: 120, duration: 0.5, ease: 'back.out(1.7)' });
        gsap.to(leftWingRef.current, { rotationY: 90, duration: 0.5 });
      }
    } else {
      if (Math.abs(deltaX) > 80) {
        const isForward = deltaX < 0;

        // 合上封面執行
        if (!isForward && currentPage === 0) {
          setIsCoverOpened(false);
          gsap.to(coverRef.current, { rotationY: 0, z: 120, duration: 0.8, ease: 'power2.out' });
          gsap.to(leftWingRef.current, {
            rotationY: 90,
            duration: 0.6,
            onComplete: () => {
              if (leftWingRef.current) leftWingRef.current.style.visibility = 'hidden';
            },
          });
          return;
        }

        // 內頁翻轉執行
        if (isForward && currentPage < totalPages) {
          const target = pageRefs.current[currentPage];
          if (target) {
            gsap.to(target, {
              rotationY: -160,
              z: currentPage * 2,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => setFlippingIndex(-1),
            });
          }
          setCurrentPage((prev) => prev + 1);
        } else if (!isForward && currentPage > 0) {
          const targetIdx = currentPage - 1;
          const target = pageRefs.current[targetIdx];
          if (target) {
            gsap.to(target, {
              rotationY: -5,
              z: (totalPages - targetIdx) * 2,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => setFlippingIndex(-1),
            });
          }
          setCurrentPage((prev) => prev - 1);
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
    if (cur) gsap.to(cur, { rotationY: -5, z: (totalPages - currentPage) * 2, duration: 0.4 });
    if (currentPage > 0) {
      const prev = pageRefs.current[currentPage - 1];
      if (prev) gsap.to(prev, { rotationY: -160, z: (currentPage - 1) * 2, duration: 0.4 });
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-auto">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-[420px] h-[540px] perspective-3000 select-none cursor-grab active:cursor-grabbing transform-style-3d touch-none scale-75"
      >
        <div
          className="absolute inset-0 transform-style-3d"
          style={{ transform: 'translateZ(-110px)' }}
        >
          <div
            className="absolute left-0 right-[-10px] inset-y-[-5px] rounded-l-xl border-l-[12px] border-black/40 shadow-2xl"
            style={{
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          />
          <div
            ref={leftWingRef}
            className="absolute right-full inset-y-[-5px] w-full rounded-r-xl border-r-[12px] border-black/40 shadow-2xl origin-right"
            style={{
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
              transform: `rotateY(${isCoverOpened ? 0 : 90}deg)`,
              visibility: isCoverOpened ? 'visible' : 'hidden',
            }}
          />
        </div>

        {/* 1.5 書脊中心陰影溝壑 (Seal the Gutter) */}
        <div 
          className="absolute left-[-2px] w-[16px] inset-y-[-5px] bg-black/80 z-[5] blur-[2px]"
          style={{ transform: 'translateZ(-50px)' }}
        />

        <div className="absolute inset-0 transform-style-3d" style={{ zIndex: 10, transform: 'translateX(5px)' }}>
          {pages.map((content, idx) => {
            const isFlipping = flippingIndex === idx;
            const isOpened = idx < currentPage;
            const staticZ = isOpened ? idx * 2 : (totalPages - idx) * 2;

            return (
              <div
                key={idx}
                ref={(el) => {
                  pageRefs.current[idx] = el;
                }}
                className="absolute inset-y-0 left-1 right-1 origin-left transform-style-3d"
                style={{
                  transform: `translate3d(0, 0, ${isFlipping ? 150 : staticZ}px) rotateY(${isOpened ? -160 : -5}deg)`,
                  zIndex: isFlipping ? 1000 : isOpened ? 100 + idx : 100 - idx,
                }}
              >
                <div
                  className="absolute inset-0 backface-hidden bg-[#fdfaf2] shadow-xl border-l border-black/5 rounded-l-2xl"
                  style={{
                    backgroundImage:
                      'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                  }}
                >
                  <div className="absolute inset-0 p-10 flex flex-col pointer-events-none">
                    <div className={`flex items-center justify-between border-b ${theme.lineAccent.replace('bg-', 'border-')} pb-4 mb-8 opacity-30`}>
                      <span className={`text-[10px] font-black ${theme.textAccent} uppercase tracking-[0.3em]`}>
                        卷宗紀錄 - 第 {idx + 1} 頁
                      </span>
                      <div className={`w-1.5 h-1.5 rounded-full ${theme.lineAccent}`} />
                    </div>
                    <div className="flex-grow overflow-y-auto">
                      <p
                        className={`text-[17px] font-serif italic text-amber-950/80 leading-relaxed indent-8 whitespace-pre-wrap ${idx === 0 ? `first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:${theme.dropCap}` : ''}`}
                      >
                        {content}
                      </p>
                    </div>
                    <div className={`mt-4 flex justify-between items-center text-[9px] font-bold ${theme.textAccent} tracking-widest opacity-50`}>
                      <span>CONFIDENTIAL</span>
                      <span>
                        頁次 {idx + 1} / {totalPages}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute inset-0 backface-hidden bg-[#fdfaf2] [transform:rotateY(-180deg)] shadow-xl rounded-r-2xl"
                  style={{
                    backgroundImage:
                      'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                  }}
                >
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/15 to-transparent" />
                </div>
              </div>
            );
          })}
        </div>

        <div
          ref={coverRef}
          className="absolute inset-0 origin-left transform-style-3d cursor-pointer"
          style={{
            transform: `translate3d(0, 0, ${isCoverOpened ? -10 : 120}px) rotateY(${isCoverOpened ? -165 : -5}deg)`,
            zIndex: 300,
          }}
        >
          <div
            className="absolute inset-0 backface-hidden rounded-l-2xl border-l-[12px] border-black/50 shadow-2xl flex flex-col items-center justify-center p-8 gap-8"
            style={{
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
              boxShadow: 'inset 20px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
            <div className="absolute inset-4 border border-white/10 rounded-sm pointer-events-none" />
            <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-2xl">
              {theme.icon}
            </div>
            <div className="text-center px-4">
              <div className="h-px w-12 bg-white/20 mx-auto mb-6" />
              <h2 className="text-2xl font-black tracking-[0.3em] text-white/90 uppercase leading-tight">
                {theme.title}
              </h2>
              <p className="text-[10px] font-bold text-white/30 tracking-[0.6em] uppercase mt-4">
                初始創業路徑背景
              </p>
            </div>
          </div>

          <div
            className="absolute inset-0 backface-hidden [transform:rotateY(-180deg)] rounded-r-2xl border-r-[12px] border-black/60 shadow-inner"
            style={{
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-4 border border-white/5 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
