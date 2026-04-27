'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { SYSTEM_STRINGS } from '@/data/SystemStrings';
import { CARDS_START } from '@/data/cards/CARDS_START';
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
  const isCoverOpenedRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [flippingIndex, setFlippingIndex] = useState(-1);
  const flippingIndexRef = useRef(-1);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentPageRef = useRef(0);

  const pages = useMemo(
    () => SYSTEM_STRINGS.START_PATH.getLabels(CARDS_START)[activePath] || [],
    [activePath]
  );
  const totalPages = pages.length;

  const theme = useMemo(() => {
    switch (activePath) {
      case 'backdoor':
        return {
          coverColor: '#162b4d',
          title: SYSTEM_STRINGS.START_PATH.NAMES.backdoor,
          icon: <Shield className="w-8 h-8 text-cyan-400/40" />,
          accent: 'border-cyan-500/30',
        };
      case 'blackbox':
        return {
          coverColor: '#3d0c0c',
          title: SYSTEM_STRINGS.START_PATH.NAMES.blackbox,
          icon: <PenTool className="w-8 h-8 text-red-500/30" />,
          accent: 'border-red-900/30',
        };
      default:
        return {
          coverColor: '#7a4225',
          title: SYSTEM_STRINGS.START_PATH.NAMES.normal,
          icon: <Scale className="w-8 h-8 text-amber-600/30" />,
          accent: 'border-amber-900/30',
        };
    }
  }, [activePath]);


  const setFlippingIndexBoth = (idx: number) => {
    flippingIndexRef.current = idx;
    setFlippingIndex(idx);
  };
  const setIsCoverOpenedBoth = (val: boolean) => {
    isCoverOpenedRef.current = val;
    setIsCoverOpened(val);
  };
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
    isDragging.current = true;
    dragStartX.current = e.clientX;
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);

    // 若有頁面正在動畫中，直接把 currentPageRef 推進到動畫完成後的狀態
    // 讓那頁繼續跑完，下一次拖動直接操作新的當前頁
    const animatingIdx = flippingIndexRef.current;
    if (animatingIdx === -1) return;

    // 判斷是往前翻（animatingIdx === currentPageRef）還是往回翻（animatingIdx === currentPageRef - 1）
    const cur = currentPageRef.current;
    if (animatingIdx === cur) {
      // 往前翻進行中 → 視為已翻完，cur +1
      currentPageRef.current = cur + 1;
      setCurrentPage(cur + 1);
    } else if (animatingIdx === cur - 1) {
      // 往回翻進行中 → 視為已翻完，cur -1
      currentPageRef.current = cur - 1;
      setCurrentPage(cur - 1);
    }
    // flippingIndex 不清，讓那頁動畫的 onComplete 自己清
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;

    if (!isCoverOpenedRef.current) {
      // 封面未開：左滑預覽開封面
      if (deltaX < 0) {
        const rot = Math.max(-180, (deltaX / 300) * 180);
        if (coverRef.current) gsap.set(coverRef.current, { rotationY: rot });
      }
    } else {
      if (Math.abs(deltaX) > 5) {
        const isForward = deltaX < 0;
        const cur = currentPageRef.current;

        if (isForward) {
          if (cur >= totalPages) return;
          const target = pageRefs.current[cur];
          if (target) {
            setFlippingIndexBoth(cur);
            let rot = -5 + (deltaX / 300) * 155;

            // 防穿透：不能比前一頁（正在動畫）還要翻得更深
            const prevAnimating = flippingIndexRef.current !== cur && pageRefs.current[cur - 1];
            if (prevAnimating) {
              const prevRot = gsap.getProperty(prevAnimating, 'rotationY') as number;
              // 前一頁還沒翻過 -90，新頁不能超過前一頁
              rot = Math.max(rot, prevRot - 5);
            }

            gsap.set(target, {
              rotationY: Math.max(-160, Math.min(-5, rot)),
              z: 50,
            });
          }
        } else {
          if (cur === 0) {
            const rot = Math.min(-5, -180 + (-deltaX / 300) * 175);
            if (coverRef.current) gsap.set(coverRef.current, { rotationY: rot, z: 120 });
          } else {
            const target = pageRefs.current[cur - 1];
            if (target) {
              setFlippingIndexBoth(cur - 1);
              let rot = -160 + (-deltaX / 300) * 155;

              // 防穿透：往回翻時，不能比後一頁（正在動畫）還要翻得更淺
              const nextAnimating = flippingIndexRef.current !== cur - 1 && pageRefs.current[cur];
              if (nextAnimating) {
                const nextRot = gsap.getProperty(nextAnimating, 'rotationY') as number;
                rot = Math.min(rot, nextRot + 5);
              }

              gsap.set(target, {
                rotationY: Math.min(-5, Math.max(-160, rot)),
                z: 50,
              });
            }
          }
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    isDragging.current = false;
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);

    if (!isCoverOpenedRef.current) {
      if (deltaX < -60) {
        setIsCoverOpenedBoth(true);
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
          const target = pageRefs.current[cur];
          // 立刻確定翻頁，不等動畫結束
          currentPageRef.current = cur + 1;
          setCurrentPage(cur + 1);
          if (target)
            gsap.to(target, {
              rotationY: -160,
              z: 2,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setFlippingIndexBoth(-1);
                // 如果是最後一頁翻完，延遲 0.5s 自動確認
                if (cur === totalPages - 1) {
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('confirm-path'));
                  }, 500);
                }
              },
            });
        } else if (!isForward) {
          if (cur === 0) {
            gsap.to(coverRef.current, {
              rotationY: -5,
              z: 120,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => setIsCoverOpenedBoth(false),
            });
            setFlippingIndexBoth(-1);
          } else {
            const idx = cur - 1;
            const target = pageRefs.current[idx];
            // 立刻確定翻頁，不等動畫結束
            currentPageRef.current = idx;
            setCurrentPage(idx);
            if (target)
              gsap.to(target, {
                rotationY: -5,
                z: (totalPages - idx) * 20,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => setFlippingIndexBoth(-1),
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
    const cur = currentPageRef.current;
    setFlippingIndexBoth(-1);
    const curEl = pageRefs.current[cur];
    if (curEl)
      gsap.to(curEl, {
        rotationY: -5,
        z: (totalPages - cur) * 20,
        duration: 0.5,
        ease: 'back.out(1.2)',
      });
    if (cur > 0) {
      const prev = pageRefs.current[cur - 1];
      if (prev)
        gsap.to(prev, {
          rotationY: -160,
          z: (cur - 1) * 20,
          duration: 0.5,
          ease: 'back.out(1.2)',
        });
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-auto scale-90">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-[420px] h-[540px] perspective-3000 select-none cursor-grab active:cursor-grabbing transform-style-3d touch-none"
      >
        {/* 1. 皮革底盤 */}
        <div
          className="absolute inset-0 transform-style-3d"
          style={{ transform: 'translateZ(-60px)' }}
        >
          <div 
            className="absolute inset-x-[-10px] inset-y-[-5px] rounded-xl border-l-[12px] border-black/40 shadow-2xl"
            style={{
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          />
        </div>

        {/* 2. 內頁系統 */}
        <div className="absolute inset-0 transform-style-3d" style={{ zIndex: 10 }}>
          {pages.map((content: string, idx: number) => (
            <div
              key={`${activePath}-${idx}`}
              ref={(el) => {
                pageRefs.current[idx] = el;
              }}
              className="absolute inset-0 origin-left transform-style-3d shadow-xl"
              style={{
                zIndex: idx === flippingIndex ? 500 : idx < currentPage ? 100 + idx : 100 - idx,
              }}
            >
              {/* 正面：內容 */}
              <div 
                className="absolute inset-0 bg-[#fdfaf2] rounded-l-xl shadow-xl backface-hidden"
                style={{
                  backgroundImage:
                    'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                  backfaceVisibility: 'hidden',
                }}
              >
                <div className="absolute inset-0 p-10 flex flex-col pointer-events-none">
                  <div className="flex items-center justify-between border-b border-amber-900/10 pb-4 mb-8">
                    <span className="text-[10px] font-black text-amber-900/30 uppercase tracking-[0.3em]">
                      卷宗紀錄 - 第 {idx + 1} 頁
                    </span>
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
                    <span>
                      頁次 {idx + 1} / {totalPages}
                    </span>
                  </div>
                </div>
              </div>
              {/* 背面：翻過去後看到的紙張背面 */}
              <div 
                className="absolute inset-0 bg-[#f4f1ea] rounded-r-xl shadow-xl backface-hidden [transform:rotateY(180deg)]"
                style={{
                  backgroundImage:
                    'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <span className="text-8xl font-black text-amber-900 rotate-12">{idx + 1}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <span className="text-8xl font-black text-amber-900 rotate-12">{idx + 1}</span>
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
            zIndex: isCoverOpened ? 50 : 200,
          }}
        >
          {/* 封面正面 */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
              backfaceVisibility: 'hidden',
              boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.5), 15px 15px 50px rgba(0,0,0,0.8)',
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
          {/* 封面背面（翻開後左側可見的內側） */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: theme.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              filter: 'brightness(0.6)',
            }}
          />
        </div>
      </div>
      <style jsx>{`
        .transform-origin-left {
          transform-origin: left center;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
