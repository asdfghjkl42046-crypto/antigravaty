'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * GameCanvas — 固定設計解析度的畫布包裝器
 *
 * 設計原理：
 * - 以 DESIGN_W × DESIGN_H 為基準（預設 390×844，iPhone 14 比例）
 * - 在任何螢幕上計算 scale = min(viewportW / designW, viewportH / designH)
 * - 整體 CSS transform: scale() 等比縮放，不裁切、不變形
 * - 內部所有子組件只需用 px 在固定畫布上排版
 */

// 設計基準解析度（可依團隊需求調整）
const DESIGN_W = 390;
const DESIGN_H = 844;

interface GameCanvasProps {
  children: React.ReactNode;
  /** 自訂設計寬度（預設 390） */
  designWidth?: number;
  /** 自訂設計高度（預設 844） */
  designHeight?: number;
  /** 背景色（預設 #020617） */
  bgColor?: string;
}

export default function GameCanvas({
  children,
  designWidth = DESIGN_W,
  designHeight = DESIGN_H,
  bgColor = '#020617',
}: GameCanvasProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calcScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // 取較小的縮放因子，確保畫布完整顯示
      const s = Math.min(vw / designWidth, vh / designHeight);
      setScale(s);
    };

    calcScale();
    window.addEventListener('resize', calcScale);
    // 處理螢幕旋轉
    window.addEventListener('orientationchange', () => {
      setTimeout(calcScale, 100);
    });

    return () => {
      window.removeEventListener('resize', calcScale);
      window.removeEventListener('orientationchange', calcScale);
    };
  }, [designWidth, designHeight]);

  return (
    <>
      <style jsx>{`
        .game-canvas-bg {
          background-color: ${bgColor};
        }
        .game-canvas-inner {
          width: ${designWidth}px;
          height: ${designHeight}px;
          transform: scale(${scale});
          transform-origin: center center;
        }
      `}</style>
      <div className="game-canvas-bg fixed inset-0 flex items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="game-canvas-inner relative overflow-hidden flex-shrink-0"
        >
          {children}
        </div>
      </div>
    </>
  );
}
