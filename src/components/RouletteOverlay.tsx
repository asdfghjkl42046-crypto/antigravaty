import React, { useEffect, useState, useRef } from 'react';
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

  const wheelRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const needleTriangleRef = useRef<HTMLDivElement>(null);

  const DURATION = 5500; // 轉盤轉動 5.5 秒，將最後殘酷的緩慢滑行期拉長
  const PAUSE = 2500; // 停格展示 2.5 秒，放大壓抑感

  // 使用 useState 確保隨機切割出來的不規則盤面只在掛載時計算一次，防止畫面抖動或重繪
  const [fragments] = useState(() => {
    const NUM_FRAGMENTS = 12; // 切割成 12 等分交錯
    const rawFragments: { optIndex: number; probability: number; colorHex: string }[] = [];

    // 1. 隨機不規則切割：讓每片碎片的大小不一，但總和絕對精確等於該選項的原生機率
    options.forEach((opt, idx) => {
      if (opt.probability > 0) {
        const randomWeights = Array.from({ length: NUM_FRAGMENTS }, () => Math.random() + 0.2);
        const weightSum = randomWeights.reduce((a, b) => a + b, 0);

        randomWeights.forEach((weight) => {
          rawFragments.push({
            optIndex: idx,
            probability: (weight / weightSum) * opt.probability,
            colorHex: opt.colorHex,
          });
        });
      }
    });

    // 2. 徹底打亂陣列順序 (Fisher-Yates Shuffle) 破除原本的紅綠紅白紅白等距交涉
    for (let i = rawFragments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawFragments[i], rawFragments[j]] = [rawFragments[j], rawFragments[i]];
    }

    // 3. 將亂序過後的不規則碎片鋪平為圓餅圖視角 (0度~360度)
    let currentRatio = 0;
    return rawFragments.map((frag) => {
      const startAngle = currentRatio * 360;
      currentRatio += frag.probability;
      const endAngle = currentRatio * 360;
      return {
        ...frag,
        startAngle,
        endAngle,
      };
    });
  });

  const gradientString = fragments
    .map((s) => `${s.colorHex} ${s.startAngle}deg ${s.endAngle}deg`)
    .join(', ');

  useEffect(() => {
    let animationFrameId: number;

    const updateCenter = () => {
      if (wheelRef.current && centerRef.current && centerTextRef.current) {
        const style = window.getComputedStyle(wheelRef.current);
        const matrix = style.transform;
        if (matrix !== 'none') {
          // matrix(a, b, c, d, tx, ty)
          const values = matrix.split('(')[1].split(')')[0].split(',');
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          let angle = Math.atan2(b, a) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          
          // 計算目前頂部 (12 點鐘方向) 指向的角度
          const pointedAngle = (360 - angle) % 360;
          
          let activeFrag = fragments.find(
            (f) => pointedAngle >= f.startAngle && pointedAngle <= f.endAngle
          );
          if (!activeFrag) activeFrag = fragments[0];

          if (activeFrag) {
            // 中心圓盤不變色，只讓頂部圓形指針變色
            if (needleRef.current && needleTriangleRef.current) {
              needleRef.current.style.backgroundColor = activeFrag.colorHex;
              // 添加對應顏色的光暈，增強極限感
              needleRef.current.style.boxShadow = `0 0 30px ${activeFrag.colorHex}`;
              needleTriangleRef.current.style.borderTopColor = activeFrag.colorHex;
            }

            const option = options[activeFrag.optIndex];
            if (option) {
              centerTextRef.current.textContent = option.label;
              centerTextRef.current.style.color = activeFrag.colorHex;
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(updateCenter);
    };

    if (phase === 'spinning' || phase === 'done') {
      updateCenter();
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase, fragments, options]);

  useEffect(() => {
    // 篩選出屬於本次 TargetIndex 的所有碎片
    const targetFragments = fragments.filter((f) => f.optIndex === targetIndex);
    if (targetFragments.length === 0) {
      console.error('Roulette: Invalid targetIndex or zero probability');
      onComplete();
      return;
    }

    // 實作 15% 機率觸發「Near-Miss (擦邊球)」演出效果
    const isNearMiss = Math.random() < 0.15;
    let finalAngleInSlice = 0;

    if (isNearMiss) {
      // 尋找與「非目標選項」相鄰的碎片邊界
      type Boundary = { angle: number; direction: 1 | -1; frag: typeof fragments[0] };
      const boundaries: Boundary[] = [];

      fragments.forEach((frag, idx) => {
        if (frag.optIndex === targetIndex) {
          const prevFrag = fragments[(idx - 1 + fragments.length) % fragments.length];
          const nextFrag = fragments[(idx + 1) % fragments.length];

          // 如果前一個碎片是別的選項，則此碎片的 startAngle 是一個可用的擦邊交界點 (往內縮 +1 度)
          if (prevFrag.optIndex !== targetIndex) {
            boundaries.push({ angle: frag.startAngle, direction: 1, frag });
          }
          // 如果後一個碎片是別的選項，則此碎片的 endAngle 是一個可用的擦邊交界點 (往內縮 -1 度)
          if (nextFrag.optIndex !== targetIndex) {
            boundaries.push({ angle: frag.endAngle, direction: -1, frag });
          }
        }
      });

      if (boundaries.length > 0) {
        // 隨機挑選一個交界點
        const chosenBoundary = boundaries[Math.floor(Math.random() * boundaries.length)];
        const range = chosenBoundary.frag.endAngle - chosenBoundary.frag.startAngle;
        // 刻意停在距離交界 0.5 ~ 1.5 度內，創造極限擦邊的錯覺。若碎片極小，確保最多不超過 40% 寬度以防穿透。
        let nearMissOffset = 0.5 + Math.random() * 1.0;
        nearMissOffset = Math.min(nearMissOffset, range * 0.4);
        finalAngleInSlice = chosenBoundary.angle + chosenBoundary.direction * nearMissOffset;
      } else {
        // 防呆防穿：如果運氣極差沒有異色交界點，退回正常邏輯
        const chosenFragment = targetFragments[Math.floor(Math.random() * targetFragments.length)];
        const range = chosenFragment.endAngle - chosenFragment.startAngle;
        finalAngleInSlice = chosenFragment.startAngle + range * (0.1 + Math.random() * 0.8);
      }
    } else {
      // 正常邏輯：85% 隨機落在該扇形區域的 10% ~ 90% 區間內
      const chosenFragment = targetFragments[Math.floor(Math.random() * targetFragments.length)];
      const range = chosenFragment.endAngle - chosenFragment.startAngle;
      finalAngleInSlice = chosenFragment.startAngle + range * (0.1 + Math.random() * 0.8);
    }

    // 指針固定在正上方 (0deg/360deg)。
    // 目標角度隨機值必須轉到正上方 -> 轉盤需要被"倒轉"回 finalAngleInSlice。
    // 再加上更加猛烈的 8 圈 (2880度) 視覺衝擊讓小碎片飛速閃動。
    const targetRotation = 360 * 8 - finalAngleInSlice;

    // 稍微延遲一下，讓 UI 彈出的動畫做完再開始轉
    const startTimer = setTimeout(() => {
      setPhase('spinning');
      setRotation(targetRotation);
    }, 100);

    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, DURATION + 200);

    const exitTimer = setTimeout(
      () => {
        onComplete();
      },
      DURATION + 200 + PAUSE
    );

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
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
          <div 
            ref={needleRef}
            className="w-20 h-20 bg-white shadow-[0_0_30px_rgba(255,255,255,1)] border-4 border-slate-900 rounded-full flex items-center justify-center relative z-20"
          >
            {/* 已移除十字標籤，成為純粹的顏色指示燈 */}
          </div>
          <div 
            ref={needleTriangleRef}
            className="w-0 h-0 border-l-[24px] border-r-[24px] border-t-[40px] border-l-transparent border-r-transparent border-t-white -mt-2 drop-shadow-[0_4px_10px_rgba(255,255,255,0.8)]" 
          />
        </div>

        {/* 轉盤本體 */}
        <div className="relative w-full h-full rounded-full p-2 bg-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-slate-700 overflow-hidden isolate">
          {/* Glassmorphism 光澤 */}
          <div className="absolute inset-0 rounded-full z-10 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

          {/* 渲染環形 */}
          <div
            ref={(el) => {
              wheelRef.current = el;
              if (el) {
                el.style.background = `conic-gradient(${gradientString})`;
                el.style.transform = `rotate(${rotation}deg)`;
                el.style.transitionDuration = phase === 'pending' ? '0s' : `${DURATION}ms`;
              }
            }}
            className="w-full h-full rounded-full transition-transform ease-[cubic-bezier(0.05,0.5,0.01,1)] will-change-transform"
          />

          {/* 內圈遮罩蓋板 (把它變成甜甜圈狀)，並綁定動態變色 Ref */}
          <div 
            ref={centerRef}
            className={cn(
              "absolute inset-0 m-auto w-40 h-40 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-8 border-slate-800 flex items-center justify-center z-10 transition-colors duration-75 bg-slate-900"
            )}
          >
            {phase === 'pending' ? (
              <AlertTriangle className="text-slate-500 animate-pulse" size={40} />
            ) : (
              <div
                ref={centerTextRef}
                className="w-full h-full rounded-full flex flex-col items-center justify-center font-black text-white text-3xl text-center px-4 leading-[1.2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {/* 文字將由 requestAnimationFrame 動態注入 */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 色塊圖例說明 */}
      <div className="mt-8 flex gap-6 bg-slate-900/50 p-4 rounded-2xl border border-white/5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              ref={(el) => {
                if (el) el.style.backgroundColor = opt.colorHex;
              }}
              className="w-6 h-6 rounded-md shadow-sm border border-white/20"
            />
            <span className="text-lg font-bold text-slate-300 flex items-center justify-between min-w-[120px]">
              <span>{opt.label}</span>
              {/* 故意隱藏機率，增加未知與無法掌控的壓抑感 */}
              <span className="text-slate-700 text-sm font-normal ml-2">???</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
