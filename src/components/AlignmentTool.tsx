'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Save, Move, Maximize, CircleDashed } from 'lucide-react';

export interface AlignmentElement {
  top: number;
  left: number;
  width: number;
  height: number;
  radius?: number;
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
  renderElement 
}: AlignmentToolProps) {
  const [elements, setElements] = useState<Record<string, AlignmentElement>>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(Object.keys(initialElements)[0] || null);
  const [activeHandle, setActiveHandle] = useState<'move' | 'resize' | 'radius' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number, y: number, top: number, left: number, width: number, height: number } | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string | null>(null);

  const updateElement = useCallback((id: string, updates: Partial<AlignmentElement>) => {
    setElements(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, []);

  useEffect(() => {
    onUpdate(elements);
  }, [elements, onUpdate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedId || !dragStart || !activeHandle || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      if (activeHandle === 'move') {
        updateElement(selectedId, {
          top: dragStart.top + deltaY,
          left: dragStart.left + deltaX
        });
      } else if (activeHandle === 'resize') {
        updateElement(selectedId, {
          width: Math.max(0.2, dragStart.width + deltaX),
          height: Math.max(0.2, dragStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setActiveHandle(null);
      setDragStart(null);
    };

    if (activeHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedId, dragStart, activeHandle, containerRef, updateElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      const el = elements[selectedId];
      if (!el) return;

      const step = e.shiftKey ? 0.2 : 0.05;
      const radiusStep = 1;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      switch (e.key) {
        case 'ArrowUp':
          if (e.altKey) updateElement(selectedId, { height: el.height - step });
          else if (activeHandle === 'radius' || e.key.toLowerCase() === 'b') updateElement(selectedId, { radius: (el.radius || 0) + radiusStep });
          else updateElement(selectedId, { top: el.top - step });
          break;
        case 'ArrowDown':
          if (e.altKey) updateElement(selectedId, { height: el.height + step });
          else if (activeHandle === 'radius' || e.key.toLowerCase() === 'b') updateElement(selectedId, { radius: Math.max(0, (el.radius || 0) - radiusStep) });
          else updateElement(selectedId, { top: el.top + step });
          break;
        case 'ArrowLeft':
          if (e.altKey) updateElement(selectedId, { width: el.width - step });
          else updateElement(selectedId, { left: el.left - step });
          break;
        case 'ArrowRight':
          if (e.altKey) updateElement(selectedId, { width: el.width + step });
          else updateElement(selectedId, { left: el.left + step });
          break;
        case 'b':
          setActiveHandle(prev => prev === 'radius' ? null : 'radius');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, activeHandle, updateElement]);

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
      height: el.height
    });
  };

  const selectedElement = selectedId ? elements[selectedId] : null;

  return (
    <div className="absolute inset-0 z-[1000] pointer-events-none">
      {/* 攔截層 */}
      <div className="absolute inset-0 pointer-events-auto z-[-1]" />

      <style dangerouslySetInnerHTML={{ __html: `
        ${Object.entries(elements).map(([id, el]) => `
          .align-item-${CSS.escape(id)} {
            position: absolute;
            top: ${el.top}%;
            left: ${el.left}%;
            width: ${el.width}%;
            height: ${el.height}%;
            border-radius: ${el.radius || 0}px !important;
            transition: none !important;
          }
          .align-highlight-${CSS.escape(id)} {
            border: 2px solid ${id === selectedId ? '#22D3EE' : 'rgba(255,255,255,0.2)'};
            box-shadow: ${id === selectedId ? '0 0 20px rgba(34,211,238,0.5)' : 'none'};
            z-index: ${id === selectedId ? 100 : 10};
            pointer-events: auto;
            cursor: move;
            background: ${id === selectedId ? 'rgba(34,211,238,0.05)' : 'transparent'};
          }
        `).join('\n')}
      `}} />

      {Object.entries(elements).map(([id, el]) => (
        <div 
          key={id} 
          className={`align-item-${id} align-highlight-${id} flex items-center justify-center`}
          onMouseDown={(e) => handleStartDrag(e, id, 'move')}
        >
          {renderElement ? (
            renderElement(id, el)
          ) : (
            <div className="text-[10px] bg-red-600/80 text-white px-1 font-bold rounded">{id}</div>
          )}

          {selectedId === id && (
            <div 
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22D3EE] cursor-nwse-resize z-[150] rounded-full border-2 border-white pointer-events-auto flex items-center justify-center"
              onMouseDown={(e) => handleStartDrag(e, id, 'resize')}
              title="RESIZE"
            >
              <Maximize className="w-3 h-3 text-black" />
            </div>
          )}
        </div>
      ))}

      <div className="fixed top-4 right-4 w-72 bg-slate-900 shadow-2xl border border-white/10 p-4 rounded-2xl pointer-events-auto z-[1100] text-white">
        <div className="flex items-center space-x-2 mb-4">
          <Move className="w-5 h-5 text-[#22D3EE]" />
          <h2 className="text-sm font-black tracking-widest uppercase">Layout Editor v3.6</h2>
        </div>

        <div className="space-y-4 max-h-[85dvh] overflow-y-auto pr-1 custom-scrollbar">
          <div>
            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Target</label>
            <select 
              value={selectedId || ''} 
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#22D3EE]"
              title="SELECT"
            >
              {Object.keys(elements).map(id => <option key={id} value={id}>{id}</option>)}
            </select>
          </div>

          {selectedElement && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-500 block">TOP (%)</label>
                  <input type="number" step="0.05" value={selectedElement.top.toFixed(2)} onChange={(e) => updateElement(selectedId!, { top: parseFloat(e.target.value) })} className="w-full bg-black/40 px-2 py-1 text-[10px] rounded border border-white/5" title="TOP" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block">LEFT (%)</label>
                  <input type="number" step="0.05" value={selectedElement.left.toFixed(2)} onChange={(e) => updateElement(selectedId!, { left: parseFloat(e.target.value) })} className="w-full bg-black/40 px-2 py-1 text-[10px] rounded border border-white/5" title="LEFT" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block">WIDTH (%)</label>
                  <input type="number" step="0.05" value={selectedElement.width.toFixed(2)} onChange={(e) => updateElement(selectedId!, { width: parseFloat(e.target.value) })} className="w-full bg-black/40 px-2 py-1 text-[10px] rounded border border-white/5" title="WIDTH" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block">HEIGHT (%)</label>
                  <input type="number" step="0.05" value={selectedElement.height.toFixed(2)} onChange={(e) => updateElement(selectedId!, { height: parseFloat(e.target.value) })} className="w-full bg-black/40 px-2 py-1 text-[10px] rounded border border-white/5" title="HEIGHT" />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 flex items-center justify-between">
                  <span>ROUNDNESS ({Math.round(selectedElement.radius || 0)}px)</span>
                  <CircleDashed className="w-3 h-3 text-emerald-400" />
                </label>
                <input 
                  type="range" min="0" max="100" 
                  value={selectedElement.radius || 0} 
                  onChange={(e) => updateElement(selectedId!, { radius: parseInt(e.target.value) })}
                  className="w-full accent-emerald-500 mt-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  title="RADIUS"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 space-y-3">
            <button 
              onClick={() => {
                setJsonOutput(JSON.stringify(elements, null, 2));
              }}
              className="w-full bg-[#22D3EE] text-black font-black py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>匯出佈局數據</span>
            </button>

            {jsonOutput && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <textarea 
                  className="w-full h-32 bg-black/60 border border-[#22D3EE]/30 rounded-lg p-2 text-[9px] font-mono text-cyan-200 outline-none focus:border-[#22D3EE]"
                  value={jsonOutput}
                  readOnly
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  title="JSON OUTPUT"
                />
                <button 
                  onClick={() => setJsonOutput(null)}
                  className="w-full border border-white/10 text-slate-400 text-[10px] py-1 rounded-lg hover:bg-white/5"
                >
                  隱藏代碼
                </button>
              </div>
            )}
            
            <p className="text-[9px] text-slate-500 text-center">B切換圓角模式 • Alt+方向調大小</p>
          </div>
        </div>
      </div>
    </div>
  );
}
