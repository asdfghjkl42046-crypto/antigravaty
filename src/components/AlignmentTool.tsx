'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Move, Maximize, CircleDashed, Type, Undo2, Trash2 } from 'lucide-react';
import { SYSTEM_STRINGS } from '@/data/SystemStrings';

export interface AlignmentElement {
  top: number;
  left: number;
  width: number;
  height: number;
  radius?: number;
  fontSize?: number;
  label?: string; // 新增：用於顯示編輯器內的文字標籤 (如 "白手起家")
}

interface AlignmentToolProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  initialElements: Record<string, AlignmentElement>;
  onUpdate: (elements: Record<string, AlignmentElement>) => void;
  renderElement?: (id: string, element: AlignmentElement) => React.ReactNode;
}

export default function AlignmentTool({
  containerRef,
  initialElements,
  onUpdate,
  renderElement,
}: AlignmentToolProps) {
  const [elements, setElements] = useState<Record<string, AlignmentElement>>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(
    Object.keys(initialElements)[0] || null
  );
  const [activeHandle, setActiveHandle] = useState<'move' | 'resize' | 'radius' | null>(null);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);

  // --- 歷史紀錄系統 (Undo/Redo) ---
  const [history, setHistory] = useState<Record<string, AlignmentElement>[]>([initialElements]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false); // 防止打字時觸發快捷鍵

  // 輔助函數：將當前狀態推入歷史堆疊
  const pushToHistory = useCallback(
    (newElements: Record<string, AlignmentElement>) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newElements))); // 深拷貝防止引用問題
        if (newHistory.length > 50) newHistory.shift(); // 限制 50 步歷史
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  // 撤銷函數
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setElements(prevState);
      setHistoryIndex((prev) => prev - 1);
      // 如果撤銷操作讓當前選中的 ID 消失了，重置選取
      if (selectedId && !prevState[selectedId]) {
        setSelectedId(Object.keys(prevState)[0] || null);
      }
    }
  }, [history, historyIndex, selectedId]);

  const updateElement = useCallback(
    (id: string, updates: Partial<AlignmentElement>, finalize = false) => {
      const newElements = {
        ...elements,
        [id]: { ...elements[id], ...updates },
      };
      setElements(newElements);
      if (finalize) {
        pushToHistory(newElements);
      }
    },
    [elements, pushToHistory]
  );

  const deleteElement = useCallback(
    (id: string) => {
      const newElements = { ...elements };
      delete newElements[id];
      setElements(newElements);
      pushToHistory(newElements);
      setSelectedId(Object.keys(newElements)[0] || null);
    },
    [elements, pushToHistory]
  );

  // 當 elements 改變時同步給父組件
  useEffect(() => {
    onUpdate(elements);
  }, [elements, onUpdate]);

  // 監聽拖動結束，存入歷史
  useEffect(() => {
    const handleMouseUp = () => {
      if (activeHandle && selectedId) {
        pushToHistory(elements);
      }
      setActiveHandle(null);
      setDragStart(null);
    };

    if (activeHandle) {
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [activeHandle, selectedId, elements, pushToHistory]);

  // 滑鼠拖動邏輯
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedId || !dragStart || !activeHandle || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      if (activeHandle === 'move') {
        setElements((prev) => ({
          ...prev,
          [selectedId]: {
            ...prev[selectedId],
            top: dragStart.top + deltaY,
            left: dragStart.left + deltaX,
          },
        }));
      } else if (activeHandle === 'resize') {
        setElements((prev) => ({
          ...prev,
          [selectedId]: {
            ...prev[selectedId],
            width: Math.max(0.2, dragStart.width + deltaX),
            height: Math.max(0.2, dragStart.height + deltaY),
          },
        }));
      }
    };

    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [selectedId, dragStart, activeHandle, containerRef]);

  // 鍵盤邏輯
  useEffect(() => {
    // 鍵盤監聽：防誤觸機制
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping) return; // 正在打字時停用快捷鍵
      // Ctrl + Z 復原
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      if (!selectedId) return;
      const el = elements[selectedId];
      if (!el) return;

      // Backspace / Delete 刪除
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          e.preventDefault();
          deleteElement(selectedId);
          return;
        }
      }

      const step = e.shiftKey ? 1 : 0.1;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

        e.preventDefault();
        e.stopPropagation();
      }

      switch (e.key) {
        case 'ArrowUp':
          if (e.altKey) updateElement(selectedId, { height: el.height - step }, true);
          else updateElement(selectedId, { top: el.top - step }, true);
          break;
        case 'ArrowDown':
          if (e.altKey) updateElement(selectedId, { height: el.height + step }, true);
          else updateElement(selectedId, { top: el.top + step }, true);
          break;
        case 'ArrowLeft':
          if (e.altKey) updateElement(selectedId, { width: el.width - step }, true);
          else updateElement(selectedId, { left: el.left - step }, true);
          break;
        case 'ArrowRight':
          if (e.altKey) updateElement(selectedId, { width: el.width + step }, true);
          else updateElement(selectedId, { left: el.left + step }, true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, undo, deleteElement, updateElement, isTyping]);

  const handleStartDrag = (e: React.MouseEvent, id: string, handle: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    setActiveHandle(handle);
    const el = elements[id];
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      top: el.top,
      left: el.left,
      width: el.width,
      height: el.height,
    });
  };

  const selectedElement = selectedId ? elements[selectedId] : null;

  return (
    <div className="absolute inset-0 z-[1000] pointer-events-none">
      <div className="absolute inset-0 pointer-events-auto z-[-1]" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        ${Object.entries(elements)
          .map(
            ([id, el]) => `
          .align-item-${CSS.escape(id)} {
            position: absolute;
            top: ${el.top}%;
            left: ${el.left}%;
            width: ${el.width}%;
            height: ${el.height}%;
            border-radius: ${el.radius || 0}px !important;
            font-size: ${el.fontSize || 14}px !important;
            transition: none !important;
          }
          .align-highlight-${CSS.escape(id)} {
            border: ${id === selectedId ? '1px dashed #22D3EE' : '0.5px solid rgba(255,255,255,0.15)'};
            box-shadow: ${id === selectedId ? '0 0 15px rgba(34,211,238,0.3)' : 'none'};
            z-index: ${id === selectedId ? 100 : 10};
            pointer-events: auto;
            cursor: move;
            background: ${id === selectedId ? 'rgba(34,211,238,0.1)' : 'transparent'};
            backdrop-filter: ${id === selectedId ? 'blur(1px)' : 'none'};
          }
        `
          )
          .join('\n')}
      `,
        }}
      />

      {Object.entries(elements).map(([id, el]) => (
        <div
          key={id}
          className={`align-item-${id} align-highlight-${id} flex items-center justify-center`}
          onMouseDown={(e) => handleStartDrag(e, id, 'move')}
        >
          {renderElement ? (
            renderElement(id, el)
          ) : (
            <div
              className={`flex flex-col items-center justify-center text-center px-1 transition-opacity duration-300 ${id === selectedId ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="text-[7px] text-[#22D3EE] font-bold uppercase mb-0.5">{id}</div>
              {el.label && (
                <div className="text-[10px] text-white font-black leading-tight break-all">
                  {el.label}
                </div>
              )}
            </div>
          )}

          {selectedId === id && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22D3EE] cursor-nwse-resize z-[150] rounded-full border-2 border-white pointer-events-auto flex items-center justify-center shadow-lg"
              onMouseDown={(e) => handleStartDrag(e, id, 'resize')}
            >
              <Maximize className="w-3 h-3 text-black" />
            </div>
          )}
        </div>
      ))}

      {/* 控制面板 */}
      <div className="fixed top-4 right-4 w-72 bg-slate-900 shadow-2xl border border-white/10 p-4 rounded-2xl pointer-events-auto z-[1100] text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Move className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="text-sm font-black tracking-widest uppercase">Layout Editor v4.0</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-lg transition-colors ${historyIndex > 0 ? 'bg-white/10 hover:bg-white/20 text-white' : 'text-slate-600 cursor-not-allowed'}`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => selectedId && deleteElement(selectedId)}
              disabled={!selectedId}
              className={`p-2 rounded-lg transition-colors ${selectedId ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'text-slate-600 cursor-not-allowed'}`}
              title="Delete (Backspace)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[80dvh] overflow-y-auto pr-1 custom-scrollbar text-white">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
              Target
            </label>
            <select
              value={selectedId || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              title="選擇要編輯的元件 ID (Select Target Element)"
              className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-2 text-xs outline-none focus:border-[#22D3EE] text-white"
            >
              {Object.entries(elements).map(([id, el]) => (
                <option key={id} value={id}>
                  {id} {el.label ? `(${el.label.substring(0, 10)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedElement && (
            <div className="space-y-4">
              {/* 文字內容修改 */}
              <div className="pt-2 border-t border-white/5">
                <label className="text-[7px] text-blue-400 font-bold mb-1 block">
                  {SYSTEM_STRINGS.ALIGNMENT.LABEL_HINT}
                </label>
                <input
                  type="text"
                  value={elements[selectedId!]?.label || ''}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  onChange={(e) => updateElement(selectedId!, { label: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[10px] text-white focus:border-blue-500/50 outline-none"
                  placeholder={SYSTEM_STRINGS.ALIGNMENT.INPUT_PLACEHOLDER}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block font-bold">TOP (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    title="垂直位置門檻 (Top %)"
                    value={selectedElement.top.toFixed(1)}
                    onChange={(e) =>
                      updateElement(selectedId!, { top: parseFloat(e.target.value) }, true)
                    }
                    className="w-full bg-black/40 px-2 py-1.5 text-[10px] rounded border border-white/5 font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block font-bold">LEFT (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    title="水平位置門檻 (Left %)"
                    value={selectedElement.left.toFixed(1)}
                    onChange={(e) =>
                      updateElement(selectedId!, { left: parseFloat(e.target.value) }, true)
                    }
                    className="w-full bg-black/40 px-2 py-1.5 text-[10px] rounded border border-white/5 font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block font-bold">WIDTH (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    title="元件寬度百分比 (Width %)"
                    value={selectedElement.width.toFixed(1)}
                    onChange={(e) =>
                      updateElement(selectedId!, { width: parseFloat(e.target.value) }, true)
                    }
                    className="w-full bg-black/40 px-2 py-1.5 text-[10px] rounded border border-white/5 font-mono text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 block font-bold">HEIGHT (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    title="元件高度百分比 (Height %)"
                    value={selectedElement.height.toFixed(1)}
                    onChange={(e) =>
                      updateElement(selectedId!, { height: parseFloat(e.target.value) }, true)
                    }
                    className="w-full bg-black/40 px-2 py-1.5 text-[10px] rounded border border-white/5 font-mono text-white"
                  />
                </div>
              </div>

              {/* 字體大小控制 */}
              <div>
                <label className="text-[9px] text-slate-500 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <Type className="w-3 h-3 text-[#22D3EE]" /> FONT SIZE (
                    {selectedElement.fontSize || 14}px)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="8"
                    max="80"
                    title="字體大小滑桿 (Font Size Range)"
                    value={selectedElement.fontSize || 14}
                    onChange={(e) =>
                      updateElement(selectedId!, { fontSize: parseInt(e.target.value) }, true)
                    }
                    className="flex-1 accent-[#22D3EE] h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    title="字體大小數值 (Font Size PX)"
                    value={selectedElement.fontSize || 14}
                    onChange={(e) =>
                      updateElement(selectedId!, { fontSize: parseInt(e.target.value) }, true)
                    }
                    className="w-12 bg-black/40 px-1 py-1 text-[10px] rounded border border-white/5 text-center font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-slate-500 flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <CircleDashed className="w-3 h-3 text-emerald-400" /> ROUNDNESS (
                    {Math.round(selectedElement.radius || 0)}px)
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  title="圓角半徑滑桿 (Border Radius)"
                  value={selectedElement.radius || 0}
                  onChange={(e) =>
                    updateElement(selectedId!, { radius: parseInt(e.target.value) }, true)
                  }
                  className="w-full accent-emerald-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 space-y-3">
            <button
              onClick={() => {
                setJsonOutput(JSON.stringify(elements, null, 2));
              }}
              className="w-full bg-[#22D3EE] text-black font-black py-3 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{SYSTEM_STRINGS.ALIGNMENT.EXPORT}</span>
            </button>

            {jsonOutput && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <textarea
                  className="w-full h-40 bg-black/60 border border-[#22D3EE]/30 rounded-lg p-3 text-[9px] font-mono text-cyan-200 outline-none focus:border-[#22D3EE]"
                  value={jsonOutput}
                  readOnly
                  title="匯出的佈局代碼 (JSON Output Content)"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <button
                  onClick={() => setJsonOutput(null)}
                  className="w-full border border-white/10 text-slate-400 text-[10px] py-2 rounded-lg hover:bg-white/5"
                >
                  {SYSTEM_STRINGS.ALIGNMENT.HIDE}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-1">
              <p className="text-[8px] text-slate-500 text-center">
                {SYSTEM_STRINGS.ALIGNMENT.UNDO_HINT}
              </p>
              <p className="text-[8px] text-slate-500 text-center">{SYSTEM_STRINGS.ALIGNMENT.RESIZE_HINT}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
