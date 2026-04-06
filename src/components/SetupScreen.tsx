'use client';

import React, { useState, useRef } from 'react';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

interface SetupScreenProps {
  onBack: () => void;
  onConfirm: (count: number) => void;
}

export default function SetupScreen({ onBack, onConfirm }: SetupScreenProps) {
  const [selectedCount, setSelectedCount] = useState<number>(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDevMode] = useState(false); // 關閉開發模式，進入正式環境

  // 初始數據 (由使用者手動對位得出，轉換為數字格式供工具使用)
  const [elements, setElements] = useState<Record<string, AlignmentElement>>({
    back: { top: 3.9, left: 3.4, width: 7.5, height: 3.5, radius: 999 },
    p1: { top: 28.1, left: 15.15, width: 34.4, height: 16.0, radius: 38 },
    p2: { top: 28.1, left: 53.4, width: 34.4, height: 16.0, radius: 38 },
    p3: { top: 45.7, left: 15.15, width: 34.4, height: 16.0, radius: 38 },
    p4: { top: 45.7, left: 53.4, width: 34.4, height: 16.0, radius: 38 },
    confirm: { top: 78.45, left: 10.05, width: 80.0, height: 6.7, radius: 999 },
  });

  return (
    <div ref={containerRef} className="relative h-full aspect-[9/19.5] mx-auto overflow-hidden bg-black select-none">
      {/* 底圖 */}
      <img
        src="/ui/ref_setup.png"
        alt="Setup Screen"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* 交互按鈕層 (透明，僅用於點擊) */}
      {!isDevMode && (
        <div className="absolute inset-0 z-20">
          {/* 返回按鈕 */}
          <button 
            onClick={onBack}
            className="absolute top-[3.9%] left-[3.4%] w-[7.5%] h-[3.5%] rounded-full bg-transparent cursor-pointer"
            title="BACK"
            aria-label="BACK"
          />

          {/* 1-4 玩家選擇 */}
          <button onClick={() => setSelectedCount(1)} className="absolute top-[28.1%] left-[15.15%] w-[34.4%] h-[16%] rounded-[38px] bg-transparent cursor-pointer" title="P1" aria-label="P1" />
          <button onClick={() => setSelectedCount(2)} className="absolute top-[28.1%] left-[53.4%] w-[34.4%] h-[16%] rounded-[38px] bg-transparent cursor-pointer" title="P2" aria-label="P2" />
          <button onClick={() => setSelectedCount(3)} className="absolute top-[45.7%] left-[15.15%] w-[34.4%] h-[16%] rounded-[38px] bg-transparent cursor-pointer" title="P3" aria-label="P3" />
          <button onClick={() => setSelectedCount(4)} className="absolute top-[45.7%] left-[53.4%] w-[34.4%] h-[16%] rounded-[38px] bg-transparent cursor-pointer" title="P4" aria-label="P4" />

          {/* 確認按鈕 */}
          <button 
            onClick={() => onConfirm(selectedCount)}
            className="absolute top-[78.45%] left-[10.05%] w-[80%] h-[6.7%] rounded-full bg-transparent cursor-pointer"
            title="CONFIRM"
            aria-label="CONFIRM"
          />
        </div>
      )}

      {/* 選取指示器 (外發光) - 與按鈕座標精確同步 */}
      <div className="absolute inset-0 pointer-events-none z-10 transition-all duration-200">
        {selectedCount === 1 && <div className="absolute top-[28.1%] left-[15.15%] w-[34.4%] h-[16%] rounded-[38px] border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" />}
        {selectedCount === 2 && <div className="absolute top-[28.1%] left-[53.4%] w-[34.4%] h-[16%] rounded-[38px] border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" />}
        {selectedCount === 3 && <div className="absolute top-[45.7%] left-[15.15%] w-[34.4%] h-[16%] rounded-[38px] border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" />}
        {selectedCount === 4 && <div className="absolute top-[45.7%] left-[53.4%] w-[34.4%] h-[16%] rounded-[38px] border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" />}
      </div>

      {/* 通用對位工具 */}
      {isDevMode && (
        <AlignmentTool 
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          initialElements={elements}
          onUpdate={setElements}
        />
      )}
    </div>
  );
}
