'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { gsap } from 'gsap';
import { ChevronRight, ChevronLeft, RotateCcw, Scale, ShieldCheck } from 'lucide-react';
import { LawCase, Player } from '../types/game';
import { calculateSpectatorInfluence } from '../engine/MechanicsEngine';
import {
  getLawyerDefenseBonus,
  getRoleLevel,
  getExtraAppealCost,
  getWithdrawCaseCost,
} from '../engine/RoleEngine';
import { formatValue } from '../engine/MathEngine';
import { SystemStrings } from '../data/SystemStrings';

/**
 * CourtroomScreen - 沉浸式法庭介面
 *
 * 核心規範：
 * 1. 無滾輪設計：所有長篇文案皆透過 3D 翻頁組件展示。
 * 2. 神祕剪影：法官以黑色剪影呈現。
 * 3. 網站模式優先：僅支援單一法官風格。
 */

// 分頁組件：處理長文案的 3D 翻頁
const PaperFlip: React.FC<{
  text: string;
  onComplete?: () => void;
  title?: string;
}> = ({ text, onComplete, title }) => {
  const pages = useMemo(() => {
    const lines = text.split('\n');
    const result: {
      segments: string[];
      type: 'cover' | 'judgment' | 'education' | 'punishment' | 'back';
    }[] = [];

    result.push({ segments: [title || '案件卷宗'], type: 'cover' });

    let currentSegments: string[] = [];
    let currentLinesCount = 0;
    let currentType: 'judgment' | 'education' | 'punishment' = 'judgment';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine.includes('【法制教育】')) {
        if (currentSegments.length > 0) {
          result.push({ segments: currentSegments, type: currentType });
        }
        currentSegments = [trimmedLine];
        currentLinesCount = 1;
        currentType = 'education';
        continue;
      }

      if (trimmedLine.includes('【裁罰結果】')) {
        if (currentSegments.length > 0) {
          result.push({ segments: currentSegments, type: currentType });
        }
        currentSegments = [trimmedLine];
        currentLinesCount = 1;
        currentType = 'punishment';
        continue;
      }

      const segments = trimmedLine
        .replace(/([。！？]」?)/g, '$1\n')
        .split('\n')
        .filter((s) => s.trim().length > 0);

      for (const segment of segments) {
        const visualLines = Math.max(1, Math.ceil(segment.length / 14));
        if (currentLinesCount + visualLines > 9 && currentSegments.length > 0) {
          result.push({ segments: currentSegments, type: currentType });
          currentSegments = [];
          currentLinesCount = 0;
        }
        currentSegments.push(segment);
        currentLinesCount += visualLines;
      }
    }

    if (currentSegments.length > 0) {
      result.push({ segments: currentSegments, type: currentType });
    }
    result.push({ segments: ['庭審紀錄結束'], type: 'back' });
    return result;
  }, [text, title]);

  const [currentPage, setCurrentPage] = useState(0);
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const leafForwardRef = useRef<HTMLDivElement>(null);
  const leafBackwardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);

  const getPageStyle = (pageIdx: number) => {
    const type = pages[pageIdx]?.type;
    if (type === 'cover') {
      return {
        base: 'bg-stone-50 border-stone-300 shadow-[inset_-5px_0_15px_rgba(0,0,0,0.1)]',
        text: 'text-stone-800',
        label:
          'text-stone-900 font-serif font-black text-3xl mb-12 text-center pb-4 border-b-2 border-stone-800/20',
        border: 'text-stone-400 border-stone-200',
      };
    }
    if (type === 'back') {
      return {
        base: 'bg-stone-200 border-stone-400',
        text: 'text-stone-600',
        label: 'text-stone-700 font-black text-center mt-20 opacity-50',
        border: 'text-stone-400 border-stone-300',
      };
    }
    if (type === 'education') {
      return {
        base: 'bg-amber-950 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.2)]',
        text: 'text-amber-100',
        label: 'text-amber-400 font-black text-center border-b border-amber-500/30 pb-2 mb-6',
        border: 'text-amber-500/60 border-amber-800',
      };
    }
    if (type === 'punishment') {
      return {
        base: 'bg-red-950 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]',
        text: 'text-red-100',
        label: 'text-red-400 font-black text-center border-b border-red-500/30 pb-2 mb-6',
        border: 'text-red-500/60 border-red-800',
      };
    }
    return {
      base: 'bg-slate-900 border-slate-700/50',
      text: 'text-slate-100',
      label: 'text-slate-100',
      border: 'text-slate-500 border-slate-800',
    };
  };

  const nextPage = useCallback(() => {
    if (isAnimating || currentPage >= pages.length - 1) {
      if (!isAnimating && currentPage >= pages.length - 1 && onComplete) onComplete();
      return;
    }

    setIsAnimating(true);
    const nextIdx = currentPage + 1;
    setTargetPage(nextIdx);

    gsap.to(leafForwardRef.current, {
      rotateY: -180,
      z: 100,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(leafForwardRef.current, { autoAlpha: 0 });
        setCurrentPage(nextIdx);
        setTargetPage(null);
        setDragOffset(0);
        setTimeout(() => {
          gsap.set(leafForwardRef.current, { rotateY: 0, z: 100, autoAlpha: 1 });
          setIsAnimating(false);
        }, 30);
      },
    });
  }, [currentPage, pages.length, onComplete, isAnimating]);

  const prevPage = useCallback(() => {
    if (isAnimating || currentPage === 0) return;
    setIsAnimating(true);
    const nextIdx = currentPage - 1;
    setTargetPage(nextIdx);

    if (Math.abs(dragOffset) < 1) {
      gsap.set(leafBackwardRef.current, { rotateY: -180 });
    }

    gsap.to(leafBackwardRef.current, {
      rotateY: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(leafBackwardRef.current, { autoAlpha: 0 });
        setCurrentPage(nextIdx);
        setTargetPage(null);
        setDragOffset(0);
        setTimeout(() => {
          gsap.set(leafBackwardRef.current, { rotateY: -180, autoAlpha: 1 });
          setIsAnimating(false);
        }, 30);
      },
    });
  }, [currentPage, dragOffset, isAnimating]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAnimating) return;
    startX.current = e.clientX;
    setDragOffset(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX.current === null || isAnimating) return;
    const diff = startX.current - e.clientX;
    setDragOffset(diff);

    if (diff > 0) {
      const tilt = Math.min(Math.max(diff * 0.4, 0), 180);
      gsap.set(leafForwardRef.current, {
        rotateY: -tilt,
        z: 100,
        autoAlpha: 1,
        transformOrigin: 'left center',
      });
      gsap.set(leafBackwardRef.current, { autoAlpha: 0 }); // 往前翻時隱藏後退片，防止層級干擾
    } else if (diff < 0 && currentPage > 0) {
      const tilt = Math.max(Math.min(-180 - diff * 0.7, 0), -180);
      gsap.set(leafBackwardRef.current, { rotateY: tilt, transformOrigin: 'left center' });
      gsap.set(leafForwardRef.current, { rotateY: 0 });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (startX.current === null || isAnimating) return;
    const diff = startX.current - e.clientX;
    startX.current = null;

    if (diff > 25) {
      nextPage();
    } else if (diff < -25 && currentPage > 0) {
      prevPage();
    } else {
      if (diff > 0) {
        gsap.to(leafForwardRef.current, {
          rotateY: 0,
          z: 100,
          duration: 0.3,
          ease: 'power3.out',
          onComplete: () => {
            setDragOffset(0);
            gsap.set(leafBackwardRef.current, { autoAlpha: 1 }); // 恢復後退片
          },
        });
      } else if (currentPage > 0) {
        gsap.to(leafBackwardRef.current, {
          rotateY: -180,
          duration: 0.3,
          ease: 'power3.out',
          onComplete: () => setDragOffset(0),
        });
      } else {
        setDragOffset(0);
      }
    }
  };

  const renderPage = (idx: number) => {
    const page = pages[idx];
    if (!page) return null;
    const styles = getPageStyle(idx);
    const isCompleted = idx === pages.length - 1;

    return (
      <div
        className={`absolute inset-0 border rounded-sm p-6 shadow-2xl flex flex-col backface-hidden ${styles.base}`}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        {page.type === 'cover' && (
          <div className="absolute inset-x-0 top-20 flex flex-col items-center pointer-events-none opacity-20">
            <Scale size={120} className="text-stone-900 mb-4" />
            <div className="w-32 h-1 bg-stone-900" />
          </div>
        )}
        <div
          className={`flex-grow ${styles.text} text-lg leading-relaxed font-serif tracking-tight text-left z-10`}
        >
          {page.segments.map((segment, sIdx) => (
            <div
              key={sIdx}
              className={`mb-3 last:mb-0 ${
                page.type === 'cover'
                  ? styles.label
                  : segment.includes('【')
                    ? styles.label
                    : segment.startsWith('「')
                      ? ''
                      : 'indent-[2em]'
              }`}
            >
              {segment}
            </div>
          ))}
          {page.type === 'back' && (
            <div className="flex flex-col items-center justify-center mt-20 opacity-30">
              <div className="w-16 h-16 border-4 border-stone-500 rounded-full flex items-center justify-center font-black text-2xl">
                終
              </div>
              <div className="mt-4 text-[10px] tracking-[0.8em] uppercase font-bold text-center">
                End of Document
              </div>
            </div>
          )}
        </div>
        {page.type !== 'cover' && page.type !== 'back' && (
          <div
            className={`mt-4 flex justify-end items-center text-xs font-bold border-t pt-2 tracking-widest ${styles.border}`}
          >
            <span className={isCompleted ? 'text-cyan-500/80 animate-pulse' : ''}>
              第 {idx} 頁 / 共 {pages.length - 2} 頁
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-sm mx-auto perspective-2000 select-none">
      {title && (
        <div className="mb-2 flex items-center justify-between">
          <div className="border-l-4 border-cyan-500 pl-3">
            <h2 className="text-cyan-400 font-bold tracking-widest text-lg uppercase italic">
              {title}
            </h2>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-cyan-500/60 font-black animate-pulse flex items-center gap-1">
            <span>&lt; 滑動翻閱</span>
            <span className="scale-x-[-1]">&lt;</span>
          </div>
        </div>
      )}

      <div
        className={`relative flex-grow flex items-center justify-center py-2 cursor-grab active:cursor-grabbing w-full transform-style-3d touch-none ${isAnimating ? 'pointer-events-none' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          if (isAnimating) return;
          startX.current = null;
          gsap.to(leafForwardRef.current, { rotateY: 0, duration: 0.3 });
          gsap.to(leafBackwardRef.current, { rotateY: -180, duration: 0.3 });
          setDragOffset(0);
        }}
      >
        {/* Layer 0: 目標露底 (N+1) - zIndex 5 */}
        {(() => {
          let underlyingIdx: number | null = null;
          if (targetPage !== null && targetPage > currentPage) {
            underlyingIdx = targetPage;
          } else if (dragOffset > 0 && currentPage + 1 < pages.length) {
            underlyingIdx = currentPage + 1;
          }
          return underlyingIdx !== null ? (
            <div className="absolute inset-0 z-[5] [transform:translateZ(-10px)]">
              {renderPage(underlyingIdx)}
            </div>
          ) : null;
        })()}

        {/* Layer 1: 當前靜態頁 (Base N) - zIndex 10，往前翻時隱藏 */}
        {(() => {
          const isFlippingForward =
            (targetPage !== null && targetPage > currentPage) || dragOffset > 0;
          return !isFlippingForward ? (
            <div className="absolute inset-0 z-[10]">{renderPage(currentPage)}</div>
          ) : null;
        })()}

        {/* Layer 2: 往前翻的葉片 (Active Leaf) - zIndex 30 */}
        <div
          ref={leafForwardRef}
          className="absolute inset-0 transform-style-3d pointer-events-none z-[30]"
        >
          {renderPage(currentPage)}
        </div>

        {/* Layer 3: 往後翻的葉片 - zIndex 40 */}
        {currentPage > 0 && (
          <div
            ref={leafBackwardRef}
            className="absolute inset-0 transform-style-3d pointer-events-none z-[40] [transform:rotateY(-180deg)_translateZ(15px)] origin-left"
          >
            {renderPage(currentPage - 1)}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * LoopingVideo - 受控影片組件，支援片段循環播放
 */
const LoopingVideo: React.FC<{
  src: string;
  startTime: number;
  endTime: number;
  className?: string;
}> = ({ src, startTime, endTime, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 當影片進度更新時檢查是否超出範圍
    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
    };

    // 確保一開始就跳到起始點
    const handleLoadedMetadata = () => {
      video.currentTime = startTime;
      video.play().catch(() => {
        /* 處理自動播放限制 */
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [startTime, endTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      className={className}
      // 額外保險：如果影片因為任何原因結束，跳回起點
      onEnded={(e) => {
        e.currentTarget.currentTime = startTime;
        e.currentTarget.play();
      }}
    />
  );
};

/**
 * DefenseCarousel - 真·3D 無限圓周動態選擇器
 */
const DefenseCarousel: React.FC<{
  lawCase: LawCase;
  onSelect: (id: 'J' | 'K' | 'L', text: string) => void;
}> = ({ lawCase, onSelect }) => {
  // 旋轉狀態 (以角度為單位)
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef(0); // 確保 GSAP 補間時能即時讀取
  const startX = useRef(0);
  const startRotation = useRef(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isInitialized = useRef(false);
  const snapTweenRef = useRef<gsap.core.Tween | null>(null); // 用於儲存對齊動畫
  const dragTotalDist = useRef(0); // 追蹤單次操作的累計位移

  const options = useMemo(
    () => [
      { id: 'J' as const, text: lawCase.defense_j_text || '', angle: 0, key: 'J1' },
      { id: 'K' as const, text: lawCase.defense_k_text || '', angle: 60, key: 'K1' },
      { id: 'L' as const, text: lawCase.defense_l_text || '', angle: 120, key: 'L1' },
      { id: 'J' as const, text: lawCase.defense_j_text || '', angle: 180, key: 'J2' },
      { id: 'K' as const, text: lawCase.defense_k_text || '', angle: 240, key: 'K2' },
      { id: 'L' as const, text: lawCase.defense_l_text || '', angle: 300, key: 'L2' },
    ],
    [lawCase]
  );

  // 更新卡牌位置 (真 3D 圓柱座標)
  const updatePositions = useCallback(
    (rot: number, speed: number = 0.6) => {
      options.forEach((opt, i) => {
        const card = cardsRef.current[i];
        if (!card) return;

        const totalAngle = opt.angle + rot;
        const theta = totalAngle * (Math.PI / 180);

        const radius = 290;
        const x = Math.sin(theta) * radius;
        const z = Math.cos(theta) * radius - radius - 100;

        // 3D 位置計算
        gsap.to(card, {
          x: x,
          z: z,
          rotateY: totalAngle,
          zIndex: Math.round(z + 2000),
          duration: speed, // 使用動態速度
          ease: speed === 0 ? 'none' : 'power3.out',
          overwrite: 'auto',
        });
      });
    },
    [options]
  );

  useEffect(() => {
    // 拖曳中直接設為 0 实现 1:1 绝对跟手，對齊時用 0.3s 展現俐落感
    updatePositions(rotation, isDragging ? 0 : 0.3);
    rotationRef.current = rotation;
  }, [rotation, isDragging, updatePositions]);

  // 手勢處理
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // 立即殺死所有正在進行的對齊動畫，將主控權還給手指
    if (snapTweenRef.current) {
      snapTweenRef.current.kill();
      snapTweenRef.current = null;
    }
    setIsDragging(true);
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startRotation.current = rotationRef.current;
    dragTotalDist.current = 0; // 重置位移紀錄
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = currentX - startX.current;
    // 累計位移，用於判定是拖曳還是點擊
    dragTotalDist.current = Math.max(dragTotalDist.current, Math.abs(delta));

    // 靈敏度下調至 0.3，避免過於輕飄，操作更精準
    const nextRot = startRotation.current + delta * 0.3;
    setRotation(nextRot);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // 改為 60 度對齊
    const nearestSnap = Math.round(rotationRef.current / 60) * 60;
    const obj = { val: rotationRef.current };

    // 紀錄並執行對齊動畫
    snapTweenRef.current = gsap.to(obj, {
      val: nearestSnap,
      duration: 0.3, // 縮短對齊時間
      ease: 'power3.out', // 改為更俐落的緩動
      onUpdate: () => setRotation(obj.val),
      onComplete: () => {
        snapTweenRef.current = null;
      },
    });
  };

  // 判斷當前正面的索引 (0~5)
  const activeIndex = useMemo(() => {
    const snapRot = Math.round(rotation / 60) * 60;
    const normalizedSnap = ((-snapRot % 360) + 360) % 360;
    const index = Math.round(normalizedSnap / 60) % 6;
    return index;
  }, [rotation]);

  // 獲取當前正式的 ID
  const activeId = options[activeIndex]?.id || 'J';

  return (
    <div className="relative w-full h-[500px] flex flex-col items-center justify-center select-none overflow-visible [perspective:5000px]">
      <div
        className="relative w-full h-full flex items-center justify-center transform-style-3d cursor-grab active:cursor-grabbing carousel-container-tilt translate-y-12"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {options.map((opt, i) => {
          // 根據即時旋轉角度判斷此卡是否正面朝向觀眾
          const totalAngle = opt.angle + rotation;
          const normalizedAngle = ((totalAngle % 360) + 360) % 360;
          const isFrontVisible = normalizedAngle < 87.8 || normalizedAngle > 272.2;

          return (
            <div
              key={opt.key}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="absolute w-64 h-[440px] select-none transform-style-3d"
            >
              {/* ===== 正面：文字卡 ===== */}
              <div className="absolute inset-0 bg-[#0a0f1e] border-2 border-cyan-500/60 ring-1 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-xl p-5 flex flex-col justify-between backface-hidden">
                {/* 左上角紅色懸掛圓標 (123123) - 增加 translateZ 使其真實懸浮 */}
                <div className="absolute top-[-2px] left-[-2px] w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 border border-white/40 shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center z-[200] [transform:translateZ(50px)]">
                  <span className="text-white font-black text-lg italic translate-x-[-2px]">
                    {opt.id === 'J' ? '1' : opt.id === 'K' ? '2' : '3'}
                  </span>
                </div>
                {/* 文字內容 */}
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 pt-2 text-left">
                  <div className="text-slate-200 text-sm leading-relaxed font-serif tracking-tight">
                    {opt.text
                      .replace(/([。！？]」?)/g, '$1\n')
                      .split('\n')
                      .map((segment, idx) => {
                        const trimmed = segment.trim();
                        if (!trimmed) return null;
                        return (
                          <div
                            key={idx}
                            className={`mb-2 last:mb-0 ${trimmed.startsWith('「') ? '' : 'indent-[2em]'}`}
                          >
                            {trimmed}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 裝飾線條 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800" />
              </div>
              {/* ===== 背面：影片卡 ===== */}
              <div className="absolute inset-0 bg-[#0a0e1a] border-2 border-cyan-500/60 ring-1 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-xl overflow-hidden backface-hidden [transform:rotateY(180deg)]">
                {/* 使用 LoopingVideo 限制播放區間為 1s ~ 8s */}
                <LoopingVideo
                  src="/assets/logo2_anim.mp4"
                  startTime={1}
                  endTime={8}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.9]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 圓周動態提示 */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex gap-3 items-center">
          {options.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-cyan-400 scale-150 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`}
            />
          ))}
        </div>
      </div>

      {/* ===== 核心修正：2D 靜態點擊層 (完全脫離 3D 矩陣，解決 iOS 無法點擊的問題) ===== */}
      <div className="absolute bottom-18 left-1/2 -translate-x-1/2 z-[1000] w-48 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const activeOpt = options[activeIndex];
            if (activeOpt) onSelect(activeOpt.id, activeOpt.text);
          }}
          className="w-full py-3 bg-gradient-to-b from-blue-400 to-blue-800 text-white font-black uppercase tracking-widest text-xs border-2 border-blue-400 ring-1 ring-blue-500 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(37,99,235,0.4)] hover:brightness-125 active:scale-95 transition-all cursor-pointer rounded-lg"
        >
          確認選擇
        </button>
      </div>
    </div>
  );
};

export default function CourtroomScreen() {
  const {
    trial,
    players,
    setTrialStage,
    nextBystander,
    addIntervention,
    placeBet,
    submitDefense,
    resolveTrial,
    extraordinaryAppeal,
    withdrawCase,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const judgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用 Promise 延遲狀態更新，避免 Next.js/React 中的同步渲染警告
    Promise.resolve().then(() => setMounted(true));
    // 法官剪影呼吸效果
    if (judgeRef.current) {
      gsap.to(judgeRef.current, {
        scale: 1.02,
        opacity: 0.95,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, []);

  if (!mounted || !trial) return null;

  const defendant = players.find((p) => p.id === trial.defendantId);
  const actingBystander = trial.bystanderIds[trial.actingBystanderIndex]
    ? players.find((p) => p.id === trial.bystanderIds[trial.actingBystanderIndex])
    : null;

  // --- 各階段渲染邏輯 ---

  // Stage 1: 起訴敘事
  const renderIndictment = () => (
    <div className="h-full">
      <PaperFlip
        title="刑事起訴書"
        text={`${trial.narrative}\n\n${trial.question}`}
        onComplete={() => setTrialStage(2)}
      />
    </div>
  );

  // Stage 2: 旁聽干預
  const renderIntervention = () => {
    if (!actingBystander) return null;
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-black text-blue-400 uppercase tracking-widest italic">
            旁聽干預: {actingBystander.name}
          </h2>
        </div>

        <div className="flex-grow flex flex-col justify-center gap-6">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => {
                addIntervention(actingBystander.id, 'SUPPORT');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="group relative overflow-hidden p-6 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/20 active:scale-95 transition-all flex justify-between items-center"
            >
              <span className="text-2xl font-black text-blue-400">🛡 支持被告</span>
              <span className="text-xl font-mono text-blue-400 opacity-50">+10%</span>
            </button>

            <button
              onClick={() => {
                addIntervention(actingBystander.id, 'OPPOSE');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="group relative overflow-hidden p-6 border border-red-500/30 bg-red-500/5 hover:bg-red-500/20 active:scale-95 transition-all flex justify-between items-center"
            >
              <span className="text-2xl font-black text-red-400">⚔ 質疑被告</span>
              <span className="text-xl font-mono text-red-400 opacity-50">-10%</span>
            </button>

            <button
              onClick={() => {
                addIntervention(actingBystander.id, 'ABSTAIN');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="py-6 border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all text-slate-500 font-bold uppercase tracking-widest text-sm"
            >
              ABSTAIN
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stage 3: 場外賭局
  const renderBetting = () => {
    if (!actingBystander) return null;

    // 計算當前勝率
    const defendantPlayer = players.find((p) => p.id === trial.defendantId);
    const hasLawyerLv2 = defendantPlayer ? getRoleLevel(defendantPlayer, 'lawyer') >= 2 : false;

    const baseRate = trial.lawCase.survival_rate || 0;
    const influence = calculateSpectatorInfluence(trial.interventions, hasLawyerLv2);
    const bonus = defendantPlayer ? getLawyerDefenseBonus(defendantPlayer) : 0;
    const totalRate = Math.max(0, Math.min(1, baseRate + influence + bonus));

    // 檢查查看權限：當前旁觀者是否有王牌律師 LV2，或者被告本人具備 LV2 實力開放情報分享
    const canSeeRate =
      (actingBystander && getRoleLevel(actingBystander, 'lawyer') >= 2) || hasLawyerLv2;

    return (
      <div className="h-full flex flex-col">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-black text-green-400 font-mono tracking-widest italic">
            場外賭局: {actingBystander.name}
          </h2>
        </div>

        <div className="flex-grow flex flex-col justify-center gap-8">
          <div className="bg-slate-900 border-y border-slate-800 py-10 px-4 text-center relative overflow-hidden">
            <div
              className={`text-6xl font-black text-white glow-blue transition-all duration-500 ${!canSeeRate ? 'blur-md opacity-40' : ''}`}
            >
              {canSeeRate ? `${(totalRate * 100).toFixed(0)}%` : '??%'}
            </div>
            {!canSeeRate && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-sm px-4 py-2 border border-slate-700 rounded text-xs text-slate-400 font-bold tracking-widest uppercase">
                  需王牌律師 LV2 洞察
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                placeBet(actingBystander.id, 'win');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="flex flex-col items-center justify-center gap-3 p-8 border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 active:scale-95 transition-all"
            >
              <span className="font-black text-xl text-green-400">勝訴</span>
            </button>

            <button
              onClick={() => {
                placeBet(actingBystander.id, 'lose');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="flex flex-col items-center justify-center gap-3 p-8 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <span className="font-black text-xl text-red-400">敗訴</span>
            </button>

            <button
              onClick={() => {
                placeBet(actingBystander.id, 'none');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="col-span-2 py-4 border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all text-slate-500 font-bold uppercase tracking-widest text-xs"
            >
              跳過
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stage 4: 被告辯護
  const renderDefense = () => {
    if (!defendant) return null;
    const hasLawyerLv2 = getRoleLevel(defendant, 'lawyer') >= 2;

    // 計算當前勝率（基礎 + 旁觀者 + 律師 LV1 加成）
    const baseRate = trial.lawCase.survival_rate || 0;
    const influence = calculateSpectatorInfluence(trial.interventions, hasLawyerLv2);
    const bonus = getLawyerDefenseBonus(defendant);
    const totalRate = Math.max(0, Math.min(1, baseRate + influence + bonus));

    return (
      <div className="h-full flex flex-col relative pt-4">
        <div className="absolute top-[-30] left-5 border-l-4 border-cyan-500 pl-4 z-[20]">
          <h2 className="text-2xl font-black text-white uppercase tracking-[0.15em] italic text-noir-glow">
            被告答辯: {defendant.name}
          </h2>
        </div>

        {/* 王牌律師 LV2 特權：答辯時可即時查看當前機率 */}
        {hasLawyerLv2 && (
          <div className="absolute top-0 right-5 flex flex-col items-end z-[20] animate-in fade-in slide-in-from-right duration-1000">
            <div className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase mb-1 opacity-70">
              勝訴情報
            </div>
            <div className="text-3xl font-black text-white font-mono drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              {(totalRate * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {/* 王牌律師 LV3：強制撤告特權 */}
        {getRoleLevel(defendant, 'lawyer') >= 3 && (
          <div className="absolute top-20 right-5 z-[20] animate-in fade-in zoom-in duration-700">
            <button
              onClick={() => {
                if (window.confirm(`確定要花費 ${formatValue(getWithdrawCaseCost(defendant).g, SystemStrings.UNITS.MONEY)} 發動「${SystemStrings.UI_LABELS.WITHDRAW_CASE}」嗎？`)) {
                  withdrawCase();
                }
              }}
              className="flex flex-col items-end group"
            >
              <div className="text-[10px] text-amber-500 font-black tracking-widest uppercase mb-1 group-hover:text-amber-400 transition-colors">
                律師特權: {SystemStrings.UI_LABELS.WITHDRAW_CASE}
              </div>
              <div className="px-4 py-2 bg-amber-600/20 border border-amber-500/50 rounded-lg backdrop-blur-md flex items-center gap-2 group-hover:bg-amber-600/30 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <ShieldCheck size={16} className="text-amber-400" />
                <span className="text-sm font-black text-white italic">
                  支付 {formatValue(getWithdrawCaseCost(defendant).g, SystemStrings.UNITS.MONEY)} 結案
                </span>
              </div>
            </button>
          </div>
        )}

        <div className="flex-grow flex items-center justify-center pt-2">
          <DefenseCarousel
            lawCase={trial.lawCase}
            onSelect={(id, text) => {
              const idMap: Record<string, number> = { J: 0, K: 1, L: 2 };
              submitDefense(idMap[id], text);
            }}
          />
        </div>
      </div>
    );
  };

  // Stage 6: 庭審裁決 (Verdict)
  const renderVerdict = () => {
    const isWin = trial.isDefenseSuccess;

    let webJudgment = '';
    let eduText = '';

    if (trial.chosenDefenseLabel === '方案 J') {
      webJudgment = trial.lawCase.web_judgment_j || '';
      eduText = trial.lawCase.edu_j || '';
    } else if (trial.chosenDefenseLabel === '方案 K') {
      webJudgment = trial.lawCase.web_judgment_k || '';
      eduText = trial.lawCase.edu_k || '';
    } else if (trial.chosenDefenseLabel === '方案 L') {
      webJudgment = trial.lawCase.web_judgment_l || '';
      eduText = trial.lawCase.edu_l || '';
    }

    const mainVerdictText = webJudgment || trial.judgment;
    const fullText = `${mainVerdictText}${eduText ? `\n\n【法制教育】\n${eduText}` : ''}${!isWin && trial.punishmentDetail ? `\n\n【裁罰結果】\n${trial.punishmentDetail}` : ''}`;
    const appealCost = defendant ? getExtraAppealCost(defendant) : 100;

    return (
      <div className="h-full flex flex-col">
        <div
          className={`mb-6 flex items-center justify-center gap-4 py-8 border-y ${isWin ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}
        >
          <h2
            className={`text-4xl font-black italic tracking-[0.2em] ${isWin ? 'text-green-400' : 'text-red-400'}`}
          >
            {isWin ? '無罪' : '有罪'}
          </h2>
        </div>

        <div className="flex-grow flex items-center justify-center">
          {isWin ? (
            /* 無罪階段：顯示 3D 紅色離開按鈕 */
            <div className="flex flex-col items-center gap-12">
              <button
                onClick={() => resolveTrial()}
                className="group relative w-48 h-48 rounded-full transition-all duration-200 active:translate-y-2 select-none"
              >
                {/* 按鈕側面深度 */}
                <div className="absolute inset-x-0 bottom-[-16px] h-48 rounded-full bg-red-900 shadow-[0_15px_40px_rgba(0,0,0,0.6)]" />

                {/* 按鈕表面 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-b-[10px] border-red-800 flex items-center justify-center group-hover:from-red-400 group-hover:to-red-600 shadow-inner overflow-hidden">
                  <span className="text-white font-black text-3xl tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] italic">
                    EXIT
                  </span>
                  {/* 高光效果 */}
                  <div className="absolute top-2 left-1/4 w-1/2 h-1/4 bg-white/20 rounded-full blur-md" />
                </div>
              </button>

              <div className="flex flex-col items-center gap-3 animate-pulse">
                <div className="text-red-500 font-black tracking-[0.4em] text-xl uppercase italic">
                  按下，離開法庭
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/40" />
                  <div className="w-12 h-px bg-red-500/20 my-auto" />
                  <div className="w-2 h-2 rounded-full bg-red-500/40" />
                </div>
              </div>
            </div>
          ) : (
            /* 有罪階段：顯示判決書 */
            <PaperFlip title="判決書" text={fullText} onComplete={() => resolveTrial()} />
          )}
        </div>

        {!isWin && defendant && !defendant.hasUsedExtraAppeal && (
          <div className="mt-4 px-2">
            <button
              onClick={() => extraordinaryAppeal()}
              className="w-full py-4 border-2 border-dashed border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm"
            >
              <RotateCcw size={18} />
              <span>{SystemStrings.UI_LABELS.APPEAL} (扣除 {formatValue(appealCost, SystemStrings.UNITS.MONEY)})</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // 渲染當前階段
  const renderContent = () => {
    switch (trial.stage) {
      case 1:
        return renderIndictment();
      case 2:
        return renderIntervention();
      case 3:
        return renderBetting();
      case 4:
        return renderDefense();
      case 6:
        return renderVerdict();
      // 階段 5 (律師) 與 7 (上訴) 通常在 store 內部處理邏輯進度
      default:
        return renderIndictment();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-[#020617] text-white flex flex-col z-50 overflow-hidden"
    >
      {/* 頂部進度條 */}
      <div className="flex h-1 gap-px bg-slate-800">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={`flex-1 transition-all duration-700 ${trial.stage >= s ? 'bg-cyan-500' : 'bg-transparent'}`}
          />
        ))}
      </div>

      {/* 法庭背景元件 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 法官剪影 */}
        <div
          ref={judgeRef}
          className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 brightness-0 opacity-80 bg-[url('https://www.svgrepo.com/show/440590/judge.svg')] bg-contain bg-center bg-no-repeat drop-shadow-[0_0_40px_rgba(6,182,212,0.2)]"
        />

        {/* 底部煙霧/暗角 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
      </div>

      {/* 內容區域 */}
      <div className="relative z-10 flex-grow pt-32 px-6 pb-24">{renderContent()}</div>

      {/* 背景雜訊效果 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
    </div>
  );
}
