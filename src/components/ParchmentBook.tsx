'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { SystemStrings } from '@/data/SystemStrings';
import { StartPath } from '@/types/game';
import { Scale, Feather, Shield, PenTool } from 'lucide-react';

interface ParchmentBookProps {
  activePath: StartPath;
  onPathChange: (path: StartPath) => void;
}

/**
 * 3D Parchment Dossier 4.0 - 結構保留重寫版 (滑動交互)
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

  const currentPageRef = useRef(0);

  const pages = useMemo(
    () => SystemStrings.SETUP.START_PATH_LABELS[activePath] || [],
    [activePath]
  );
  const totalPages = pages.length;

  const theme = useMemo(() => {
    switch (activePath) {
      case 'backdoor':
        return {
          coverColor: '#162b4d',
          title: SystemStrings.SETUP.START_PATH_NAMES.backdoor,
          icon: <Shield className="w-8 h-8 text-cyan-400/40" />,
          accent: 'border-cyan-500/30',
        };
      case 'blackbox':
        return {
          coverColor: '#3d0c0c',
          title: SystemStrings.SETUP.START_PATH_NAMES.blackbox,
          icon: <PenTool className="w-8 h-8 text-red-500/30" />,
          accent: 'border-red-900/30',
        };
      default:
        return {
          coverColor: '#7a4225',
          title: SystemStrings.SETUP.START_PATH_NAMES.normal,
          icon: <Scale className="w-8 h-8 text-amber-600/30" />,
          accent: 'border-amber-900/30',
        };
    }
  }, [activePath]);

  // 初始化所有頁面的 GSAP transform（只跑一次，之後完全由 GSAP 控制）
  useEffect(() => {
    // 初始化頁面
    pageRefs.current.forEach((el, idx) => {
      if (!el) return;
      gsap.set(el, {
        rotationY: -5,
        z: (pages.length - idx) * 20,
      });
    });
    // 初始化封面（關閉狀態）
    if (coverRef.current) {
      gsap.set(coverRef.current, { rotationY: -5, z: 120 });
    }
  }, [pages.length]);

  // --- 核心交互邏輯 ---
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;

    if (!isCoverOpened) {
      // 封面未開：左滑預覽開封面
      if (deltaX < 0) {
        const rot = Math.max(-180, (deltaX / 300) * 180);
        if (coverRef.current)
          gsap.to(coverRef.current, { rotationY: rot, duration: 0.1, overwrite: true });
      }
    } else {
      if (Math.abs(deltaX) > 20) {
        const isForward = deltaX < 0;
        const cur = currentPageRef.current;

        // 往前翻（左滑）：拖動當前頁
        if (isForward) {
          if (cur >= totalPages) return;
          const target = pageRefs.current[cur];
          if (target) {
            setFlippingIndex(cur);
            const rot = -5 + (deltaX / 300) * 155;
            gsap.to(target, {
              rotationY: Math.max(-160, Math.min(-5, rot)),
              z: 50,
              duration: 0.1,
              overwrite: true,
            });
          }
        } else {
          // 往回翻（右滑）：cur === 0 時拖封面，否則拖上一頁
          if (cur === 0) {
            // 從第一頁往右滑 → 預覽關閉封面（封面從 -180 往後）
            const rot = Math.min(-5, -180 + ((-deltaX) / 300) * 175);
            if (coverRef.current)
              gsap.to(coverRef.current, { rotationY: rot, z: 120, duration: 0.1, overwrite: true });
          } else {
            const target = pageRefs.current[cur - 1];
            if (target) {
              setFlippingIndex(cur - 1);
              const rot = -160 + ((-deltaX) / 300) * 155;
              gsap.to(target, {
                rotationY: Math.min(-5, Math.max(-160, rot)),
                z: 50,
                duration: 0.1,
                overwrite: true,
              });
            }
          }
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
        if (coverRef.current)
          gsap.to(coverRef.current, { rotationY: -180, z: -10, duration: 0.8, ease: 'power2.out' });
      } else {
        if (coverRef.current)
          gsap.to(coverRef.current, { rotationY: 0, z: 80, duration: 0.5, ease: 'back.out(1.7)' });
      }
    } else {
      if (Math.abs(deltaX) > 80) {
        const isForward = deltaX < 0;
        const cur = currentPageRef.current;

        if (isForward && cur < totalPages) {
          // 往前翻：當前頁翻到已讀側
          const target = pageRefs.current[cur];
          if (target)
            gsap.to(target, {
              rotationY: -160,
              z: cur * 20 + 2,
              duration: 0.6,
              ease: 'power2.out',
              onComplete: () => {
                currentPageRef.current = cur + 1;
                setCurrentPage(cur + 1);
                setFlippingIndex(-1);
              },
            });
        } else if (!isForward) {
          if (cur === 0) {
            // 在第一頁往右滑超過閾值 → 封面翻回關閉
            gsap.to(coverRef.current, {
              rotationY: -5,
              z: 120,
              duration: 0.7,
              ease: 'power2.out',
              onComplete: () => setIsCoverOpened(false),
            });
            setFlippingIndex(-1);
          } else {
            // 往回翻：把上一頁翻回未讀側
            const idx = cur - 1;
            const target = pageRefs.current[idx];
            if (target)
              gsap.to(target, {
                rotationY: -5,
                z: (totalPages - idx) * 20,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => {
                  currentPageRef.current = idx;
                  setCurrentPage(idx);
                  setFlippingIndex(-1);
                },
              });
          }
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
    if (cur)
      gsap.to(cur, {
        rotationY: -5,
        z: (totalPages - currentPage) * 20,
        duration: 0.5,
        ease: 'back.out(1.2)',
      });
    if (currentPage > 0) {
      const prev = pageRefs.current[currentPage - 1];
      if (prev)
        gsap.to(prev, {
          rotationY: -160,
          z: (currentPage - 1) * 20,
          duration: 0.5,
          ease: 'back.out(1.2)',
        });
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
        {/* 1. 皮革底盤 */}
        <div className="absolute inset-0 transform-style-3d" style={{ transform: 'translateZ(-60px)' }}>
          <div 
            className="absolute inset-x-[-10px] inset-y-[-5px] rounded-xl border-r-[12px] border-black/40 shadow-2xl"
            style={{ backgroundColor: theme.coverColor, backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }}
          />
        </div>

        {/* 2. 內頁系統 */}
        <div className="absolute inset-0 transform-style-3d" style={{ zIndex: 10 }}>
          {pages.map((content, idx) => (
            <div
              key={`${activePath}-${idx}`}
              ref={el => { pageRefs.current[idx] = el; }}
              className="absolute inset-0 origin-left transform-style-3d bg-[#fdfaf2] shadow-xl"
              style={{
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
                    <p className="text-[17px] font-serif italic text-amber-950/80 leading-relaxed indent-8 whitespace-pre-wrap">
                      {idx === 0 ? (
                        <>
                          <span className="text-5xl font-black mr-3 float-left text-amber-900 leading-[0.8] mt-1">
                            {content.charAt(0)}
                          </span>
                          {content.slice(1)}
                        </>
                      ) : (
                        content
                      )}
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

        {/* 3. 封面系統 */}
        <div
          ref={coverRef}
          className="absolute inset-0 origin-left transform-style-3d cursor-pointer"
          style={{
            backgroundColor: theme.coverColor,
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            backfaceVisibility: 'hidden',
            zIndex: isCoverOpened ? 50 : 200,
            boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.5), 15px 15px 50px rgba(0,0,0,0.8)'
          }}
        >
          <div className="absolute inset-4 border border-white/5 rounded-sm flex flex-col items-center justify-center p-8 gap-12">
            <div className="w-24 h-24 rounded-[32px] bg-black/20 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
              {React.cloneElement(theme.icon as React.ReactElement<any>, {
                className: 'w-12 h-12 text-white/40',
              })}
            </div>
            <div className="text-center">
              <h2 className="text-4xl font-black tracking-[0.2em] text-white/95 uppercase leading-tight drop-shadow-2xl">
                {theme.title}
              </h2>
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
