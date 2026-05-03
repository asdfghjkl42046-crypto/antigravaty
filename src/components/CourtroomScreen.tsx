'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { gsap } from 'gsap';
import { ChevronRight, ChevronLeft, RotateCcw, Scale, ShieldCheck } from 'lucide-react';
import IndictmentBook from './IndictmentBook';
import { LawCase, Player } from '../types/game';
import { calculateSpectatorInfluence } from '../engine/MechanicsEngine';
import {
  getLawyerDefenseBonus,
  getRoleLevel,
  getExtraAppealCost,
  getWithdrawCaseCost,
} from '../engine/RoleEngine';
import { formatValue } from '../engine/MathEngine';
import { SYSTEM_STRINGS } from '../data/SystemStrings';

/**
 * CourtroomScreen - 沉浸式法庭介面
 *
 * 核心規範：
 * 1. 無滾輪設計：所有長篇文案皆透過 3D 翻頁組件展示。
 * 2. 神祕剪影：法官以黑色剪影呈現。
 * 3. 網站模式優先：僅支援單一法官風格。
 */

// ----------------------------------------------------------------------
// 法庭子組件
// ----------------------------------------------------------------------

/**
 * LoopingVideo - 受控影片組件，支援片段循環播放
 */
const LoopingVideo: React.FC<{
  src: string;
  startTime: number;
  endTime: number;
  className?: string;
}> = ({ src, startTime, endTime, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 當影片進度更新時檢查是否超出範圍
    const handleTimeUpdate = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
      }
    };

    // 確保一開始就跳到起始點
    const handleLoadedMetadata = () => {
      video.currentTime = startTime;
      video.play().catch(() => {
        /* 處理自動播放限制 */
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [startTime, endTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      className={className}
      // 額外保險：如果影片因為任何原因結束，跳回起點
      onEnded={(e) => {
        e.currentTarget.currentTime = startTime;
        e.currentTarget.play();
      }}
    />
  );
};

/**
 * DefenseCarousel - 真·3D 無限圓周動態選擇器
 */
const DefenseCarousel: React.FC<{
  lawCase: LawCase;
  onSelect: (id: 'J' | 'K' | 'L', text: string) => void;
}> = ({ lawCase, onSelect }) => {
  // 旋轉狀態 (以角度為單位)
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const rotationRef = useRef(0); // 確保 GSAP 補間時能即時讀取
  const startX = useRef(0);
  const startRotation = useRef(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isInitialized = useRef(false);
  const snapTweenRef = useRef<gsap.core.Tween | null>(null); // 用於儲存對齊動畫
  const dragTotalDist = useRef(0); // 追蹤單次操作的累計位移

  const options = useMemo(
    () => [
      { id: 'J' as const, text: lawCase.defense_j_text || '', angle: 0, key: 'J1' },
      { id: 'K' as const, text: lawCase.defense_k_text || '', angle: 60, key: 'K1' },
      { id: 'L' as const, text: lawCase.defense_l_text || '', angle: 120, key: 'L1' },
      { id: 'J' as const, text: lawCase.defense_j_text || '', angle: 180, key: 'J2' },
      { id: 'K' as const, text: lawCase.defense_k_text || '', angle: 240, key: 'K2' },
      { id: 'L' as const, text: lawCase.defense_l_text || '', angle: 300, key: 'L2' },
    ],
    [lawCase]
  );

  // 更新卡牌位置 (真 3D 圓柱座標)
  const updatePositions = useCallback(
    (rot: number, speed: number = 0.6) => {
      options.forEach((opt, i) => {
        const card = cardsRef.current[i];
        if (!card) return;

        const totalAngle = opt.angle + rot;
        const theta = totalAngle * (Math.PI / 180);

        const radius = 290;
        const x = Math.sin(theta) * radius;
        const z = Math.cos(theta) * radius - radius - 100;

        // 3D 位置計算
        gsap.to(card, {
          x: x,
          z: z,
          rotateY: totalAngle,
          zIndex: Math.round(z + 2000),
          duration: speed, // 使用動態速度
          ease: speed === 0 ? 'none' : 'power3.out',
          overwrite: 'auto',
        });
      });
    },
    [options]
  );

  useEffect(() => {
    // 拖曳中直接設為 0 实现 1:1 絕對跟手，對齊時用 0.3s 展現俐落感
    updatePositions(rotation, isDragging ? 0 : 0.3);
    rotationRef.current = rotation;
  }, [rotation, isDragging, updatePositions]);

  // 手勢處理
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    // 立即殺死所有正在進行的對齊動畫，將主控權還給手指
    if (snapTweenRef.current) {
      snapTweenRef.current.kill();
      snapTweenRef.current = null;
    }
    setIsDragging(true);
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startRotation.current = rotationRef.current;
    dragTotalDist.current = 0; // 重置位移紀錄
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = currentX - startX.current;
    // 累計位移，用於判定是拖曳還是點擊
    dragTotalDist.current = Math.max(dragTotalDist.current, Math.abs(delta));

    // 靈敏度下調至 0.3，避免過於輕飄，操作更精準
    const nextRot = startRotation.current + delta * 0.3;
    setRotation(nextRot);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // 改為 60 度對齊
    const nearestSnap = Math.round(rotationRef.current / 60) * 60;
    const obj = { val: rotationRef.current };

    // 紀錄並執行對齊動畫
    snapTweenRef.current = gsap.to(obj, {
      val: nearestSnap,
      duration: 0.3, // 縮短對齊時間
      ease: 'power3.out', // 改為更俐落的緩動
      onUpdate: () => setRotation(obj.val),
      onComplete: () => {
        snapTweenRef.current = null;
      },
    });
  };

  // 判斷當前正面的索引 (0~5)
  const activeIndex = useMemo(() => {
    const snapRot = Math.round(rotation / 60) * 60;
    const normalizedSnap = ((-snapRot % 360) + 360) % 360;
    const index = Math.round(normalizedSnap / 60) % 6;
    return index;
  }, [rotation]);

  // 獲取當前正式的 ID
  const activeId = options[activeIndex]?.id || 'J';

  return (
    <div className="relative w-full h-[500px] flex flex-col items-center justify-center select-none overflow-visible [perspective:5000px]">
      <div
        className="relative w-full h-full flex items-center justify-center transform-style-3d cursor-grab active:cursor-grabbing carousel-container-tilt translate-y-12"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {options.map((opt, i) => {
          // 根據即時旋轉角度判斷此卡是否正面朝向觀眾
          const totalAngle = opt.angle + rotation;
          const normalizedAngle = ((totalAngle % 360) + 360) % 360;
          const isFrontVisible = normalizedAngle < 87.8 || normalizedAngle > 272.2;

          return (
            <div
              key={opt.key}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="absolute w-64 h-[440px] select-none transform-style-3d"
            >
              {/* ===== 正面：文字卡 ===== */}
              <div className="absolute inset-0 bg-[#0a0f1e] border-2 border-cyan-500/60 ring-1 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-xl p-5 flex flex-col justify-between backface-hidden">
                {/* 左上角紅色懸掛圓標 (123123) - 增加 translateZ 使其真實懸浮 */}
                <div className="absolute top-[-2px] left-[-2px] w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-800 border border-white/40 shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center z-[200] [transform:translateZ(50px)]">
                  <span className="text-white font-black text-lg italic translate-x-[-2px]">
                    {opt.id === 'J' ? '1' : opt.id === 'K' ? '2' : '3'}
                  </span>
                </div>
                {/* 文字內容 */}
                <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 pt-2 text-left">
                  <div className="text-slate-200 text-sm leading-relaxed font-serif tracking-tight">
                    {opt.text
                      .replace(/([。！？]」?)/g, '$1\n')
                      .split('\n')
                      .map((segment, idx) => {
                        const trimmed = segment.trim();
                        if (!trimmed) return null;
                        return (
                          <div
                            key={idx}
                            className={`mb-2 last:mb-0 ${trimmed.startsWith('「') ? '' : 'indent-[2em]'}`}
                          >
                            {trimmed}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* 裝飾線條 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800" />
              </div>
              {/* ===== 背面：影片卡 ===== */}
              <div className="absolute inset-0 bg-[#0a0e1a] border-2 border-cyan-500/60 ring-1 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] rounded-xl overflow-hidden backface-hidden [transform:rotateY(180deg)]">
                {/* 使用 LoopingVideo 限制播放區間為 1s ~ 8s */}
                <LoopingVideo
                  src="/assets/logo2_anim.mp4"
                  startTime={1}
                  endTime={8}
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.9]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 圓周動態提示 */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex gap-3 items-center">
          {options.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-cyan-400 scale-150 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-slate-800'}`}
            />
          ))}
        </div>
      </div>

      {/* ===== 核心修正：2D 靜態點擊層 (完全脫離 3D 矩陣，解決 iOS 無法點擊的問題) ===== */}
      <div className="absolute bottom-18 left-1/2 -translate-x-1/2 z-[1000] w-48 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const activeOpt = options[activeIndex];
            if (activeOpt) onSelect(activeOpt.id, activeOpt.text);
          }}
          className="w-full py-3 bg-gradient-to-b from-blue-400 to-blue-800 text-white font-black uppercase tracking-widest text-xs border-2 border-blue-400 ring-1 ring-blue-500 shadow-[0_10px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(37,99,235,0.4)] hover:brightness-125 active:scale-95 transition-all cursor-pointer rounded-lg"
        >
          確認選擇
        </button>
      </div>
    </div>
  );
};

export default function CourtroomScreen() {
  const {
    trial,
    players,
    setTrialStage,
    nextBystander,
    addIntervention,
    placeBet,
    submitDefense,
    resolveTrial,
    extraordinaryAppeal,
    withdrawCase,
  } = useGameStore();

  const [showAttorneySkill, setShowAttorneySkill] = useState(false); // 移動到最頂部，不受 Early Return 影響
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const judgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用 Promise 延遲狀態更新，避免 Next.js/React 中的同步渲染警告
    Promise.resolve().then(() => setMounted(true));
    // 法官剪影呼吸效果
    if (judgeRef.current) {
      gsap.to(judgeRef.current, {
        scale: 1.02,
        opacity: 0.95,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, []);

  if (!mounted || !trial) return null;

  const defendant = players.find((p) => p.id === trial.defendantId);
  const actingBystander = trial.bystanderIds[trial.actingBystanderIndex]
    ? players.find((p) => p.id === trial.bystanderIds[trial.actingBystanderIndex])
    : null;

  // --- 各階段渲染邏輯 ---

  const renderIndictment = () => {
    // 將起訴文案拆分為分頁陣列
    const rawText = `${trial.narrative}\n\n${trial.question}`;
    const indictmentPages = rawText.split('\n').filter((l) => l.trim().length > 0);

    return (
      <div className="h-full">
        <IndictmentBook
          caseTitle={SYSTEM_STRINGS.COURT.DOCUMENTS.INDICTMENT}
          pages={indictmentPages}
          onClose={() => setTrialStage(2)}
        />
      </div>
    );
  };

  // Stage 2: 旁聽干預
  const renderIntervention = () => {
    if (!actingBystander) return null;
    return (
      <div className="h-full flex flex-col">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-black text-blue-400 uppercase tracking-widest italic">
            {SYSTEM_STRINGS.COURT.LABELS.INTERVENTION_BY}{actingBystander.name}
          </h2>
        </div>

        <div className="flex-grow flex flex-col justify-center gap-6">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => {
                addIntervention(actingBystander.id, 'SUPPORT');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="group relative overflow-hidden p-6 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/20 active:scale-95 transition-all flex justify-between items-center"
            >
              <span className="text-2xl font-black text-blue-400">{SYSTEM_STRINGS.COURT.ACTIONS.SUPPORT}</span>
              <span className="text-xl font-mono text-blue-400 opacity-50">+10%</span>
            </button>

            <button
              onClick={() => {
                addIntervention(actingBystander.id, 'OPPOSE');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="group relative overflow-hidden p-6 border border-red-500/30 bg-red-500/5 hover:bg-red-500/20 active:scale-95 transition-all flex justify-between items-center"
            >
              <span className="text-2xl font-black text-red-400">{SYSTEM_STRINGS.COURT.ACTIONS.OPPOSE}</span>
              <span className="text-xl font-mono text-red-400 opacity-50">-10%</span>
            </button>

            <button
              onClick={() => {
                addIntervention(actingBystander.id, 'ABSTAIN');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(3);
                }
              }}
              className="py-6 border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all text-slate-500 font-bold uppercase tracking-widest text-sm"
            >
              {SYSTEM_STRINGS.COURT.ACTIONS.ABSTAIN}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stage 3: 場外賭局
  const renderBetting = () => {
    if (!actingBystander) return null;

    // 計算當前勝率
    const defendantPlayer = players.find((p) => p.id === trial.defendantId);
    const hasLawyerLv2 = defendantPlayer ? getRoleLevel(defendantPlayer, 'lawyer') >= 2 : false;

    const baseRate = trial.lawCase.survival_rate || 0;
    const influence = calculateSpectatorInfluence(trial.interventions, hasLawyerLv2);
    const bonus = defendantPlayer ? getLawyerDefenseBonus(defendantPlayer) : 0;
    const totalRate = Math.max(0, Math.min(1, baseRate + influence + bonus));

    // 檢查查看權限：當前旁觀者是否有王牌律師 LV2，或者被告本人具備 LV2 實力開放情報分享
    const canSeeRate =
      (actingBystander && getRoleLevel(actingBystander, 'lawyer') >= 2) || hasLawyerLv2;

    return (
      <div className="h-full flex flex-col">
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-xl font-black text-green-400 font-mono tracking-widest italic">
            {SYSTEM_STRINGS.COURT.LABELS.BETTING_BY}{actingBystander.name}
          </h2>
        </div>

        <div className="flex-grow flex flex-col justify-center gap-8">
          <div className="bg-slate-900 border-y border-slate-800 py-10 px-4 text-center relative overflow-hidden">
            <div
              className={`text-6xl font-black text-white glow-blue transition-all duration-500 ${!canSeeRate ? 'blur-md opacity-40' : ''}`}
            >
              {canSeeRate ? `${(totalRate * 100).toFixed(0)}%` : '??%'}
            </div>
            {!canSeeRate && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-sm px-4 py-2 border border-slate-700 rounded text-xs text-slate-400 font-bold tracking-widest uppercase">
                  {SYSTEM_STRINGS.COURT.LABELS.NEED_ACE_LAWYER}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                placeBet(actingBystander.id, 'win');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="flex flex-col items-center justify-center gap-3 p-8 border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 active:scale-95 transition-all"
            >
              <span className="font-black text-xl text-green-400">{SYSTEM_STRINGS.COURT.ACTIONS.WIN}</span>
            </button>

            <button
              onClick={() => {
                placeBet(actingBystander.id, 'lose');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="flex flex-col items-center justify-center gap-3 p-8 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <span className="font-black text-xl text-red-400">{SYSTEM_STRINGS.COURT.ACTIONS.LOSE}</span>
            </button>

            <button
              onClick={() => {
                placeBet(actingBystander.id, 'none');
                if (trial.actingBystanderIndex < trial.bystanderIds.length - 1) {
                  nextBystander();
                } else {
                  setTrialStage(4);
                }
              }}
              className="col-span-2 py-4 border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all text-slate-500 font-bold uppercase tracking-widest text-xs"
            >
              {SYSTEM_STRINGS.COURT.ACTIONS.SKIP}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stage 4: 被告辯護
  const renderDefense = () => {
    if (!defendant) return null;
    const hasLawyerLv2 = getRoleLevel(defendant, 'lawyer') >= 2;

    // 計算當前勝率（基礎 + 旁觀者 + 律師 LV1 加成）
    const baseRate = trial.lawCase.survival_rate || 0;
    const influence = calculateSpectatorInfluence(trial.interventions, hasLawyerLv2);
    const bonus = getLawyerDefenseBonus(defendant);
    const totalRate = Math.max(0, Math.min(1, baseRate + influence + bonus));

    return (
      <div className="h-full flex flex-col relative pt-4">
        <div className="absolute top-[-30] left-5 border-l-4 border-cyan-500 pl-4 z-[20]">
          <h2 className="text-2xl font-black text-white uppercase tracking-[0.15em] italic text-noir-glow">
            {SYSTEM_STRINGS.COURT.LABELS.DEFENSE_BY}{defendant.name}
          </h2>
        </div>

        {/* 王牌律師 LV2 特權：答辯時可即時查看當前機率 */}
        {hasLawyerLv2 && (
          <div className="absolute top-0 right-5 flex flex-col items-end z-[20] animate-in fade-in slide-in-from-right duration-1000">
            <div className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase mb-1 opacity-70">
              {SYSTEM_STRINGS.COURT.LABELS.WIN_RATE_INFO}
            </div>
            <div className="text-3xl font-black text-white font-mono drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              {(totalRate * 100).toFixed(0)}%
            </div>
          </div>
        )}

        <div className="flex-grow flex items-center justify-center pt-2">
          <DefenseCarousel
            lawCase={trial.lawCase}
            onSelect={(id, text) => {
              const idMap: Record<string, number> = { J: 0, K: 1, L: 2 };
              submitDefense(idMap[id], text);
            }}
          />
        </div>
      </div>
    );
  };

  // Stage 6: 庭審裁決 (Verdict)
  const renderVerdict = () => {
    const isWin = trial.isDefenseSuccess;

    // 獲取辯護結果對應的文案
    let webJudgment = '';
    let eduText = '';
    if (trial.chosenDefenseLabel === `${SYSTEM_STRINGS.COURT.LABELS.SCHEME_PREFIX}J`) {
      webJudgment = trial.lawCase.web_judgment_j || '';
      eduText = trial.lawCase.edu_j || '';
    } else if (trial.chosenDefenseLabel === `${SYSTEM_STRINGS.COURT.LABELS.SCHEME_PREFIX}K`) {
      webJudgment = trial.lawCase.web_judgment_k || '';
      eduText = trial.lawCase.edu_k || '';
    } else if (trial.chosenDefenseLabel === `${SYSTEM_STRINGS.COURT.LABELS.SCHEME_PREFIX}L`) {
      webJudgment = trial.lawCase.web_judgment_l || '';
      eduText = trial.lawCase.edu_l || '';
    }

    const mainText = webJudgment || trial.judgment || '';
    const fullText = `${mainText}${eduText ? `\n\n${SYSTEM_STRINGS.COURT.DOCUMENTS.EDU_TITLE}\n${eduText}` : ''}${!isWin && trial.punishmentDetail ? `\n\n${SYSTEM_STRINGS.COURT.DOCUMENTS.PUNISH_TITLE}\n${trial.punishmentDetail}` : ''}`;

    const showActionBtn = isWin || showAttorneySkill;
    const skillCost = defendant ? getWithdrawCaseCost(defendant) : { g: 0, ip: 0 };

    return (
      <div className="h-full flex flex-col justify-center items-center">
        {/* 權威標題區塊 */}
        <div
          className={`mb-12 flex items-center justify-center gap-4 py-8 border-y w-full max-w-4xl ${isWin ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}
        >
          <h2
            className={`text-5xl font-black italic tracking-[0.3em] ${isWin ? 'text-green-400' : 'text-red-400'}`}
          >
            {isWin ? SYSTEM_STRINGS.COURT.VERDICT.WIN : SYSTEM_STRINGS.COURT.VERDICT.LOSE}
          </h2>
        </div>

        <div className="w-full max-w-4xl h-[500px] relative">
          {showActionBtn ? (
            /* 核心行動區域：3D 按鈕、放棄按鈕與提示文字垂直對齊 */
            <div className="flex flex-col items-center gap-12 animate-in zoom-in duration-500 w-full">
              <div className="flex flex-col items-center w-full">
                <div className="relative flex justify-center items-center">
                  {/* 紅色 3D 按鈕 */}
                  <button
                    onClick={() => {
                      if (showAttorneySkill) {
                        if (
                          window.confirm(
                            SYSTEM_STRINGS.COURT.ALERTS.ACE_SKILL_PROMPT(
                              formatValue(skillCost.g, SYSTEM_STRINGS.UNITS.MONEY),
                              skillCost.ip
                            )
                          )
                        ) {
                          withdrawCase();
                          setShowAttorneySkill(false);
                        }
                      } else {
                        resolveTrial();
                      }
                    }}
                    className="group relative w-48 h-48 rounded-full transition-all duration-200 active:translate-y-2 select-none"
                  >
                    <div className="absolute inset-x-0 bottom-[-16px] h-48 rounded-full bg-red-900 shadow-[0_15px_40px_rgba(0,0,0,0.6)]" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-b-[10px] border-red-800 flex items-center justify-center group-hover:from-red-400 group-hover:to-red-600 shadow-inner overflow-hidden transition-all duration-300">
                      <span className="text-white font-black text-2xl tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] italic text-center leading-tight whitespace-pre-line group-hover:scale-110 transition-transform">
                        {showAttorneySkill ? SYSTEM_STRINGS.COURT.ACTIONS.REVERSE : SYSTEM_STRINGS.COURT.ACTIONS.EXIT}
                      </span>
                      <div className="absolute top-2 left-1/4 w-1/2 h-1/4 bg-white/20 rounded-full blur-md" />
                    </div>
                  </button>
                </div>

                {/* 放棄逆轉按鈕 (置中對齊) */}
                {showAttorneySkill && (
                  <button
                    onClick={() => {
                      if (window.confirm(SYSTEM_STRINGS.COURT.ALERTS.GIVE_UP_PROMPT)) {
                        resolveTrial();
                        setShowAttorneySkill(false);
                      }
                    }}
                    className="mt-12 px-6 py-2 border border-slate-700 hover:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-xs rounded transition-all active:scale-95"
                  >
                    {SYSTEM_STRINGS.COURT.ACTIONS.GIVE_UP_REVERSE}
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center gap-3 mt-4 animate-pulse">
                <div className="text-red-500 font-black tracking-[0.4em] text-xl uppercase italic">
                  {showAttorneySkill ? SYSTEM_STRINGS.COURT.ALERTS.REVERSE_HINT : SYSTEM_STRINGS.COURT.ALERTS.EXIT_HINT}
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/40" />
                  <div className="w-12 h-px bg-red-500/20 my-auto" />
                  <div className="w-2 h-2 rounded-full bg-red-500/40" />
                </div>
              </div>
            </div>
          ) : (
            /* 有罪階段：顯示判決書 (向上微調位置) */
            <div className="w-full h-full mt-[-80px]">
              {!showAttorneySkill && (
                <IndictmentBook
                  caseTitle={SYSTEM_STRINGS.COURT.DOCUMENTS.VERDICT}
                  pages={(() => {
                    const pages: string[] = [];
                    const lines = fullText
                      .split('\n')
                      .map((l) => l.trim())
                      .filter((l) => l.length > 0);
                    let currentP = '';
                    lines.forEach((line) => {
                      if (line.includes(SYSTEM_STRINGS.COURT.DOCUMENTS.EDU_TITLE) || line.includes(SYSTEM_STRINGS.COURT.DOCUMENTS.PUNISH_TITLE)) {
                        if (currentP.length > 0) pages.push(currentP);
                        currentP = line + '\n';
                      } else {
                        currentP += line + '\n';
                        if (currentP.length > 200) {
                          pages.push(currentP);
                          currentP = '';
                        }
                      }
                    });
                    if (currentP.length > 0) pages.push(currentP);
                    return pages;
                  })()}
                  onClose={() => resolveTrial()}
                  onAppeal={() => extraordinaryAppeal()}
                  onCountdownEnd={() => {
                    const isAceAttorney = defendant?.roles?.lawyer === 3;
                    if (isAceAttorney && !isWin) {
                      setShowAttorneySkill(true);
                    } else {
                      resolveTrial();
                    }
                  }}
                  canAppeal={!isWin && defendant !== undefined && !defendant.hasUsedExtraAppeal}
                  isAceAttorney={!isWin && defendant?.roles?.lawyer === 3}
                  countdownSeconds={(!isWin && !defendant?.hasUsedExtraAppeal) ? 3 : 0.5}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染當前階段
  const renderContent = () => {
    switch (trial.stage) {
      case 1:
        return renderIndictment();
      case 2:
        return renderIntervention();
      case 3:
        return renderBetting();
      case 4:
        return renderDefense();
      case 6:
        return renderVerdict();
      // 階段 5 (律師) 與 7 (上訴) 通常在 store 內部處理邏輯進度
      default:
        return renderIndictment();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 bg-[#020617] text-white flex flex-col z-50 overflow-hidden"
    >
      {/* 頂部進度條 */}
      <div className="flex h-1 gap-px bg-slate-800">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div
            key={s}
            className={`flex-1 transition-all duration-700 ${trial.stage >= s ? 'bg-cyan-500' : 'bg-transparent'}`}
          />
        ))}
      </div>

      {/* 法庭背景元件 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 法官剪影 */}
        <div
          ref={judgeRef}
          className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 brightness-0 opacity-80 bg-[url('https://www.svgrepo.com/show/440590/judge.svg')] bg-contain bg-center bg-no-repeat drop-shadow-[0_0_40px_rgba(6,182,212,0.2)]"
        />

        {/* 底部煙霧/暗角 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
      </div>

      {/* 內容區域 */}
      <div className="relative z-10 flex-grow pt-32 px-6 pb-24">{renderContent()}</div>

      {/* 背景雜訊效果 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dust.png')]" />
    </div>
  );
}
