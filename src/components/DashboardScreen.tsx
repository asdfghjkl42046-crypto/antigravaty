'use client';

import React, { useState, useRef } from 'react';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

interface DashboardScreenProps {
  onEndTurn: () => void;
  onReset: () => void;
}

export default function DashboardScreen({ onEndTurn, onReset }: DashboardScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDevMode] = useState(true); // 預設開啟，方便您對位主介面按鈕

  // 初始數據：主介面的功能按鈕 (例如結束回合)
  const [elements, setElements] = useState<Record<string, AlignmentElement>>({
    endTurn: { top: 35.0, left: 5.0, width: 90.0, height: 10.0, radius: 20 },
    reset: { top: 2.0, left: 85.0, width: 10.0, height: 5.0, radius: 999 },
  });

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-black">
      <div ref={containerRef} className="relative h-full w-fit select-none">
        {/* 絕對純淨的遊戲主介面底圖 - 動態撐開容器以鎖定點擊層 */}
        <img 
          src="/ui/ref_dashboard.png" 
          alt="Game Dashboard"
          className="h-full w-auto block pointer-events-none"
        />

        {/* 實體交互區域 (生產環境) */}
        {!isDevMode && (
          <div className="absolute inset-0 z-20">
            <button 
              onClick={onEndTurn}
              className="absolute top-[35%] left-[5%] w-[90%] h-[10%] rounded-[20px] bg-transparent cursor-pointer"
              title="結束回合"
              aria-label="END TURN"
            />
            <button 
              onClick={onReset}
              className="absolute top-[2%] left-[85%] w-[10%] h-[5%] rounded-full bg-transparent cursor-pointer"
              title="重新開始"
              aria-label="RESET GAME"
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

