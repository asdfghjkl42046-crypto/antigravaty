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
import { formatValue } from '@/engine/MathEngine';
import { SystemStrings } from '@/data/SystemStrings';
import type { Player, Tag } from '@/types/game';
import gsap from 'gsap';
import DebugPanel from './DebugPanel';
import ResolutionOverlay from './ResolutionOverlay';
import BetResolutionOverlay from './BetResolutionOverlay';

interface DashboardScreenProps {
  onEndTurn: () => void;
  onReset: () => void;
}

interface StatDiscProps {
  label: string;
  value: string | number;
  subValue?: string;
  colorClass: string;
  onClick?: () => void;
  hasArrow?: boolean;
  isLabelWhite?: boolean;
}

function StatDisc({
  label,
  value,
  subValue,
  colorClass,
  onClick,
  hasArrow,
  isLabelWhite,
}: StatDiscProps) {
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
export function PlayerCard({
  player,
  isActive,
  onShowTags,
}: {
  player: Player;
  isActive: boolean;
  onShowTags: () => void;
}) {
  const bmCount = getTotalBlackMaterials(player);

  return (
    <div
      className={`relative p-4 py-3 rounded-[28px] border-2 backdrop-blur-xl transition-all duration-500 overflow-visible
      ${player.isBankrupt ? 'grayscale opacity-60 pointer-events-none' : ''}
      ${
        isActive
          ? 'border-amber-400 bg-[#1a1205]/95 shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
          : 'border-white/25 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
      }
    `}
    >
      {/* 破產提示 */}
      {player.isBankrupt && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-red-600/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg ring-1 ring-red-400">
          {SystemStrings.UI_LABELS.STATUS_BANKRUPT}
        </div>
      )}

      {/* 獨立呼吸發光層 */}
      {isActive && !player.isBankrupt && (
        <div className="absolute inset-0 rounded-[28px] border-[3px] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)] animate-[pulse_1.2s_ease-in-out_infinite] pointer-events-none z-0" />
      )}

      {/* 裝飾發光背景層 */}
      {isActive && !player.isBankrupt && (
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at:50%_-20%,rgba(120,53,15,0.15),transparent)] pointer-events-none rounded-[26px]" />
      )}

      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-full border-2 overflow-hidden shadow-md transition-all duration-700 relative z-10
              ${isActive && !player.isBankrupt ? 'border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105' : 'border-white/10'}
            `}
            >
              <img
                src={
                  MASTERPIECES[player.avatarId]?.url ||
                  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.name}`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div>
            <h2
              className={`text-lg font-black tracking-tight transition-colors ${isActive && !player.isBankrupt ? 'text-white' : 'text-slate-400'}`}
            >
              {player.name}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold text-white/70 uppercase mr-1 tracking-widest">
            {SystemStrings.UI_LABELS.AP}
          </span>
          <span className="text-lg font-black text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.3)]">
            {player.ap}
            <span className="text-xs text-white/30 ml-0.5">/ 5</span>
          </span>
        </div>
      </div>

      {/* 數值圓盤 */}
      <div className="flex items-center justify-between space-x-1.5 mb-2 relative z-10">
        <StatDisc
          label={SystemStrings.UI_LABELS.MONEY}
          value={formatValue(player.g, SystemStrings.UNITS.MONEY)}
          subValue={player.trustFund > 0 ? formatValue(player.trustFund, SystemStrings.UNITS.MONEY) : undefined}
          colorClass="text-emerald-400"
        />
        <StatDisc label={SystemStrings.UI_LABELS.IP} value={player.ip} colorClass="text-blue-400" />
        <StatDisc label={SystemStrings.UI_LABELS.RP} value={player.rp} colorClass="text-yellow-400" />
        <StatDisc label={SystemStrings.UI_LABELS.BM} value={bmCount} colorClass="text-red-400" />
        <StatDisc
          label={SystemStrings.UI_LABELS.CONVICTION}
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
    phase,
    judgePersonality,
    startNotifications,
    clearStartNotifications,
    pendingResolution,
    clearResolution,
    pendingBetResolution,
    clearBetResolution,
  } = useGameStore();

  /**
   * [TODO: 多機模式預留邏輯]
   * 當切換至多機連線模式時，此處需加入判斷：
   * 1. 檢查「當前登入者 ID」是否等於 players[currentPlayerIndex].id
   * 2. 如果該玩家 isBankrupt 為 true，則：
   *    - 在根容器 (L267) 套用 grayscale 濾鏡
   *    - 透過一個全域透明層攔截所有 pointer-events
   *    - 顯示「您的企業已倒閉，目前僅具備觀戰權限」的提示
   */

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
  }, []);

  const judgeInfo = judgePersonality ? JUDGE_LABELS[judgePersonality] : null;

  // 處理前科資料聚合
  const getAggregatedTags = (playerIdx: number | null) => {
    if (playerIdx === null || !players[playerIdx]) return [];
    const player = players[playerIdx];
    const tagCounts = player.tags.reduce(
      (acc: Record<string, number>, t: Tag) => {
        acc[t.text] = (acc[t.text] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(tagCounts).map(([text, count]) => ({ text, count }));
  };

  const currentViewTags = getAggregatedTags(tagViewPlayerIdx);
  const hasMultipleTags = currentViewTags.length > 1;

  return (
    <div className="w-full h-full flex flex-col bg-[#020617] text-white overflow-hidden relative font-sans">
      <DebugPanel />

      {/* 1. Header: 狀態列 - 增加 mt-safe 避開行動裝置瀏海 */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 mt-safe duration-500">
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
              {SystemStrings.DECORATION.DASHBOARD_TITLE}
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
      {/* 🎰 開局加成彈窗 - 輕量化「實體便條」重構版 */}
      {showBonusModal && startNotifications.length > 0 && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="relative w-full max-w-sm bg-[#e8e4db] rounded-sm p-10 shadow-[20px_20px_60px_rgba(0,0,0,0.6),-1px_-1px_5px_rgba(255,255,255,0.05)] flex flex-col items-start overflow-hidden border-l-[10px] border-amber-900/10 bg-paper-texture">
            {/* 數位標註：星際終端掃描細節 */}
            <div className="absolute top-6 right-8 font-mono text-amber-950/20 text-[9px] font-bold tracking-widest uppercase">
              {SystemStrings.DECORATION.SCAN_ID}: {currentBonusIdx + 1} / {startNotifications.length}
            </div>

            <div className="flex flex-col mb-10 z-10 w-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-[2px] bg-amber-900/30" />
                <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.4em]">
                  {SystemStrings.DECORATION.CONFIDENTIAL_ADVANTAGE}
                </span>
              </div>
              <h2 className="text-3xl font-serif font-black text-[#2a1b11] leading-none tracking-tighter">
                獲得開局加成
              </h2>
            </div>

            {/* 加成內容區：墨水質感 */}
            <div className="w-full mb-12 min-h-[160px] z-10">
              <div
                key={currentBonusIdx}
                className="w-full transition-all animate-in slide-in-from-left-4 duration-500"
              >
                <div className="flex flex-col border-y border-amber-900/5 py-8">
                  <p className="text-xl font-serif font-bold text-[#3c2a1c]/90 leading-relaxed tracking-tight whitespace-pre-line italic">
                    「{startNotifications[currentBonusIdx]}」
                  </p>
                </div>
              </div>
            </div>

            {/* 控制器：權威按壓感 */}
            <button
              onClick={() => {
                if (currentBonusIdx < startNotifications.length - 1) {
                  setCurrentBonusIdx((prev) => prev + 1);
                } else {
                  setShowBonusModal(false);
                  clearStartNotifications();
                }
              }}
              className="w-full bg-[#1a110b] hover:bg-black active:scale-[0.98] text-[#e8e4db] font-black py-5 rounded-sm transition-all shadow-xl flex items-center justify-center space-x-3 text-sm tracking-[0.5em] uppercase border-t border-white/5"
            >
              <span>
                {currentBonusIdx < startNotifications.length - 1 ? SystemStrings.DECORATION.NEXT_PAGE : SystemStrings.DECORATION.ACKNOWLEDGE}
              </span>
            </button>

            {/* 底部物理細節 */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-900/10" />
          </div>
        </div>
      )}

      {/* ⚠️ 前科記錄彈窗 - 輕量化「警察筆錄」重構版 */}
      {tagViewPlayerIdx !== null && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center p-6 bg-black/95 animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#0a0a0b] border-l border-t border-white/5 p-10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col items-start overflow-hidden">
            {/* 數位掃描格線層 */}
            <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none bg-noir-pinstripe" />

            {/* 星際終端螢光溢邊 */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-orange-600/60 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-[1px] h-32 bg-gradient-to-b from-orange-600/40 to-transparent" />

            {/* 右上角受控變數：機密流水號 */}
            <div className="absolute top-8 right-8 font-mono text-orange-600/30 text-[10px] font-black tracking-widest bg-orange-600/5 px-2 py-1 border border-orange-600/10">
              {SystemStrings.DECORATION.RAP_SHEET}: {currentViewTags.length > 0 ? tagViewItemIdx + 1 : 0} / {currentViewTags.length}
            </div>

            {/* 頂部資訊區：硬派左對齊 */}
            <div className="flex flex-col mb-10 z-10 w-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-orange-600 animate-pulse" />
                <span className="text-[10px] font-black text-orange-600/60 uppercase tracking-[0.4em]">
                  {SystemStrings.DECORATION.CONFIDENTIAL_DOC}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">
                犯罪前科紀錄
              </h2>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider">
                {SystemStrings.DECORATION.SUBJECT}: {players[tagViewPlayerIdx]?.name.toUpperCase()}
              </p>
            </div>

            {/* 標籤顯示：類比式排版 */}
            <div className="w-full mb-12 min-h-[160px] z-10">
              {currentViewTags.length > 0 ? (
                <div
                  key={tagViewItemIdx}
                  className="w-full group animate-in slide-in-from-left-4 duration-500"
                >
                  <div className="flex flex-col border-l-2 border-orange-600/20 pl-6 py-2">
                    <span className="text-[10px] font-black text-orange-600/50 uppercase tracking-[0.3em] mb-4">
                      {SystemStrings.DECORATION.CHARGE_PROTOCOL}
                    </span>
                    <span className="text-3xl font-black text-white/90 tracking-tight mb-8 leading-none">
                      {currentViewTags[tagViewItemIdx].text}
                    </span>

                    {currentViewTags[tagViewItemIdx].count > 1 && (
                      <div className="inline-flex items-center gap-3 px-3 py-2 bg-orange-950/20 border border-orange-600/20 w-max">
                        <span className="text-[9px] font-black text-orange-600/80 uppercase tracking-widest">
                          {SystemStrings.DECORATION.RECIDIVISM_MARK}
                        </span>
                        <span className="text-orange-500 text-sm font-black">
                          X {currentViewTags[tagViewItemIdx].count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-slate-600 font-bold italic text-sm py-10 border-y border-white/5 w-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                  <span>{SystemStrings.SCAN.NO_RECORDS}</span>
                </div>
              )}
            </div>

            {/* 控制器 */}
            <div className="w-full space-y-6">
              {/* 快速瀏覽滑桿 (僅在有多筆記錄時顯示) */}
              {currentViewTags.length > 1 && (
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-orange-600/40 uppercase tracking-widest">
                      {SystemStrings.DECORATION.QUICK_BROWSE}
                    </span>
                    <span className="text-[9px] font-mono text-orange-600/60 font-bold italic">
                      {SystemStrings.DECORATION.CURRENT_POS}: {tagViewItemIdx + 1} / {currentViewTags.length}
                    </span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max={currentViewTags.length - 1}
                      value={tagViewItemIdx}
                      onChange={(e) => setTagViewItemIdx(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-orange-600 hover:accent-orange-500 transition-all"
                      aria-label="快速翻閱紀錄"
                      title="滑動以快速切換犯罪紀錄"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (tagViewItemIdx < currentViewTags.length - 1) {
                    setTagViewItemIdx(tagViewItemIdx + 1);
                  } else {
                    setTagViewPlayerIdx(null);
                    setTagViewItemIdx(0);
                  }
                }}
                className="w-full bg-transparent hover:bg-orange-600/10 border border-orange-600/30 text-orange-500 font-black py-5 transition-all flex items-center justify-center space-x-3 text-sm tracking-[0.4em] uppercase"
              >
                <span>
                  {tagViewItemIdx < currentViewTags.length - 1 ? SystemStrings.DECORATION.NEXT_RECORD : SystemStrings.DECORATION.CLOSE_DOSSIER}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content: 切換首頁、商店或掃描 */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 custom-scrollbar relative z-10 space-y-4">
        {activeTab === 'home' ? (
          <div className="space-y-2 duration-500">
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

      {/* [核心] 全域結算彈窗 */}
      {pendingResolution && (
        <ResolutionOverlay
          title={pendingResolution.title}
          message={pendingResolution.message}
          diffs={pendingResolution.diffs}
          type={pendingResolution.type}
          onClose={clearResolution}
        />
      )}

      {/* [新增] 場外押注結算彈窗 - 這是結算流程的最後一環 */}
      {pendingBetResolution && !pendingResolution && phase === 'play' && (
        <BetResolutionOverlay bets={pendingBetResolution} onClose={clearBetResolution} />
      )}
    </div>
  );
}
