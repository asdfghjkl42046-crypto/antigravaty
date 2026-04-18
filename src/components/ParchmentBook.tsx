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
 * Premium Dossier System - 高穩定度版
 * 使用完全的 Inline Styles 確保 3D 材質不透明
 */
export default function ParchmentBook({ activePath, onPathChange }: ParchmentBookProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  const pages = useMemo(() => START_PATH_LABELS[activePath] || [], [activePath]);
  const totalInternalPages = pages.length;

  // 初始化 pageRefs 陣列長度
  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, totalInternalPages);
  }, [totalInternalPages]);

  useEffect(() => {
    setIsCoverOpened(false);
    setCurrentPage(0);
    // 重置所有頁面位置 - 使用 Ref 確保精確度
    if (coverRef.current) gsap.set(coverRef.current, { rotationY: 0, z: 80 });
    pageRefs.current.forEach(ref => {
      if (ref) gsap.set(ref, { rotationY: -5, z: 0 });
    });
  }, [activePath]);

  const dossierStyle = useMemo(() => {
    switch (activePath) {
      case 'backdoor':
        return {
          coverColor: '#162b4d', // 深邃海軍藍 (金融專業感)
          title: 'FINANCE_DOSSIER',
          icon: <Shield className="w-6 h-6 text-cyan-400/40" />,
          accent: 'border-cyan-500/30',
        };
      case 'blackbox':
        return {
          coverColor: '#3d0c0c', // 波爾多酒紅 (古老權力感)
          title: 'LEGACY_ARCHIVE',
          icon: <PenTool className="w-6 h-6 text-red-500/30" />,
          accent: 'border-red-900/30',
        };
      default:
        return {
          coverColor: '#7a4225', // 經典乾邑棕 (白手創業感)
          title: 'NORMAL_LEDGER',
          icon: <Scale className="w-6 h-6 text-amber-600/30" />,
          accent: 'border-amber-900/30',
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
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: rot, duration: 0.1, overwrite: true });
      }
    } else {
      if (Math.abs(deltaX) > 20) {
        const isForward = deltaX < 0;
        if (isForward && currentPage >= totalInternalPages) return; // 已到最後，無法再前翻

        if (!isForward && currentPage === 0) {
          // 禁止封面往回翻規避：在第一頁向右撥時，不執行任何封面動作
          return;
        }

        const targetPageRef = isForward ? pageRefs.current[currentPage] : pageRefs.current[currentPage - 1];
        const startRot = isForward ? -5 : -160; 
        const rot = startRot + (deltaX / 300) * 150;
        if (targetPageRef) {
          gsap.to(targetPageRef, {
            rotationY: Math.min(-10, Math.max(-160, rot)),
            z: 30,
            duration: 0.1,
            overwrite: true,
          });
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
    const deltaX = e.clientX - dragStartX.current;

    if (!isCoverOpened) {
      if (deltaX < -60) {
        setIsCoverOpened(true);
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: -180, z: -10, duration: 0.8, ease: 'power2.out' });
      } else {
        if (coverRef.current) gsap.to(coverRef.current, { rotationY: 0, z: 80, duration: 0.5, ease: 'back.out(1.7)' });
      }
    } else {
      if (Math.abs(deltaX) > 80) {
        if (deltaX < 0 && currentPage < totalInternalPages) {
          const target = pageRefs.current[currentPage];
          if (target) {
            gsap.to(target, { 
              rotationY: -160, 
              z: 2, 
              duration: 0.6, 
              ease: 'power2.out' 
            });
          }
          setCurrentPage(prev => prev + 1);
        } else if (deltaX > 0) {
          if (currentPage > 0) {
            const target = pageRefs.current[currentPage - 1];
            if (target) {
              gsap.to(target, { 
                rotationY: -5, 
                z: 1, 
                duration: 0.6, 
                ease: 'power2.out' 
              });
            }
            setCurrentPage(prev => prev - 1);
          } else {
            // 已在第一頁，禁止往回翻，直接重置當前狀態保持開啟
            resetCurrentPage();
          }
        } else {
          resetCurrentPage();
        }
      } else {
        resetCurrentPage();
      }
    }
  };

  const resetCurrentPage = () => {
    const cur = pageRefs.current[currentPage];
    if (cur) gsap.to(cur, { rotationY: -5, z: 1, duration: 0.5, ease: 'back.out(1.2)' });
    
    if (currentPage > 0) {
      const prev = pageRefs.current[currentPage - 1];
      if (prev) {
        gsap.to(prev, {
          rotationY: -160,
          z: 2,
          duration: 0.5,
          ease: 'back.out(1.2)',
        });
      }
    }
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-[420px] h-[540px] perspective-3000 select-none cursor-grab active:cursor-grabbing transform-style-3d rotate-x-4 rotate-y-[-2deg] touch-none"
      >
        {/* 1. 書殼底座 (底面與背面) - 核心隔離標記 */}
        <div 
          ref={baseRef}
          className="absolute inset-0 transform-style-3d pointer-events-none shadow-[0_40px_100px_rgba(0,0,0,0.8)]" 
          style={{ transform: 'translateZ(-150px)', zIndex: 1 }}
        >
          {/* 右底蓋 */}
          <div
            className="absolute left-0 right-[-15px] inset-y-[-10px] rounded-r-xl border-r-[12px] border-black/40 translate-z-[-20px]"
            style={{
              backgroundColor: dossierStyle.coverColor,
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%), url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          />
          {/* 左底蓋 */}
          <div
            className="absolute left-[-420px] right-0 inset-y-[-10px] rounded-l-xl border-l-[12px] border-black/40 translate-z-[-21px]"
            style={{
              backgroundColor: dossierStyle.coverColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          />
          {/* 書脊 (連接處) */}
          <div
            className="absolute left-[-22px] top-[-10px] bottom-[-10px] w-[45px] origin-right rotate-y-[-90deg] translate-x-[22px]"
            style={{
              backgroundColor: dossierStyle.coverColor,
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.4), transparent), url("https://www.transparenttextures.com/patterns/leather.png")',
              filter: 'brightness(0.7)',
            }}
          />
        </div>

        {/* 2. 內頁 */}
        <div className="absolute inset-0 transform-style-3d shadow-2xl" style={{ transform: 'translateZ(40px)', zIndex: 20 }}>
          {/* 內層書脊陰影 - 移至此層以增強立體感 */}
          <div className="absolute left-[-22px] top-[-10px] bottom-[-10px] w-14 bg-gradient-to-r from-black/80 via-black/20 to-transparent translate-z-[-1px] blur-[3px] rounded-l-full opacity-60 pointer-events-none" />
          
          {pages.map((content, idx) => (
            <div
              key={idx}
              ref={(el) => { pageRefs.current[idx] = el; }}
              className="absolute inset-0 origin-left transform-style-3d dossier-page"
              style={{
                // 利用物理 Z 軸間距 (idx * 0.1px) 解決 Z-Fighting 問題，取代不穩定的 zIndex
                transform: idx < currentPage 
                  ? `rotateY(-160deg) translateZ(${idx * 0.1}px)` 
                  : `rotateY(-5deg) translateZ(${(totalInternalPages - idx) * 0.1}px)`,
              }}
            >
              {/* 正面 */}
              <div className="absolute inset-0 transform-style-3d">
                <div
                  className="absolute inset-0 bg-[#ecd8b0] border-r border-black/10 shadow-inner"
                  style={{
                    backgroundImage:
                      'url("https://www.transparenttextures.com/patterns/handmade-paper.png")',
                    backgroundColor: '#ecd8b0',
                  }}
                />
                {/* 固定的摺痕陰影：現在放在内容層下方，背景層上方，確保不受文字影響 */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black/40 via-black/5 to-transparent pointer-events-none z-[5]" />
                
                <div
                  className="absolute inset-0 flex flex-col relative z-10"
                  style={{
                    paddingLeft: '75px',
                    paddingRight: '35px',
                    paddingTop: '40px',
                    paddingBottom: '40px',
                  }}
                >
                  <div className="flex justify-between items-start mb-4 opacity-30">
                    <div />
                    <div className="translate-x-6">{dossierStyle.icon}</div>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
                    <p
                      className={`text-[#3c2a1c] font-serif whitespace-pre-wrap ${idx === 0 ? 'first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:mt-1' : ''}`}
                      style={{
                        fontSize: '17px',
                        lineHeight: '1.8',
                        textAlign: 'justify',
                        wordBreak: 'break-all',
                        textShadow: '0 0.5px 0.5px rgba(0,0,0,0.05)', // 微量文字投影增加質感，而非長度渲染
                      }}
                    >
                      {content}
                    </p>
                  </div>
                  <div className="mt-6 flex justify-between items-center opacity-20 text-[10px] font-black italic">
                    <div />
                  </div>
                </div>
              </div>
              {/* 背面 */}
              <div
                className="absolute inset-0 backface-hidden [transform:rotateY(-180deg)] shadow-2xl"
                style={{ backgroundColor: '#d9c5a3' }}
              />
            </div>
          ))}
        </div>

        {/* 封面 - 核心隔離標記 */}
        <div
          ref={coverRef}
          className="absolute inset-0 origin-left transform-style-3d book-cover"
          style={{ 
            zIndex: isCoverOpened ? 5 : 200,
            transform: isCoverOpened ? 'rotateY(-180deg) translateZ(-10px)' : 'translateZ(80px)'
          }}
        >
          {/* 封面正面 */}
          <div
            className="absolute inset-0 rounded-r-xl border-r-[15px] border-black/30 flex flex-col items-center justify-center p-12 backface-hidden shadow-[20px_0_60px_rgba(0,0,0,0.5)] translate-z-[0.5px]"
            style={{
              backgroundColor: dossierStyle.coverColor,
              backgroundImage:
                'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 80%), url("https://www.transparenttextures.com/patterns/leather.png")',
            }}
          >
            <div
              className={`w-full h-full border ${dossierStyle.accent} flex flex-col items-center justify-center p-8`}
            >
              <div className="mb-8 opacity-20">{dossierStyle.icon}</div>
              <h2 className="text-2xl font-black text-white/40 tracking-[0.4em] uppercase text-center font-serif italic mb-2">
                {START_PATH_NAMES[activePath]}
              </h2>
            </div>
          </div>
          {/* 封面背面 - 改為暗綠色絲絨質感，與底座區隔 */}
          <div
            className="absolute inset-0 [transform:rotateY(-180deg)_translateZ(0.5px)] backface-hidden rounded-l-xl shadow-inner"
            style={{
              backgroundColor: '#1a2f23', // 暗綠色絲絨
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent), radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 80%)',
              borderLeft: '12px solid rgba(0,0,0,0.6)'
            }}
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
          </div>
        </div>
      </div>
    </div>
  );
}
