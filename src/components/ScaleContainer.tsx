'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ScaleContainerProps {
  children: React.ReactNode;
}

/**
 * 19.5:9 等比例縮放容器 (Scale-to-Fit)
 * 基準尺寸：390px * 844px (基於 iPhone 14/15 比例)
 */
export const ScaleContainer: React.FC<ScaleContainerProps> = ({ children }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const BASE_WIDTH = 390;
  const BASE_HEIGHT = 845; // 390 / (9/19.5) = 845
  const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

  useEffect(() => {
    const updateScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      const windowRatio = windowWidth / windowHeight;
      
      let newScale = 1;
      
      if (windowRatio > ASPECT_RATIO) {
        // 視窗過寬 (Desktop) -> 根據高度縮放
        newScale = windowHeight / BASE_HEIGHT;
      } else {
        // 視窗過窄 (Vertical) -> 根據寬度縮放
        newScale = windowWidth / BASE_WIDTH;
      }
      
      setScale(newScale);

      // --- 命令式更新 CSS 變數，繞過 JSX Style 警告 ---
      if (containerRef.current) {
        containerRef.current.style.setProperty('--base-width', `${BASE_WIDTH}px`);
        containerRef.current.style.setProperty('--base-height', `${BASE_HEIGHT}px`);
        containerRef.current.style.setProperty('--scale-factor', newScale.toString());
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden overscroll-none touch-none">
      <div 
        ref={containerRef}
        className="scale-canvas relative bg-black shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden origin-center shrink-0"
      >
        {children}
      </div>
    </div>
  );
};
