'use client';

import React, { useState, useRef } from 'react';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

interface ModeSelectScreenProps {
  /** 選擇模式後觸發，傳入 'website' 或是 'ai' */
  onStartGame: (mode: 'website' | 'ai') => void;
}

export default function ModeSelectScreen({ onStartGame }: ModeSelectScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDevMode] = useState(false); // 關閉開發模式，切換為正式交互

  // 最終精確數據：網站與 AI 模式按鈕
  const [elements, setElements] = useState<Record<string, AlignmentElement>>({
    website: { top: 56.75, left: 13.85, width: 72.5, height: 6.0, radius: 30 },
    ai: { top: 84.23, left: 13.85, width: 72.5, height: 6.0, radius: 30 },
  });

  return (
    // 外層：確保在任何螢幕比例下都置中，且溢出部分隱藏
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-black">
      {/* 內層：w-fit h-full 確保容器寬度隨底圖動態調整，點擊層絕對鎖位 */}
      <div ref={containerRef} className="relative h-full w-fit select-none">
        
        {/* 絕對純淨的底圖 */}
        <img 
          src="/ui/ref_mode_select.png" 
          alt="Mode Select Screen"
          className="h-full w-auto block pointer-events-none"
        />

        {/* 天平動態影片覆蓋層 */}
        <video
          src="/assets/logo_anim.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-10 top-[5.5%] left-[29.5%] w-[41%] aspect-square rounded-[20%] object-cover pointer-events-none"
        />
        
        {/* 實體交互區域 (透明點擊層) */}
        {!isDevMode && (
          <div className="absolute inset-0 z-20">
            <button 
              onClick={() => onStartGame('website')}
              className="absolute cursor-pointer bg-transparent top-[56.75%] left-[13.85%] w-[72.5%] h-[6.0%] rounded-[30px]"
              title="WEBSITE MODE"
              aria-label="WEBSITE MODE"
            />
            <button 
              onClick={() => onStartGame('ai')}
              className="absolute cursor-pointer bg-transparent top-[84.23%] left-[13.85%] w-[72.5%] h-[6.0%] rounded-[30px]"
              title="AI MODE"
              aria-label="AI MODE"
            />
          </div>
        )}

        {/* [對位工具] 僅在開發模式顯示 */}
        {isDevMode && (
          <AlignmentTool 
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            initialElements={elements}
            onUpdate={setElements}
          />
        )}
      </div>
    </div>
  );
}



