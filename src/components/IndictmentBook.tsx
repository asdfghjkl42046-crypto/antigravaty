'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { Gavel, Scale, FileText, ShieldAlert, RotateCcw } from 'lucide-react';
import { SYSTEM_STRINGS } from '@/data/SystemStrings';

interface IndictmentBookProps {
  caseTitle: string;
  pages: string[];
  onClose?: () => void;
  onAppeal?: () => void;
  onCountdownEnd?: () => void;
  canAppeal?: boolean;
  isAceAttorney?: boolean;
  countdownSeconds?: number;
}

/**
 * CountdownClock 組件 - 處理動態倒數、圓形進度條與顏色閃爍
 */
const CountdownClock: React.FC<{ 
  onComplete: () => void; 
  onAppeal: () => void; 
  isActive: boolean;
  seconds?: number;
  showButton?: boolean;
}> = ({
  onComplete,
  onAppeal,
  isActive,
  seconds = 5.0,
  showButton = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isBright, setIsBright] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestamp = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(seconds);
      startTimestamp.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (!startTimestamp.current) startTimestamp.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - (startTimestamp.current || Date.now())) / 1000;
      const remaining = Math.max(0, seconds - elapsed);
      setTimeLeft(remaining);
      setIsBright((prev) => !prev);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, onComplete, seconds]);

  // 計算圓形進度條偏移量 (251 是圓周長)
  const strokeDashoffset = 251 - (timeLeft / seconds) * 251;

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-slate-900/20"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray="251"
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 100ms linear' }}
            className="text-red-600"
          />
        </svg>
        <span
          className={`text-4xl font-mono font-black transition-colors duration-100 ${isBright ? 'text-red-400' : 'text-red-600'}`}
        >
          {timeLeft.toFixed(1)}s
        </span>
      </div>
      {showButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAppeal();
          }}
          className="group relative px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-2xl transition-all active:scale-95 flex items-center gap-3 overflow-hidden border border-white/20"
        >
          <RotateCcw size={20} className="animate-spin-slow" />
          <span className="font-black tracking-[0.2em] text-lg italic">非常上訴</span>
        </button>
      )}
      <p className="text-[10px] text-red-600/40 font-bold tracking-widest uppercase animate-pulse">
        最後決斷時間
      </p>
    </div>
  );
};

/**
 * IndictmentBook V2.1 - 雙面渲染物理引擎 (手感同步 ParchmentBook)
 */
export default function IndictmentBook({
  caseTitle,
  pages,
  onClose,
  onAppeal,
  onCountdownEnd,
  canAppeal,
  isAceAttorney,
  countdownSeconds = 5.0,
}: IndictmentBookProps) {
  // --- 狀態控制 (Sync-Ref Architecture) ---
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const isCoverOpenedRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(0);
  const currentPageRef = useRef(0);
  const [flippingIndex, setFlippingIndex] = useState(-1);
  const flippingIndexRef = useRef(-1);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const totalPages = pages.length;

  const setFlippingIndexBoth = (idx: number) => {
    flippingIndexRef.current = idx;
    setFlippingIndex(idx);
  };
  const setIsCoverOpenedBoth = (val: boolean) => {
    isCoverOpenedRef.current = val;
    setIsCoverOpened(val);
  };

  useEffect(() => {
    pageRefs.current.forEach((el, idx) => {
      if (el) {
        gsap.set(el, {
          rotationY: -5,
          z: (totalPages - idx) * 2,
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
        });
      }
    });
  }, [pages, totalPages]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // 防止攔截按鈕點擊
    if ((e.target as HTMLElement).closest('button')) return;

    isDragging.current = true;
    dragStartX.current = e.clientX;
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);

    const animatingIdx = flippingIndexRef.current;
    if (animatingIdx === -1) return;

    const cur = currentPageRef.current;
    if (animatingIdx === cur) {
      currentPageRef.current = cur + 1;
      setCurrentPage(cur + 1);
    } else if (animatingIdx === cur - 1) {
      currentPageRef.current = cur - 1;
      setCurrentPage(cur - 1);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;

    if (!isCoverOpenedRef.current) {
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
            const prevAnimating = flippingIndexRef.current !== cur && pageRefs.current[cur - 1];
            if (prevAnimating) {
              const prevRot = gsap.getProperty(prevAnimating, 'rotationY') as number;
              rot = Math.max(rot, prevRot - 5);
            }
            gsap.set(target, { rotationY: Math.max(-160, Math.min(-5, rot)), z: 50 });
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
              const nextAnimating = flippingIndexRef.current !== cur - 1 && pageRefs.current[cur];
              if (nextAnimating) {
                const nextRot = gsap.getProperty(nextAnimating, 'rotationY') as number;
                rot = Math.min(rot, nextRot + 5);
              }
              gsap.set(target, { rotationY: Math.min(-5, Math.max(-160, rot)), z: 50 });
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
          gsap.to(coverRef.current, { rotationY: -180, z: -10, duration: 0.4, ease: 'power2.out' });
      } else {
        if (coverRef.current)
          gsap.to(coverRef.current, { rotationY: 0, z: 120, duration: 0.4, ease: 'back.out(1.7)' });
      }
    } else {
      if (Math.abs(deltaX) > 80) {
        const isForward = deltaX < 0;
        const cur = currentPageRef.current;

        if (isForward && cur < totalPages) {
          const target = pageRefs.current[cur];
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
                // [核心優化] 只有在「不能上訴」且「不具備逆轉技能」時，翻完最後一頁才立即結案
                const hasFollowUp = canAppeal || isAceAttorney;
                if (cur === totalPages - 1 && !hasFollowUp) {
                  onClose?.(); 
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
            currentPageRef.current = idx;
            setCurrentPage(idx);
            if (target)
              gsap.to(target, {
                rotationY: -5,
                z: (totalPages - idx) * 2,
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
        z: (totalPages - cur) * 2,
        duration: 0.5,
        ease: 'back.out(1.2)',
      });
    if (cur > 0) {
      const prev = pageRefs.current[cur - 1];
      if (prev)
        gsap.to(prev, { rotationY: -160, z: (cur - 1) * 2, duration: 0.5, ease: 'back.out(1.2)' });
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-auto scale-90">
      {/* 判決倒數 Overlay：採用平面佈局，徹底解決 3D 遮擋與點擊失效問題 */}
      {totalPages > 0 && (canAppeal || isAceAttorney) && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto bg-red-950/5 backdrop-blur-[2px] z-[9999]"
          onPointerDown={(e) => e.stopPropagation()} 
        >
          <CountdownClock 
            onComplete={() => onCountdownEnd ? onCountdownEnd() : onClose?.()} 
            onAppeal={() => onAppeal?.()} 
            isActive={currentPage === totalPages}
            seconds={countdownSeconds}
            showButton={canAppeal}
          />
        </div>
      )}

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-[420px] h-[540px] perspective-3000 select-none cursor-grab active:cursor-grabbing transform-style-3d touch-none"
      >
        <div
          className="absolute inset-0 transform-style-3d"
          style={{ transform: 'translateZ(-62px)' }}
        >
          <div
            className="absolute inset-x-[-10px] inset-y-[-5px] rounded-xl border-l-[12px] border-black/40 shadow-2xl overflow-hidden"
            style={{
              backgroundColor: '#0f172a',
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          >
            {/* 倒數區域已移至 Overlay */}
          </div>
        </div>

        <div className="absolute inset-0 transform-style-3d" style={{ zIndex: 10 }}>
          {pages.map((content, idx) => (
            <div
              key={`indictment-${idx}`}
              ref={(el) => {
                pageRefs.current[idx] = el;
              }}
              className="absolute inset-0 origin-left transform-style-3d"
              style={{
                transform: `translate3d(0, 0, ${idx < currentPage ? idx * 2 : (totalPages - idx) * 2}px) rotateY(${idx < currentPage ? -160 : -5}deg)`,
                zIndex: idx === flippingIndex ? 500 : idx < currentPage ? 100 + idx : 100 - idx,
              }}
            >
              <div
                className="absolute inset-0 bg-[#fdfaf2] rounded-l-xl shadow-xl backface-hidden"
                style={{
                  backgroundImage:
                    'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                }}
              >
                <div className="absolute inset-0 p-10 flex flex-col pointer-events-none">
                  <div className="flex items-center justify-between border-b border-slate-900/10 pb-4 mb-8">
                    <span className="text-[10px] font-black text-slate-900/30 uppercase tracking-[0.3em]">
                      起訴紀錄 - 卷次 {idx + 1}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900/20" />
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    <p className="text-[17px] font-serif italic text-slate-950/80 leading-relaxed indent-8 whitespace-pre-wrap">
                      {idx === 0 ? (
                        <>
                          <span className="text-5xl font-black mr-3 float-left text-slate-900 leading-[0.8] mt-1">
                            {content.charAt(0)}
                          </span>
                          {content.slice(1)}
                        </>
                      ) : (
                        content
                      )}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-[9px] font-bold text-slate-900/20 italic tracking-widest">
                    <span>LEGAL AUTHORITY ARCHIVE</span>
                    <span>
                      分頁 {idx + 1} / {totalPages}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="absolute inset-0 bg-[#f4f1ea] rounded-r-xl shadow-xl backface-hidden [transform:rotateY(180deg)]"
                style={{
                  backgroundImage:
                    'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <span className="text-8xl font-black text-slate-900 rotate-12">{idx + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          ref={coverRef}
          className="absolute inset-0 origin-left transform-style-3d cursor-pointer"
          style={{
            transform: `translate3d(0, 0, ${isCoverOpened ? -10 : 120}px) rotateY(${isCoverOpened ? -165 : -5}deg)`,
            zIndex: 200,
          }}
        >
          <div
            className="absolute inset-0 bg-[#0f172a] rounded-l-xl shadow-2xl backface-hidden"
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          >
            <div className="absolute inset-4 border border-white/5 rounded-sm flex flex-col items-center justify-center p-8 gap-12">
              <div className="w-24 h-24 rounded-[32px] bg-black/20 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <Gavel className="w-12 h-12 text-white/40" />
              </div>
              <div className="text-center">
                <h2 className="text-4xl font-black tracking-[0.15em] text-white/95 uppercase leading-tight drop-shadow-2xl">
                  {caseTitle}
                </h2>
                <div className="mt-4 h-px w-12 bg-white/10 mx-auto" />
                <p className="text-[10px] font-bold text-white/30 tracking-[0.5em] uppercase mt-4">
                  起訴卷宗內容
                </p>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 bg-[#0f172a] rounded-r-xl shadow-2xl backface-hidden [transform:rotateY(180deg)] filter brightness-[0.6]"
            style={{
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
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
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
