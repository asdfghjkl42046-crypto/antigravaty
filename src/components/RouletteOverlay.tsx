import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Crosshair, HelpCircle } from 'lucide-react';

export interface RouletteOption {
  label: string;
  probability: number; // 0.0 ~ 1.0 (相加盡量為 1.0)
  colorHex: string; // CSS color string (e.g., '#ef4444')
}

interface RouletteOverlayProps {
  title: string;
  subtitle?: string;
  options: RouletteOption[];
  targetIndex: number;
  onComplete: () => void;
}

export default function RouletteOverlay({
  title,
  subtitle,
  options,
  targetIndex,
  onComplete,
}: React.PropsWithChildren<RouletteOverlayProps>) {
  const [rotation, setRotation] = useState(0);
  const [phase, setPhase] = useState<'pending' | 'spinning' | 'done'>('pending');

  const DURATION = 3500; // 轉盤轉動 3.5 秒
  const PAUSE = 1500;    // 停格展示 1.5 秒

  // 把選項換算成圓餅圖的角度
  const slices = options.map((opt, i) => {
    const startRatio = options.slice(0, i).reduce((sum, o) => sum + o.probability, 0);
    const endRatio = startRatio + opt.probability;
    return {
      ...opt,
      startAngle: startRatio * 360,
      endAngle: endRatio * 360,
    };
  });

  const gradientString = slices
    .map((s) => `${s.colorHex} ${s.startAngle}deg ${s.endAngle}deg`)
    .join(', ');

  useEffect(() => {
    // 預防錯誤配置
    if (!slices[targetIndex]) {
      console.error("Roulette: Invalid targetIndex");
      onComplete();
      return;
    }

    const tSlice = slices[targetIndex];
    
    // 讓指標隨機落在該扇形區域的 10% ~ 90% 區間內，避免永遠停在正中間不自然
    const range = tSlice.endAngle - tSlice.startAngle;
    const randomAngleInSlice = tSlice.startAngle + range * (0.1 + Math.random() * 0.8);
    
    // 指針固定在正上方 (0deg/360deg)。
    // 目標角度隨機值必須轉到正上方 -> 轉盤需要被"倒轉"回 randomAngleInSlice。
    // 再加上猛烈的 6 圈 (2160度) 視覺衝擊。
    const targetRotation = 360 * 6 - randomAngleInSlice;

    // 稍微延遲一下，讓 UI 彈出的動畫做完再開始轉
    const startTimer = setTimeout(() => {
      setPhase('spinning');
      setRotation(targetRotation);
    }, 100);

    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, DURATION + 200);

    const exitTimer = setTimeout(() => {
      onComplete();
    }, DURATION + 200 + PAUSE);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(doneTimer);
      clearTimeout(exitTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIndex]);

  return (
    <div className="fixed inset-0 z-[500] bg-[#0a0c10] flex flex-col items-center justify-center p-6 animate-in fade-in run-in-10">
      <div className="text-center mb-12 space-y-4 max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* 動畫裝飾背景 */}
        <div className="absolute inset-0 bg-blue-500/10 opacity-30 animate-pulse pointer-events-none" />
        <h2 className="text-4xl font-black text-white italic tracking-widest uppercase flex items-center justify-center gap-3">
          <HelpCircle className="text-blue-500 animate-bounce" size={40} />
          {title}
        </h2>
        {subtitle && <p className="text-xl text-slate-400 font-bold">{subtitle}</p>}
      </div>

      <div className="relative w-96 h-96 my-8 shrink-0">
        {/* 指針：懸掛在轉盤頭頂 12 點鐘方向 */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div className="w-10 h-10 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] rounded-full border-4 border-slate-900 flex items-center justify-center relative z-20">
            <Crosshair size={20} className="text-slate-900" />
          </div>
          <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[30px] border-l-transparent border-r-transparent border-t-white -mt-2 drop-shadow-lg" />
        </div>

        {/* 轉盤本體 */}
        <div className="relative w-96 h-96 rounded-full p-2 bg-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-slate-700 overflow-hidden isolate">
          {/* Glassmorphism 光澤 */}
          <div className="absolute inset-0 rounded-full z-10 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          
          {/* 渲染環形 */}
          <div
            className="w-full h-full rounded-full transition-transform ease-[cubic-bezier(0.1,0.7,0.1,1)] will-change-transform"
            style={{
              background: `conic-gradient(${gradientString})`,
              transform: `rotate(${rotation}deg)`,
              transitionDuration: phase === 'pending' ? '0s' : `${DURATION}ms`,
            }}
          />
          
          {/* 內圈遮罩蓋板 (把它變成甜甜圈狀) */}
          <div className="absolute inset-0 m-auto w-40 h-40 bg-slate-900 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-8 border-slate-800 flex items-center justify-center z-10 transition-colors">
            {phase === 'done' ? (
              <div 
                className="w-full h-full rounded-full flex items-center justify-center font-black text-white text-2xl"
                style={{ backgroundColor: options[targetIndex].colorHex }}
              >
                {options[targetIndex].label}
              </div>
            ) : (
              <AlertTriangle className="text-slate-500 animate-pulse" size={40} />
            )}
          </div>
        </div>
      </div>

      {/* 色塊圖例說明 */}
      <div className="mt-8 flex gap-6 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="w-6 h-6 rounded-md shadow-sm border border-white/20"
              style={{ backgroundColor: opt.colorHex }}
            />
            <span className="text-lg font-bold text-slate-300">
              {opt.label} ({Math.round(opt.probability * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
