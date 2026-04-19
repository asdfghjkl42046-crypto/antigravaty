'use client';

import React, { useEffect, useRef } from 'react';
import StoreScreen from './StoreScreen';
import ScanScreen from './ScanScreen';
import {
  Home,
  ShoppingBag,
  History,
  Zap,
  Banknote,
  Network,
  Star,
  AlertTriangle,
  ChevronDown,
  Scan,
  Gift,
  Check,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useGameStore, MASTERPIECES } from '@/store/gameStore';
import { JUDGE_LABELS } from '@/data/judges/JudgeTemplatesDB';
import { getTotalBlackMaterials } from '@/engine/PlayerEngine';
import gsap from 'gsap';
import DebugPanel from './DebugPanel';

interface DashboardScreenProps {
  onEndTurn: () => void;
  onReset: () => void;
}

function StatDisc({ label, value, subValue, colorClass, onClick, hasArrow, isLabelWhite }: any) {
  // 使用映射表確保所有顏色都能被 Tailwind 靜態掃描編譯
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
  };

  const haloMap: Record<string, string> = {
    emerald: 'bg-emerald-400',
    blue: 'bg-blue-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400',
    orange: 'bg-orange-400',
  };

  const baseColorKey = colorClass.split('-')[1];
  const glowBg = colorMap[baseColorKey] || 'bg-slate-500';
  const haloBg = haloMap[baseColorKey] || 'bg-slate-400';

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center flex-1 transition-all ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
    >
      <div
        className={`w-[60px] h-[60px] rounded-full bg-slate-950 border border-white/10 flex flex-col items-center justify-center shadow-[inset_0_2px_12px_rgba(0,0,0,0.8),0_0_15px_rgba(0,0,0,0.3)] group relative overflow-visible`}
      >
        {/* 背景裝飾：強化的分類色螢光感 (使用映射後的完整類名) */}
        <div className={`absolute inset-1 rounded-full opacity-35 ${glowBg} blur-[4px]`} />
        <div className={`absolute -inset-1 rounded-full opacity-15 ${haloBg} blur-[10px]`} />

        {/* 分類標籤 */}
        <span className="text-[10px] font-black uppercase tracking-tighter z-10 text-white/95 filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.6)]">
          {label}
        </span>

        <div className="flex flex-col items-center z-10 -mt-0.5">
          <div className="flex items-center space-x-0.5">
            <span
              className={`text-sm font-black ${colorClass} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]`}
            >
              {value}
            </span>
            {hasArrow && (
              <ChevronDown className={`w-2 h-2 ml-0.5 ${colorClass} animate-bounce-subtle`} />
            )}
          </div>

          {/* 海外資金預留插槽 */}
          {subValue && (
            <span className="text-[6px] font-bold text-blue-300/90 -mt-0.5 flex items-center bg-blue-500/20 px-1 rounded-sm border border-blue-400/30">
              <span className="mr-0.5 scale-75">🌐</span>
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 玩家卡片組件
 */
export function PlayerCard({ player, isActive, onShowTags }: any) {
  const bmCount = getTotalBlackMaterials(player);

  return (
    <div
      className={`dashboard-animate relative p-4 py-3 rounded-[28px] border-2 backdrop-blur-xl transition-all duration-500 overflow-visible
      ${isActive
          ? 'border-amber-400 bg-[#1a1205]/95 shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
          : 'border-white/25 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
      }
    `}
    >
      {/* 獨立呼吸發光層 */}
      {isActive && (
        <div className="absolute inset-0 rounded-[28px] border-[3px] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-[pulse_1.2s_ease-in-out_infinite] pointer-events-none z-0" />
      )}

      {/* 裝飾發光背景層 */}
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at:50%_-20%,rgba(120,53,15,0.15),transparent)] pointer-events-none rounded-[26px]" />
      )}

      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-full border-2 overflow-hidden shadow-md transition-all duration-700 relative z-10
              ${isActive ? 'border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105' : 'border-white/10'}
            `}
            >
              <img
                src={MASTERPIECES[player.avatarId]?.url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.name}`}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div>
            <h2
              className={`text-lg font-black tracking-tight transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}
            >
              {player.name}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-white/70 uppercase mr-1 tracking-widest">
            行動力
          </span>
          <span className="text-lg font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]">
            {player.ap}
            <span className="text-xs text-white/30 ml-0.5">/5</span>
          </span>
        </div>
      </div>

      {/* 數值圓盤 */}
      <div className="flex items-center justify-between space-x-1.5 mb-2 relative z-10">
        <StatDisc
          label="資金"
          value={`${player.g}萬`}
          subValue={player.trustFund > 0 ? `${player.trustFund}萬` : null}
          colorClass="text-emerald-400"
        />
        <StatDisc label="人脈" value={player.ip} colorClass="text-blue-400" />
        <StatDisc label="名聲" value={player.rp} colorClass="text-yellow-400" />
        <StatDisc label="黑料" value={bmCount} colorClass="text-red-400" />
        <StatDisc
          label="前科"
          value={player.tags.length}
          isLabelWhite={true}
          colorClass="text-orange-500"
          hasArrow={true}
          onClick={onShowTags}
        />
      </div>
    </div>
  );
}

export default function DashboardScreen({ onEndTurn, onReset }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = React.useState<'home' | 'shop' | 'scan'>('home');

  const {
    players,
    turn,
    currentPlayerIndex,
    judgePersonality,
    startNotifications,
    clearStartNotifications,
  } = useGameStore();

  const [showBonusModal, setShowBonusModal] = React.useState(startNotifications.length > 0);
  const [currentBonusIdx, setCurrentBonusIdx] = React.useState(0);
  
  // 前科彈窗狀態
  const [tagViewPlayerIdx, setTagViewPlayerIdx] = React.useState<number | null>(null);
  const [tagViewItemIdx, setTagViewItemIdx] = React.useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const logoVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 安全地啟動 Logo 影片播放
    if (logoVideoRef.current) {
      logoVideoRef.current.play().catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Video play error:', err);
        }
      });
    }

    gsap.fromTo(
      '.dashboard-animate',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
    );
  }, []);

  const judgeInfo = judgePersonality ? JUDGE_LABELS[judgePersonality] : null;

  // 處理前科資料聚合
  const getAggregatedTags = (playerIdx: number | null) => {
    if (playerIdx === null || !players[playerIdx]) return [];
    const player = players[playerIdx];
    const tagCounts = player.tags.reduce((acc: Record<string, number>, t: any) => {
      acc[t.text] = (acc[t.text] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(tagCounts).map(([text, count]) => ({ text, count }));
  };

  const currentViewTags = getAggregatedTags(tagViewPlayerIdx);
  const hasMultipleTags = currentViewTags.length > 1;

  return (
    <div className="w-full h-full flex flex-col bg-[#020617] text-white overflow-hidden relative font-sans">
      <DebugPanel />
      
      {/* 1. Header: 狀態列 */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 dashboard-animate">
        <div className="flex items-center space-x-3">
          <button
            onClick={onReset}
            className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-slate-800 transition-all hover:border-blue-500/50 group"
            title="返回模式選擇"
            aria-label="Back to Mode Select"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] overflow-hidden">
            <video
              ref={logoVideoRef}
              src="/assets/logo_anim.mp4"
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-90 scale-125"
            />
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 tracking-widest leading-none mb-1">
              第 {String(turn).padStart(2, '0')}/50 輪
            </p>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              創業冒險
            </h1>
          </div>
        </div>

        {judgeInfo && (
          <div className="text-right">
            <p className="text-[8px] font-bold text-amber-500/80 uppercase tracking-tighter leading-none mb-1.5">
              當前法官
            </p>
            <p className="text-sm font-black text-amber-400 tracking-tight filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
              {judgeInfo.judgeName}
            </p>
          </div>
        )}
      </div>

      {/* 開局加成彈窗 (逐一顯示模式) */}
      {showBonusModal && startNotifications.length > 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border-2 border-amber-600/40 rounded-[40px] p-8 shadow-[0_0_50px_rgba(180,83,9,0.3)] flex flex-col items-center">
            {/* 裝飾發光背景 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(180,83,9,0.2),transparent_70%)] rounded-[38px] pointer-events-none" />

            {/* 右上角進度顯示 */}
            <div className="absolute top-8 right-10 text-amber-500/40 text-[10px] font-black tracking-widest">
              {currentBonusIdx + 1} / {startNotifications.length}
            </div>

            {/* 頂部禮物圖示 */}
            <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(245,158,11,0.4)] rotate-3">
              <Gift className="w-10 h-10 text-black fill-black/10" strokeWidth={2.5} />
            </div>

            <h2 className="text-2xl font-black text-white mb-8 tracking-wider drop-shadow-sm">
              獲得開局加成！
            </h2>

            {/* 加成項目 (單一顯示) */}
            <div className="w-full mb-10 min-h-[100px] flex items-center justify-center">
              <div key={currentBonusIdx} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-start space-x-3 transition-all animate-in slide-in-from-right-4 duration-300">
                <div className="mt-1">
                  <Check className="w-4 h-4 text-amber-400" strokeWidth={3} />
                </div>
                <p className="text-sm font-bold text-white/90 leading-relaxed tracking-tight">
                  {startNotifications[currentBonusIdx]}
                </p>
              </div>
            </div>

            {/* 按鈕 */}
            <button
              onClick={() => {
                if (currentBonusIdx < startNotifications.length - 1) {
                  setCurrentBonusIdx((prev) => prev + 1);
                } else {
                  setShowBonusModal(false);
                  clearStartNotifications();
                }
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black py-5 rounded-2xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-2 text-lg group"
            >
              <span>{currentBonusIdx < startNotifications.length - 1 ? '下一位' : '收下好意'}</span>
              <span className="transition-transform group-hover:translate-x-1 font-normal opacity-70">
                {' '}
                &gt;{' '}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ 前科記錄彈窗 (Sequential View) */}
      {tagViewPlayerIdx !== null && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#0a0a0a] border-2 border-orange-600/40 rounded-[40px] p-8 shadow-[0_0_50px_rgba(154,52,18,0.3)] flex flex-col items-center">
            {/* 裝飾背景 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(154,52,18,0.2),transparent_70%)] rounded-[38px] pointer-events-none" />

            {/* 右上角進度顯示 */}
            <div className="absolute top-8 right-10 text-orange-500/40 text-[10px] font-black tracking-widest">
              {currentViewTags.length > 0 ? tagViewItemIdx + 1 : 0} / {currentViewTags.length}
            </div>

            {/* 警示圖示 */}
            <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(234,88,12,0.4)]">
              <AlertTriangle className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>

            <h2 className="text-xl font-black text-white mb-2 tracking-widest uppercase">
              犯罪前科紀錄
            </h2>
            <p className="text-[10px] font-bold text-orange-500/70 mb-8 tracking-[0.2em] uppercase">
              {players[tagViewPlayerIdx]?.name} 的檔案
            </p>

            {/* 標籤顯示 */}
            <div className="w-full mb-10 min-h-[120px] flex items-center justify-center">
              {currentViewTags.length > 0 ? (
                <div key={tagViewItemIdx} className="w-full bg-orange-950/20 border border-orange-500/30 rounded-2xl p-6 flex flex-col items-center text-center transition-all animate-in zoom-in-95 duration-300">
                  <span className="text-2xl font-black text-white tracking-widest mb-2 uppercase">
                    {currentViewTags[tagViewItemIdx].text}
                  </span>
                  {currentViewTags[tagViewItemIdx].count > 1 && (
                    <span className="bg-orange-500 text-black px-3 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                      累積次數 x{currentViewTags[tagViewItemIdx].count}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 font-bold italic text-sm">無任何犯罪紀錄</div>
              )}
            </div>

            {/* 控制器 */}
            <button
              onClick={() => {
                if (tagViewItemIdx < currentViewTags.length - 1) {
                  setTagViewItemIdx(tagViewItemIdx + 1);
                } else {
                  setTagViewPlayerIdx(null);
                  setTagViewItemIdx(0);
                }
              }}
              className="w-full bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-black py-5 rounded-2xl transition-all shadow-[0_4px_15px_rgba(154,52,18,0.3)] flex items-center justify-center space-x-2 text-lg"
            >
              <span>{tagViewItemIdx < currentViewTags.length - 1 ? '下一條前科' : '關閉卷宗'}</span>
              <ChevronRight size={20} className="opacity-50" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Content: 切換首頁、商店或掃描 */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 custom-scrollbar relative z-10 space-y-4">
        {activeTab === 'home' ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {players.map((player, idx) => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                isActive={idx === currentPlayerIndex} 
                onShowTags={() => {
                  setTagViewPlayerIdx(idx);
                  setTagViewItemIdx(0);
                }}
              />
            ))}
          </div>
        ) : activeTab === 'shop' ? (
          <StoreScreen />
        ) : (
          <ScanScreen
            onBack={() => setActiveTab('home')}
            onEndTurn={() => {
              onEndTurn();
            }}
            onNavigate={setActiveTab}
          />
        )}
      </div>

      {/* 底部導覽列 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] h-16 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-around px-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[90]">
        <button
          onClick={() => setActiveTab('home')}
          title="企業總部"
          className={`flex flex-col items-center justify-center space-y-1 transition-all ${activeTab === 'home' ? 'text-amber-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Home size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">企業總部</span>
        </button>

        <button
          onClick={() => setActiveTab('scan')}
          title="掃描卡片"
          className="relative -top-4 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all"
        >
          <Scan size={28} />
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          title="黑市商店"
          className={`flex flex-col items-center justify-center space-y-1 transition-all ${activeTab === 'shop' ? 'text-amber-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ShoppingBag size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">黑市</span>
        </button>
      </div>
    </div>
  );
}
