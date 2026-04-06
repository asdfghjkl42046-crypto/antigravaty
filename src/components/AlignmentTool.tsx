'use client';

import React, { useState, useRef, useEffect } from 'react';

/** 元件屬性介面 */
export interface AlignmentElement {
  top: number;
  left: number;
  width: number;
  height: number;
  radius: number;
}

interface AlignmentToolProps {
  /** 初始對位數據 */
  initialElements: Record<string, AlignmentElement>;
  /** 容器 Ref 用於計算比例 */
  containerRef: React.RefObject<HTMLDivElement>;
  /** 當數據變更時的回報 (選填) */
  onUpdate?: (elements: Record<string, AlignmentElement>) => void;
}

/** 
 * 通用對位工具 - 視覺化對位、拖拽、鍵盤微調一體化 
 */
export default function AlignmentTool({ initialElements, containerRef, onUpdate }: AlignmentToolProps) {
  const [elements, setElements] = useState<Record<string, AlignmentElement>>(initialElements);
  const [panelPos, setPanelPos] = useState({ top: 5, left: 10 });
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string>(Object.keys(initialElements)[0] || '');

  // 監聽外部 initialElements 變化
  useEffect(() => {
    setElements(initialElements);
    if (!activeKey) setActiveKey(Object.keys(initialElements)[0] || '');
  }, [initialElements, activeKey]);

  /** 處理滑鼠按下：啟動拖拽並設置選中目標 */
  const handleMouseDown = (key: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingKey(key);
    if (key !== 'panel') {
      setActiveKey(key);
    }
  };

  /** 屬性微調：寬高圓角 */
  const adjustProp = (key: string, prop: keyof AlignmentElement, amount: number) => {
    setElements(prev => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          [prop]: parseFloat((prev[key][prop] + amount).toFixed(1))
        }
      };
      onUpdate?.(next);
      return next;
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingKey || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const leftPercent = parseFloat(((x / rect.width) * 100).toFixed(2));
      const topPercent = parseFloat(((y / rect.height) * 100).toFixed(2));

      if (draggingKey === 'panel') {
        setPanelPos({ top: topPercent, left: leftPercent });
      } else {
        setElements(prev => {
          const next = {
            ...prev,
            [draggingKey]: { ...prev[draggingKey], top: topPercent, left: leftPercent }
          };
          onUpdate?.(next);
          return next;
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingKey(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeKey || draggingKey) return;

      const step = 0.05;
      let dTop = 0, dLeft = 0;

      switch(e.key) {
        case 'ArrowUp': dTop = -step; break;
        case 'ArrowDown': dTop = step; break;
        case 'ArrowLeft': dLeft = -step; break;
        case 'ArrowRight': dLeft = step; break;
        default: return;
      }

      e.preventDefault();
      setElements(prev => {
        const target = prev[activeKey];
        if (!target) return prev;
        const next = {
          ...prev,
          [activeKey]: {
            ...target,
            top: parseFloat((target.top + dTop).toFixed(2)),
            left: parseFloat((target.left + dLeft).toFixed(2))
          }
        };
        onUpdate?.(next);
        return next;
      });
    };

    if (draggingKey) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [draggingKey, activeKey, containerRef, onUpdate]);

  /** 生成動態 CSS */
  const dynamicCss = `
    #alignment-debug-panel {
      top: ${panelPos.top}%;
      left: ${panelPos.left}%;
    }
    ${Object.entries(elements).map(([key, style]) => `
      .align-box-${key} {
        top: ${style.top}%;
        left: ${style.left}%;
        width: ${style.width}%;
        height: ${style.height}%;
        border-radius: ${style.radius === 999 ? '9999px' : `${style.radius}px`};
      }
    `).join('\n')}
    ${activeKey && elements[activeKey] ? `
      #alignment-selection-indicator {
        top: ${elements[activeKey].top}%;
        left: ${elements[activeKey].left}%;
        width: ${elements[activeKey].width}%;
        height: ${elements[activeKey].height}%;
        border-radius: ${elements[activeKey].radius === 999 ? '9999px' : `${elements[activeKey].radius}px`};
      }
    ` : ''}
  `;

  return (
    <>
      <style>{dynamicCss}</style>

      {/* 數據顯示與控制面板 */}
      <div 
        id="alignment-debug-panel"
        className="absolute z-50 bg-black/95 p-3 text-[10px] text-cyan-300 font-mono border-b-2 border-cyan-500 shadow-2xl min-w-[300px] select-none rounded"
      >
        <div 
          onMouseDown={handleMouseDown('panel')}
          className="flex justify-between items-center mb-2 bg-cyan-900/40 p-1 cursor-move hover:bg-cyan-900/60 transition-colors rounded"
        >
          <span className="text-yellow-400 font-bold">對位工具 (拖拽面板)</span>
          <span className="text-white bg-red-600 px-1 rounded ml-2 text-[8px]">選中: {activeKey.toUpperCase()}</span>
        </div>

        {/* 修訂屬性區 */}
        <div className="flex flex-wrap gap-2 mb-3 bg-gray-800 p-2 rounded border border-gray-700">
          <div className="flex items-center space-x-1 border-r border-gray-600 pr-1 text-white">
            <span>寬:</span>
            <button onClick={() => adjustProp(activeKey, 'width', 0.5)} className="bg-gray-700 px-1 hover:bg-cyan-700 rounded transition-colors text-white">＋</button>
            <button onClick={() => adjustProp(activeKey, 'width', -0.5)} className="bg-gray-700 px-1 hover:bg-cyan-700 rounded transition-colors text-white">－</button>
          </div>
          <div className="flex items-center space-x-1 border-r border-gray-600 pr-1 text-white">
            <span>高:</span>
            <button onClick={() => adjustProp(activeKey, 'height', 0.5)} className="bg-gray-700 px-1 hover:bg-cyan-700 rounded transition-colors text-white">＋</button>
            <button onClick={() => adjustProp(activeKey, 'height', -0.5)} className="bg-gray-700 px-1 hover:bg-cyan-700 rounded transition-colors text-white">－</button>
          </div>
          <div className="flex items-center space-x-1 text-white">
            <span>圓:</span>
            <button onClick={() => adjustProp(activeKey, 'radius', 2)} className="bg-gray-700 px-1 hover:bg-cyan-700 rounded transition-colors text-white">＋</button>
            <button onClick={() => adjustProp(activeKey, 'radius', -2)} className="bg-gray-700 px-1 hover:bg-cyan-700 rounded transition-colors text-white">－</button>
          </div>
        </div>

        {/* 數值列表 */}
        <div className="flex flex-col space-y-2 h-[180px] overflow-y-auto bg-black/50 p-2 rounded border border-cyan-900/50 text-white">
          {Object.entries(elements).map(([key, val]) => (
            <div key={key} className={`p-1.5 rounded border transition-colors ${activeKey === key ? 'bg-cyan-900/50 border-cyan-400' : 'bg-gray-900/30 border-gray-800'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`font-bold ${activeKey === key ? 'text-white' : 'text-gray-500'}`}>{key.toUpperCase()}:</span>
                {activeKey === key && <span className="text-[7px] bg-cyan-500 text-black px-1 rounded">ACTIVE</span>}
              </div>
              <code className="block text-[8px] break-all text-cyan-200 opacity-90 leading-normal">
                {JSON.stringify(val)}
              </code>
            </div>
          ))}
        </div>
        <div className="text-[8px] text-gray-500 mt-2 italic text-center">💡 鍵盤方向鍵支援 0.05% 微調</div>
      </div>

      {/* 畫面上感應紅框區域 */}
      <div className="absolute inset-0 z-40 pointer-events-none">
        {Object.entries(elements).map(([key]) => (
          <div 
            key={key}
            onMouseDown={handleMouseDown(key)}
            className={`absolute pointer-events-auto cursor-move flex items-center justify-center transition-shadow shadow-lg border align-box-${key} ${activeKey === key ? 'border-yellow-400 z-50 bg-red-500/50 shadow-cyan-400/20' : 'border-white/20 z-40 bg-red-600/30'}`}
          >
            <span className={`text-[8px] font-bold ${activeKey === key ? 'text-yellow-200' : 'text-white/60'}`}>{key.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {/* 選取指示器 (外發光) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {activeKey && elements[activeKey] && (
            <div 
                id="alignment-selection-indicator"
                className="absolute border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]" 
            />
        )}
      </div>
    </>
  );
}
