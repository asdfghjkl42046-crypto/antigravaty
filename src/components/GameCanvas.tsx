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
      // 防止視窗尺寸異常
      const vw = window.innerWidth;
      const vh = window.innerHeight; 
      
      // 為電腦端預留外框 (outline) 與 陰影 (shadow) 的空間
      // 模擬手機在 500px 以上會加上 8px 框 + 10px 陰影 + 緩衝，約需 100px 高度剩餘
      const SAFE_W = vw > 500 ? 50 : 0;
      const SAFE_H = vw > 500 ? 100 : 0;

      // 取較小的縮放因子，確保畫布連同框架完整顯示
      const s = Math.min((vw - SAFE_W) / designWidth, (vh - SAFE_H) / designHeight);
      
      // 計算目前的縮放比率，並確保不低於 0.2
      setScale(Math.max(s, 0.2));
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
        /* 全域背景容器 - 強制層次隔離 */
        .game-canvas-bg {
          background-color: ${bgColor};
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 0;
          isolation: isolate;
        }
        
        /* 環境光效果 (改用獨立背景層) */
        .ambient-glow {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.25) 0%, transparent 70%),
            radial-gradient(circle at 20% 80%, rgba(30, 58, 138, 0.1) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }

        .game-canvas-inner {
          width: ${designWidth}px;
          height: ${designHeight}px;
          transform: scale(${scale}) translateZ(0); /* 強制開啟 GPU 硬體層 */
          transform-origin: center center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          z-index: 10;
          backface-visibility: hidden;
          will-change: transform;
        }

        /* 桌面端手機框質感 (移除導致重影的大面積散光陰影) */
        @media (min-width: 500px) {
          .game-canvas-inner {
            outline: 8px solid #0f172a;
            border-radius: 44px;
            box-shadow: 
              0 0 0 10px #1e293b,
              0 24px 48px rgba(0, 0, 0, 0.6); /* 僅保留基本深度陰影 */
          }
        }
      `}</style>
      <div className="game-canvas-bg">
        {/* 背景環境裝飾 */}
        <div className="ambient-glow" />
        <div
          ref={containerRef}
          className="game-canvas-inner"
        >
          {children}
        </div>
      </div>
    </>
  );
}
