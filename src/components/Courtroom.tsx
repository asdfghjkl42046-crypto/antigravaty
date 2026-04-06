'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { JudgePersonality } from '@/types/game';
import {
  Gavel,
  Scale,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Shield,
  Zap,
  Calculator,
  Info,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  getWithdrawCaseCost,
  getExtraAppealCost,
  getLawyerDefenseBonus,
  shouldRemoveWrongOption,
} from '@/engine/GameEngine';
import { BYSTANDER_OPTIONS, JUDGE_LABELS } from '../data/judges/JudgeTemplatesDB';
import { COURT_TEXT } from '@/data/court/CourtData';
import { getRandomMurmur, type MurmurTrigger } from '@/data/judges/JudgeMurmurs';
import { calculateSpectatorInfluence } from '@/engine/MechanicsEngine';
import { formatLawTags } from '@/data/laws/LawCasesDB';
import { getLawStory } from '@/data/lawstore/LawStoriesDB';
import RouletteOverlay, { RouletteOption } from '@/components/RouletteOverlay';
import TypewriterText from '@/components/TypewriterText';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 法庭畫面
 * 這是遊戲的核心舞台。
 * 負責顯示玩家被抓去關那一刻起，從法官開砲、群眾下注、被告辯護，到最後法槌敲下的過程。
 */
export default function Courtroom() {
  // 從資料庫拿取法庭需要的資料
  const players = useGameStore((s) => s.players);
  const trial = useGameStore((s) => s.trial);
  const setTrialStage = useGameStore((s) => s.setTrialStage);
  const addIntervention = useGameStore((s) => s.addIntervention);
  const placeBet = useGameStore((s) => s.placeBet);
  const submitDefense = useGameStore((s) => s.submitDefense);
  const withdrawCase = useGameStore((s) => s.withdrawCase);
  const setTrialReady = useGameStore((s) => s.setTrialReady);
  const tickTrialTimer = useGameStore((s) => s.tickTrialTimer);
  const judgePersonality = useGameStore((s) => s.judgePersonality);
  const judgeMode = useGameStore((s) => s.judgeMode);
  const resolveTrial = useGameStore((s) => s.resolveTrial);
  const extraordinaryAppeal = useGameStore((s) => s.extraordinaryAppeal);

  // -------------------------
  // 官司期間的暫存紀錄
  // -------------------------

  // 被告方在 AI 模式下可選擇性輸入的補充答辯狀字串
  const [defenseInput, setDefenseInput] = useState('');
  // 被告所選擇的三選一防禦方針索引
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  // 命運轉盤攔截狀態
  const [pendingRoulette, setPendingRoulette] = useState<{
    title: string;
    subtitle: string;
    options: RouletteOption[];
    targetIndex: number;
    onComplete: () => void;
  } | null>(null);
  // 旁觀群眾 (陪審團) 針對該被告打算提出什麼樣的落井下石或求情選項紀錄 (記錄每位玩家id選擇的選項 index)
  const [pendingInterventions, setPendingInterventions] = useState<Record<string, number>>({});
  // 旁觀群眾針對這次庭審結果到底賭有罪還是無罪的金流押注快取
  const [localBets, setLocalBets] = useState<Record<string, 'win' | 'lose' | 'none'>>({});
  // 是否進入二階段展示中的「罰金計算明細」畫面
  const [showPunishmentDetail, setShowPunishmentDetail] = useState(false);
  // 是否展示真實世界判例故事
  const [showStoryDetail, setShowStoryDetail] = useState(false);
  // 法官碎碎念：當前顯示的台詞文字
  const [murmur, setMurmur] = useState<string>('');
  // 法官碎碎念閃爍動畫 key（用於觸發重新動畫）
  const [murmurKey, setMurmurKey] = useState(0);

  /**
   * 觸發法官碎碎念
   * 從碎碎念資料庫隨機抽取一句台詞，並觸發氣泡動畫
   */
  const triggerMurmur = (trigger: MurmurTrigger) => {
    const text = getRandomMurmur(judgePersonality, trigger);
    if (text) {
      setMurmur(text);
      setMurmurKey((k) => k + 1);
    }
  };

  // 找出誰是被告本人
  const currentPlayer = players.find((p) => p.id === trial?.defendantId);

  // -------------------------------------------------------------
  // [法庭倒數計時器]
  // -------------------------------------------------------------
  useEffect(() => {
    // 只有在當前階段「解鎖開始」且法庭確實存在時，才開始計算生命倒數計時
    if (!trial || !trial.isReady) return;
    const interval = setInterval(() => {
      tickTrialTimer(); // 每秒扣除一滴答器
    }, 1000);
    // 結束這回合時清掉計時器
    return () => clearInterval(interval);
    // [優化] 移除 trial.timer 作為依賴項，避免每秒重新建立計時器
  }, [trial?.isReady, trial?.stage, tickTrialTimer]);

  // 切換階段時重置本地狀態
  useEffect(() => {
    setTimeout(() => {
      setSelectedOption(null);
      setDefenseInput('');
      setPendingInterventions({});
      setLocalBets({});
      setShowPunishmentDetail(false);
      setMurmur(''); // 切換階段時清除碎碎念
    }, 0);
  }, [trial?.stage]);

  // 安全網：如果根本沒有人被告，直接隱形，不渲染浪費效能
  if (!trial) return null;

  // 定義這一個階段到底是誰該掌握手機滑鼠發語權
  const defendant = players.find((p) => p.id === trial.defendantId);
  const currentPlayerInTrial =
    trial.stage === 4
      ? defendant // Stage 4: 被告申辯時間
      : players.find((p) => p.id === trial.bystanderIds[trial.actingBystanderIndex]); // Stage 2/3: 旁聽席路人時間

  // [新增] 只有王牌律師 LV2 以上的人能在操作時看透勝率
  const canSeeRate = (currentPlayerInTrial?.roles?.lawyer ?? 0) >= 2;

  // 中場鎖定畫面解除：確認是本人按下「開始回合」按鍵
  const handleStartTurn = () => {
    setTrialReady(true);
  };

  // 動態抓取法庭頂部的大標題：例如「庭審敘事」或「最終判決」
  const getStageTitle = () => {
    return (
      COURT_TEXT.STAGES[trial.stage as keyof typeof COURT_TEXT.STAGES] || COURT_TEXT.STAGES.DEFAULT
    );
  };

  const shuffledDefenseOptions = React.useMemo(() => {
    if (trial?.stage !== 4 || !trial?.lawCase) return [];
    const _defendant = players.find((p) => p.id === trial.defendantId);

    const rawOptions = [
      {
        label:
          trial.generatedOptions?.j ||
          trial.lawCase.defense_j ||
          COURT_TEXT.PHASE_4.DEFENSE_OPTIONS[0],
        index: 0,
      },
      {
        label:
          trial.generatedOptions?.k ||
          trial.lawCase.defense_k ||
          COURT_TEXT.PHASE_4.DEFENSE_OPTIONS[1],
        index: 1,
      },
      {
        label:
          trial.generatedOptions?.l ||
          trial.lawCase.defense_l ||
          COURT_TEXT.PHASE_4.DEFENSE_OPTIONS[2],
        index: 2,
      },
    ];

    // 計算旁觀者干預對勝率的影響 (支持被告 +10% / 質疑被告 -10%)
    const spectatorBonus = calculateSpectatorInfluence(trial.interventions);

    const analyzedOptions = rawOptions.map((opt) => {
      const baseRate = trial.lawCase.survival_rate || 0.2;
      const lawyerBonus = _defendant ? getLawyerDefenseBonus(_defendant) : 0;
      const jklBonus = opt.index === 1 ? 0.05 : opt.index === 2 ? 0.1 : 0;
      const predictedRate = Math.min(1.0, baseRate + spectatorBonus + lawyerBonus + jklBonus);
      return { ...opt, predictedRate, lawyerBonus, jklBonus, spectatorBonus };
    });

    let finalOptions = analyzedOptions;
    if (_defendant && shouldRemoveWrongOption(_defendant)) {
      let minRate = 1.1;
      let worstIdx = -1;
      analyzedOptions.forEach((o, i) => {
        if (o.predictedRate < minRate) {
          minRate = o.predictedRate;
          worstIdx = i;
        }
      });
      if (worstIdx !== -1) {
        finalOptions = analyzedOptions.filter((_, i) => i !== worstIdx);
      }
    }

    return [...finalOptions].sort(() => Math.random() - 0.5);
  }, [trial?.stage, trial?.lawCase, trial?.defendantId, trial?.generatedOptions, trial?.interventions, players]);

  return (
    // 主畫布：法典深藍色底板與漸層光輝
    <div className="w-full min-h-[700px] flex flex-col items-center justify-start py-0 selection:bg-blue-500/30">
      <div className="w-full bg-[#0d1117] border border-blue-500/20 rounded-[40px] shadow-2xl shadow-blue-500/10 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-500">
        {/* ======================= 法庭頂部儀表板：法官與被告身分 ======================= */}
        <div className="px-10 py-8 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 overflow-hidden">
              <img src="/assets/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{getStageTitle()}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-xl">
                  {COURT_TEXT.COURT_NAME}
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {/* 顯示幕後操盤的 AI 法官是誰 (例如毒蛇老頭、貪婪政客) */}
                {judgePersonality && (
                  <p className="text-white/60 text-xl font-bold tracking-widest border-l border-white/20 pl-4">
                    {COURT_TEXT.JUDGE_PREFIX}
                    <span className="text-blue-400">
                      【{JUDGE_LABELS[judgePersonality as keyof typeof JUDGE_LABELS]?.judgeName}】
                    </span>
                    <span className="text-white/40 ml-2">
                      {JUDGE_LABELS[judgePersonality as keyof typeof JUDGE_LABELS]?.title}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* 倒數死亡時鐘：只要進入操作準備就緒階段 (isReady) 且還有時間，就呼叫下方子零件渲染 SVG 圓餅計時器 */}
            {trial.isReady && trial.timer > 0 && (
              <CircularTimer timer={trial.timer} total={trial.stage === 4 ? 45 : 15} />
            )}
            {/* 標示今天的挨打苦主 */}
            <div className="text-right">
              <span className="text-xl uppercase font-black text-slate-400 tracking-widest block mb-2">
                {COURT_TEXT.DEFENDANT_LABEL}
              </span>
              <span className="text-xl font-black text-white px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                {defendant?.name}
              </span>
            </div>
          </div>
        </div>

        {/* ======================= 法官碎碎念氣泡 ======================= */}
        {murmur && (
          <JudgeMurmurBubble
            key={murmurKey}
            text={murmur}
            judgePersonality={judgePersonality}
          />
        )}

        {/* ======================= 核心動態戲服渲染區 (Scrollable) ======================= */}
        <div className="flex-1 overflow-y-auto p-10 relative">
          {/* 黑幕換手遮罩：在需要傳遞實體手機或滑鼠的環節，如果不是本人解鎖，整個畫面都會被打上厚厚的馬賽克防偷看！ */}
          {!trial.isReady && (trial.stage === 2 || trial.stage === 3 || trial.stage === 4) && (
            <div className="absolute inset-0 z-[110] bg-[#0b1120]/98 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
              <div className="p-10 rounded-[24px] bg-blue-500/5 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)] w-full max-w-md flex flex-col items-center">
                <h2 className="text-blue-400 text-lg uppercase tracking-widest mb-6 font-bold">
                  {COURT_TEXT.SYSTEM_LOCK.TITLE}
                </h2>
                <h3 className="text-4xl font-black mb-10 text-white leading-tight">
                  <span className="text-blue-500 opacity-50 mr-2">{'>>>'}</span>
                  <br />
                  {/* 明確告知這回合裝置該交給誰握著 */}
                  {currentPlayerInTrial?.name}
                  <br />
                  <span className="text-blue-500 opacity-50 ml-2">{'<<<'}</span>
                </h3>
                <button
                  onClick={handleStartTurn}
                  className="w-full px-8 py-4 bg-blue-600 border border-blue-400 text-white font-black rounded-xl hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] active:translate-y-1 text-lg uppercase tracking-widest"
                >
                  {COURT_TEXT.SYSTEM_LOCK.SUBTITLE}
                </button>
              </div>
            </div>
          )}

          {/* -------------------- 階段 1：起訴開庭敘事導讀 -------------------- */}
          {trial.stage === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                  <FileText size={240} />
                </div>
                <div className="space-y-6 relative z-10">
                  {/* 控訴罪名標籤徽章 */}
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xl font-black uppercase tracking-widest">
                    <ShieldCheck size={18} /> {COURT_TEXT.PHASE_1.CHARGE_LABEL}
                    {formatLawTags(trial.lawCase.tag)}
                  </div>
                  {/* 使用超大字體顯示法院開庭傳召公文 */}
                  <h3 className="text-4xl font-black leading-tight text-white tracking-tighter">
                    {judgeMode === 'ai'
                      ? COURT_TEXT.PHASE_1.AI_TITLE
                      : COURT_TEXT.PHASE_1.NON_AI_TITLE}
                    <br />
                    {COURT_TEXT.PHASE_1.SUSPECT(formatLawTags(trial.lawCase.tag))}
                  </h3>
                  {/* 此處的 narrative 是從 CourtEngine 加工過由檢察司長發出的起訴文稿 */}
                  <div className="p-6 bg-black/40 rounded-3xl border-l-4 border-blue-500 italic text-slate-200 leading-relaxed font-serif text-lg animate-in fade-in duration-1000 whitespace-pre-line min-h-[120px]">
                    <TypewriterText text={trial.narrative || ''} speed={60} lineDelay={600} />
                  </div>
                </div>
              </div>
              {/* 大夥讀完同意後推進按鈕 */}
              <button
                onClick={() => setTrialStage(2)} // 推進到 Stage 2
                className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 text-xl tracking-widest flex items-center justify-center gap-3"
              >
                {COURT_TEXT.PHASE_1.CONTINUE_BTN}
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* -------------------- 階段 2：旁觀者干預發言 (V3.2 Unified 統一渲染) -------------------- */}
          {trial.stage === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 gap-4">
                {/* 遍歷全場除了被告外剩下的所有看戲吃瓜群眾 */}
                {trial.bystanderIds.map((bid) => {
                  const p = players.find((player) => player.id === bid);
                  // 檢查這名玩家是不是已經提交過干涉建言了
                  const myInterventions = trial.interventions.filter((i) => i.playerId === bid);
                  const isDone = myInterventions.length > 0;
                  // 撈出這名玩家剛剛在本地操作點擊了第幾個按鈕的草稿紀錄
                  const selectedIdx = pendingInterventions[bid];

                  return (
                    <div
                      key={bid}
                      className={cn(
                        'p-6 rounded-2xl border transition-all duration-500',
                        isDone
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80' // 收卷完畢亮綠燈
                          : 'bg-white/5 border-white/5'
                      )}
                    >
                      {/* 這個人的名字與目前他的作答狀態 */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold flex items-center gap-2">{p?.name}</span>
                        <span className="text-xl font-black uppercase tracking-widest text-slate-400 bg-black/20 px-3 py-1 rounded-lg">
                          {isDone
                            ? COURT_TEXT.PHASE_2.SUBMITTED
                            : selectedIdx !== undefined
                              ? COURT_TEXT.PHASE_2.SELECTED
                              : COURT_TEXT.PHASE_2.WAITING}
                        </span>
                      </div>

                      {/* 還沒交卷，展開四大干預選項按鈕供他選定 */}
                      {!isDone && (
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-4">
                            {BYSTANDER_OPTIONS.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setPendingInterventions((prev) => ({ ...prev, [bid]: i }));
                                  // 觸發法官碎碎念：根據旁觀者選擇支持或質疑
                                  triggerMurmur(i === 0 ? 'bystander_support' : 'bystander_attack');
                                }}
                                className={cn(
                                  'px-6 py-5 rounded-2xl text-base font-black uppercase tracking-widest transition-all active:scale-95 text-center border-2 leading-tight',
                                  selectedIdx === i
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                                    : 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600/20'
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 交卷後展示已送出的公文紀錄 */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {myInterventions.map((i, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs border border-blue-500/30"
                          >
                            「{i.text}」
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 所有吃瓜群眾都表態完畢，由系統一次過把所有人的明槍暗箭射向法官與被告 */}
              <button
                onClick={async () => {
                  // [修正] 改用 for...of 確保異步順序，防止在資料寫入 Store 之前就跳轉 Stage (疑點 1)
                  for (const bid of trial.bystanderIds) {
                    const idx = pendingInterventions[bid];
                    if (idx !== undefined && idx !== 999) {
                      await addIntervention(bid, BYSTANDER_OPTIONS[idx].text);
                    }
                  }
                  setTrialStage(3); // 推進去賭博
                }}
                className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
              >
                {COURT_TEXT.PHASE_2.CONFIRM_BTN}
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* -------------------- 階段 3：旁觀者法院門口下注大會 (V3.2 Unified) -------------------- */}
          {trial.stage === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="text-lg font-black uppercase tracking-widest text-blue-400">
                    案件基礎公關難度
                  </span>
                </div>
                <div className="text-3xl font-black text-blue-400">
                  {canSeeRate
                    ? `${((trial.lawCase?.survival_rate || 0.2) * 100).toFixed(0)}%`
                    : '??%'}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {trial.bystanderIds.map((bid) => {
                  const p = players.find((player) => player.id === bid);
                  const myBetInStore = trial.bets.find((b) => b.playerId === bid);
                  const isDone = !!myBetInStore;
                  const currentLocalBet = localBets[bid];

                  return (
                    <div
                      key={bid}
                      className={cn(
                        'p-6 rounded-2xl border transition-all duration-500',
                        isDone
                          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80'
                          : 'bg-white/5 border-white/5'
                      )}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <span className="font-bold uppercase tracking-widest">{p?.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black uppercase tracking-widest text-slate-400 bg-black/20 px-3 py-1 rounded-lg">
                            {isDone
                              ? COURT_TEXT.PHASE_2.SUBMITTED
                              : currentLocalBet
                                ? COURT_TEXT.PHASE_2.SELECTED
                                : COURT_TEXT.PHASE_2.WAITING}
                          </span>
                        </div>
                      </div>

                      {/* 下注區域：買他贏、買他輸、或者放棄 */}
                      {!isDone && (
                        <div className="grid grid-cols-3 gap-3">
                          {/* 買脫產成功 (無罪) */}
                          <button
                            onClick={() => { setLocalBets((prev) => ({ ...prev, [bid]: 'win' })); triggerMurmur('bet_innocent'); }}
                            className={cn(
                              'py-6 px-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-3 text-sm uppercase tracking-widest',
                              currentLocalBet === 'win'
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            )}
                          >
                            <TrendingUp size={24} />
                            {COURT_TEXT.PHASE_3.BET_WIN}
                          </button>
                          {/* 買他進牢房被重罰 (有罪) */}
                          <button
                            onClick={() => { setLocalBets((prev) => ({ ...prev, [bid]: 'lose' })); triggerMurmur('bet_guilty'); }}
                            className={cn(
                              'py-6 px-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-3 text-sm uppercase tracking-widest',
                              currentLocalBet === 'lose'
                                ? 'bg-red-500 border-red-400 text-white shadow-lg scale-105'
                                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                            )}
                          >
                            <TrendingDown size={24} />
                            {COURT_TEXT.PHASE_3.BET_LOSE}
                          </button>
                          {/* 人權律師不賭博 (略過) */}
                          <button
                            onClick={() => { setLocalBets((prev) => ({ ...prev, [bid]: 'none' })); triggerMurmur('bet_skip'); }}
                            className={cn(
                              'py-6 px-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center gap-3 text-sm uppercase tracking-widest',
                              currentLocalBet === 'none'
                                ? 'bg-slate-500 border-slate-400 text-white shadow-lg scale-105'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                            )}
                          >
                            <MessageSquare size={24} />
                            {COURT_TEXT.PHASE_3.BET_SKIP}
                          </button>
                        </div>
                      )}

                      {/* 揭曉自己下的重注與底牌 */}
                      {isDone && (
                        <div
                          className={cn(
                            'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase',
                            myBetInStore.choice === 'win'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : myBetInStore.choice === 'lose'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-slate-500/20 text-slate-400'
                          )}
                        >
                          {COURT_TEXT.PHASE_3.FINAL_CHOICE}
                          {myBetInStore.choice === 'win'
                            ? COURT_TEXT.PHASE_3.WIN
                            : myBetInStore.choice === 'lose'
                              ? COURT_TEXT.PHASE_3.LOSE
                              : COURT_TEXT.PHASE_3.SKIP}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 確認所有賭資到位，提交進入高潮：法官審問被告環節 */}
              <button
                onClick={async () => {
                  for (const bid of trial.bystanderIds) {
                    const choice = localBets[bid];
                    if (choice) await placeBet(bid, choice); // 注入 GameStore 的賭盤
                  }
                  setTrialStage(4);
                }}
                className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
              >
                {COURT_TEXT.PHASE_3.CONFIRM_BTN}
                <ChevronRight size={24} />
              </button>
            </div>
          )}

          {/* -------------------- 階段 4：法官拍桌宣示主權與被告防禦辯論-------------------- */}
          {trial.stage === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-8 rounded-3xl bg-[#1a1f26] border-2 border-blue-500/30 space-y-6">
                {/* 充滿壓迫感的法官死亡質詢 */}
                <div className="flex items-center gap-3">
                  <Gavel size={32} className="text-yellow-500" />
                  <h3 className="text-[28px] font-bold text-white">
                    {COURT_TEXT.PHASE_4.QUESTION_TITLE}
                  </h3>
                </div>
                {/* trial.question 是由 CourtEngine 用模板精算後吐出來的有毒問句 */}
                <div className="text-[28px] text-slate-200 italic font-serif leading-relaxed whitespace-pre-line min-h-[100px]">
                  <TypewriterText text={trial.question || ''} speed={60} lineDelay={600} />
                </div>

                {/* 被告最後的狡辯：你要裝死到底、轉移焦點、還是跟法官裝可憐？ */}
                <div className="grid grid-cols-1 gap-3">
                  {shuffledDefenseOptions.map((opt) => {
                    const { label, index: i, predictedRate, lawyerBonus, jklBonus, spectatorBonus } = opt;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedOption(i);
                          // 觸發法官碎碎念：根據辯護策略強度
                          triggerMurmur(i === 0 ? 'defense_weak' : i === 1 ? 'defense_mid' : 'defense_strong');
                        }}
                        className={cn(
                          'w-full px-8 py-6 rounded-3xl border-2 text-left transition-all flex flex-col gap-2 relative group leading-relaxed',
                          selectedOption === i
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg'
                            : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                        )}
                      >
                        <div className="flex justify-between items-center w-full mb-2">
                          <span className="text-[24px] leading-snug font-black">{label}</span>
                          {selectedOption === i && <ShieldCheck size={32} className="shrink-0 ml-4" />}
                        </div>

                        {canSeeRate && (
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 h-3 bg-black/20 rounded-full overflow-hidden">
                              <div
                                ref={(el) => {
                                  if (el)
                                    el.style.setProperty('--rate', `${predictedRate * 100}%`);
                                }}
                                className={cn(
                                  'survival-rate-bar h-full transition-all duration-500',
                                  predictedRate > 0.7
                                    ? 'bg-emerald-500'
                                    : predictedRate > 0.4
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                'text-[20px] font-black font-mono leading-none',
                                selectedOption === i ? 'text-white' : 'text-slate-400'
                              )}
                            >
                              預估勝率: {(predictedRate * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}

                        {!canSeeRate && (
                          <div className="flex items-center gap-4 mt-2">
                            <span
                              className={cn(
                                'text-[20px] font-black font-mono leading-none',
                                selectedOption === i ? 'text-white' : 'text-slate-400'
                              )}
                            >
                              預估勝率: ???
                            </span>
                          </div>
                        )}

                        {/* 只有在能看見勝率且有加成的情況下才顯示該標籤（避免選項內容防禦力被外洩） */}
                        {canSeeRate && (lawyerBonus > 0 || jklBonus > 0 || spectatorBonus !== 0) && (
                          <div className="flex flex-wrap gap-3 mt-2">
                            {lawyerBonus > 0 && (
                              <span className="text-[20px] px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold uppercase leading-none">
                                王牌律師 +30%
                              </span>
                            )}
                            {jklBonus > 0 && (
                              <span className="text-[20px] px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-400 font-bold uppercase leading-none">
                                選項加成 +{(jklBonus * 100).toFixed(0)}%
                              </span>
                            )}
                            {spectatorBonus > 0 && (
                              <span className="text-[20px] px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold uppercase leading-none">
                                🛡 旁聽席支持 +{(spectatorBonus * 100).toFixed(0)}%
                              </span>
                            )}
                            {spectatorBonus < 0 && (
                              <span className="text-[20px] px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 font-bold uppercase leading-none">
                                ⚔ 旁聽席質疑 {(spectatorBonus * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* AI 模式限定：你可以自己打字辱罵法官、或是瞎掰出更完美的藉口來影響最終判決！ */}
                {judgeMode === 'ai' && (
                  <div className="space-y-3">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      {COURT_TEXT.PHASE_4.SUPPLEMENTARY_LABEL}
                    </div>
                    <textarea
                      value={defenseInput}
                      onChange={(e) => setDefenseInput(e.target.value)}
                      placeholder={COURT_TEXT.PHASE_4.SUPPLEMENTARY_PLACEHOLDER}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    />
                  </div>
                )}
              </div>

              {/* 把你這輩子最重要的防禦選項打包成封包丟往深邃的法庭黑盒子 (submitDefense) */}
              <button
                disabled={selectedOption === null}
                onClick={() => {
                  const optIndex = selectedOption as number;
                  const baseRate = trial.lawCase.survival_rate || 0.2;
                  const spectatorBonus = calculateSpectatorInfluence(trial.interventions);
                  const lawyerBonus = defendant ? getLawyerDefenseBonus(defendant) : 0;
                  const jklBonus = optIndex === 1 ? 0.05 : optIndex === 2 ? 0.1 : 0;
                  const predictedRate = Math.min(1.0, baseRate + spectatorBonus + lawyerBonus + jklBonus);

                  submitDefense(optIndex, defenseInput);

                  const updatedTrial = useGameStore.getState().trial;
                  setPendingRoulette({
                    title: '法庭無情判決',
                    subtitle: '命運的法槌即將落下...',
                    options: [
                      { label: '無罪釋放', probability: predictedRate, colorHex: '#10b981' },
                      { label: '有罪定讞', probability: 1 - predictedRate, colorHex: '#ef4444' },
                    ],
                    targetIndex: updatedTrial?.isDefenseSuccess ? 0 : 1,
                    onComplete: () => {
                      setPendingRoulette(null);
                    },
                  });
                }}
                className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all disabled:opacity-50"
              >
                {COURT_TEXT.PHASE_4.SUBMIT_BTN}
              </button>
            </div>
          )}

          {/* -------------------- 階段 5：王牌律師降臨 - 只要錢夠多，連法官都能買下來撤告 -------------------- */}
          {trial.stage === 5 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 用大量象徵金磚的琥珀橘色警告玩家這是一個砸錢專用的畫面 */}
              <div className="p-10 rounded-[40px] border-4 border-amber-500/40 bg-amber-500/5 shadow-2xl shadow-amber-500/10 flex flex-col items-center text-center space-y-6">
                <div className="p-6 rounded-3xl bg-amber-500/10 text-amber-400 animate-pulse">
                  <Shield size={64} />
                </div>

                <div>
                  <h3 className="text-3xl font-black mb-2 uppercase tracking-tight text-amber-400">
                    {COURT_TEXT.PHASE_5.TITLE}
                  </h3>
                  <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">
                    {COURT_TEXT.PHASE_5.SUB}
                  </p>
                </div>

                <div className="p-8 bg-black/40 rounded-3xl text-sm leading-relaxed text-slate-200 w-full">
                  <p className="mb-4">{COURT_TEXT.PHASE_5.DESC}</p>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-[32px] p-8 w-full shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-400 to-amber-600" />

                  {/* 收費處：殘酷地檢查這個大老闆手上的黑錢跟人脈，到底夠不夠買下自己的自由？ */}
                  {(() => {
                    const defendant = players.find((p) => p.id === trial.defendantId);
                    // 呼叫 GameEngine 的專業計算機來生出這個案子的撤回和解報價單
                    const { g: fee, ip: ipCost } = defendant
                      ? getWithdrawCaseCost(defendant)
                      : { g: 0, ip: 0 };
                    // 只要少一枚金幣或影響力不足，按鈕就會直接無情反灰封死
                    const canAfford = defendant
                      ? defendant.g >= fee && defendant.ip >= ipCost
                      : false;

                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div
                            className={cn(
                              'p-3 border rounded-xl text-center transition-colors',
                              !defendant || defendant.g < fee
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            )}
                          >
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                              {COURT_TEXT.PHASE_5.FEE_LABEL}
                            </div>
                            <div className="text-lg font-black">{fee} 萬 G</div>
                          </div>
                          <div
                            className={cn(
                              'p-3 border rounded-xl text-center transition-colors',
                              !defendant || defendant.ip < ipCost
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            )}
                          >
                            <div className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">
                              {COURT_TEXT.PHASE_5.IP_LABEL}
                            </div>
                            <div className="text-lg font-black">{ipCost} IP</div>
                          </div>
                        </div>
                        <p className="text-slate-300 text-xs mb-6">
                          {COURT_TEXT.PHASE_5.WITHDRAW_DESC}
                        </p>

                        <div className="w-full flex gap-4 max-w-md">
                          {/* 分岔路口：點擊放生放棄撤告，將乖乖接受 Stage 6 法院死刑宣判 */}
                          <button
                            onClick={() => { triggerMurmur('lawyer_giveup'); setTrialStage(6); }}
                            className="flex-1 py-5 bg-white/5 border-2 border-white/10 text-slate-200 font-black rounded-2xl hover:bg-white/10 transition-all active:scale-95 uppercase tracking-widest text-sm"
                          >
                            {COURT_TEXT.PHASE_5.GIVE_UP_BTN}
                          </button>
                          {/* 花大錢，消滅審判歷史，直接將官司扔進黑洞 (觸發 withdrawCase() -> 清除法庭 -> 全身而退) */}
                          <button
                            disabled={!canAfford}
                            onClick={async () => {
                              triggerMurmur('lawyer_withdraw');
                              await withdrawCase();
                            }}
                            className="flex-1 py-5 bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-black font-black rounded-2xl hover:bg-amber-400 disabled:hover:bg-slate-700 transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none active:scale-95 disabled:active:scale-100 uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                          >
                            <ShieldCheck size={20} />
                            {COURT_TEXT.PHASE_5.EXECUTE_BTN}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* -------------------- 階段 6：一翻兩瞪眼，法院宣判死刑還是當庭釋放 -------------------- */}
          {trial.stage === 6 && (
            <>
            <VerdictMurmurTrigger triggerMurmur={triggerMurmur} isSuccess={trial.isDefenseSuccess} />
            <div className="space-y-4 animate-in zoom-in duration-700 text-center">
              {/* 【第一小階段：宣讀判決文字】 */}
              {!showPunishmentDetail && (
                <div
                  className={cn(
                    'p-6 rounded-[40px] border-4 flex flex-col items-center text-center space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4',
                    trial.isDefenseSuccess
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/10'
                      : 'bg-red-500/10 border-red-500/50 shadow-red-500/10'
                  )}
                >
                  <div
                    className={cn(
                      'p-6 rounded-3xl bg-white/10',
                      trial.isDefenseSuccess ? 'text-emerald-500' : 'text-red-500'
                    )}
                  >
                    {trial.isDefenseSuccess ? <Shield size={64} /> : <AlertTriangle size={64} />}
                  </div>
                  <div>
                    <h3 className="text-5xl font-black mb-2 uppercase tracking-tight">
                      {trial.isDefenseSuccess
                        ? COURT_TEXT.PHASE_6.NOT_GUILTY
                        : COURT_TEXT.PHASE_6.GUILTY}
                    </h3>
                    <p className="text-xl text-slate-300 font-bold tracking-widest">
                      {trial.lawCase.lawName}
                    </p>
                  </div>

                  <div className="p-8 bg-black/40 rounded-3xl text-sm leading-relaxed text-slate-200 w-full max-w-2xl font-mono relative group overflow-hidden border border-white/5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span
                        key={i}
                        className="court-float-tag absolute pointer-events-none select-none text-red-400 font-black text-[11px] tracking-wider whitespace-nowrap"
                      >
                        {formatLawTags(trial.lawCase.tag)}
                      </span>
                    ))}

                    <div className="relative z-10">
                      {trial.judgment ? (
                        <div className="whitespace-pre-wrap font-serif text-2xl leading-relaxed">
                          {trial.judgment}
                        </div>
                      ) : trial.isDefenseSuccess ? (
                        <div className="text-xl font-serif">
                          {COURT_TEXT.PHASE_6.NOT_GUILTY_DESC(
                            formatLawTags(trial.lawCase.tag),
                            trial.lawCase.escape || '業務正當性',
                            trial.lawCase.surface_term || ''
                          )}
                        </div>
                      ) : (
                        <div className="text-xl font-serif">
                          {COURT_TEXT.PHASE_6.GUILTY_DESC(
                            formatLawTags(trial.lawCase.tag),
                            trial.lawCase.escape || '業務正當性'
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 如果無罪或不需要罰金詳情，直接結案；否則進入下一階段 */}
                  {trial.isDefenseSuccess || !trial.punishment ? (
                    <button
                      onClick={async () => {
                        await resolveTrial();
                      }}
                      className="w-full py-6 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all text-2xl uppercase tracking-widest"
                    >
                      {COURT_TEXT.PHASE_6.ACCEPT_BTN}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-4 w-full">
                      <button
                        onClick={() => setShowPunishmentDetail(true)}
                        className="w-full py-6 bg-red-600 border border-red-400 text-white font-black rounded-2xl hover:bg-red-500 transition-all text-2xl uppercase tracking-widest animate-pulse"
                      >
                        <Calculator size={24} className="inline mr-2" />
                        查看處罰詳情與核算報告
                      </button>
                      <button
                        onClick={() => setShowStoryDetail(true)}
                        className="w-full py-5 bg-slate-800 border border-slate-600 hover:border-slate-400 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-all text-xl uppercase tracking-widest"
                      >
                        <BookOpen size={24} className="inline mr-2" />
                        查看真實社會判例
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 【第二小階段：執行處罰與罰金核算】 */}
              {showPunishmentDetail && trial.punishment && (
                <div className="p-6 rounded-[40px] border-4 border-red-500/50 bg-red-500/10 shadow-2xl shadow-red-500/10 flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-red-500">
                    <AlertTriangle size={48} />
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                    刑罰執行核算
                  </h3>

                  <div className="w-full flex gap-4 max-w-2xl">
                    <div className="flex-1 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center">
                      <div className="text-lg font-black uppercase tracking-widest text-red-400/60 mb-2">
                        {COURT_TEXT.PHASE_6.FINE}
                      </div>
                      <div className="text-5xl font-black text-red-400">
                        -{trial.punishment.fine} 萬 G
                      </div>
                    </div>
                    <div className="flex-1 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center justify-center">
                      <div className="text-lg font-black uppercase tracking-widest text-red-400/60 mb-2">
                        {COURT_TEXT.PHASE_6.RP_LOSS}
                      </div>
                      <div className="text-5xl font-black text-red-400">
                        -{trial.punishment.rpLoss} RP
                      </div>
                    </div>
                  </div>

                  {trial.punishmentDetail && (
                    <div className="w-full max-w-2xl p-6 bg-black/40 border border-red-500/20 rounded-3xl">
                      <div className="flex items-center gap-2 mb-3 text-red-400/70">
                        <Calculator size={18} />
                        <span className="text-sm font-black uppercase tracking-widest">
                          罰金計算核算報告 (CALCULATION REPORT)
                        </span>
                      </div>
                      <div className="text-2xl font-mono text-slate-300 leading-relaxed text-left border-l-4 border-red-500/50 pl-4">
                        {trial.punishmentDetail}
                      </div>

                      <div className="mt-4 pt-4 border-t border-red-500/10 text-sm text-slate-400">
                        <p className="flex items-center gap-1.5 italic mb-2 font-bold">
                          <Info size={14} className="opacity-50" />
                          <span>罰金影響規約 (RULES)：</span>
                        </p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-base opacity-90 font-medium text-left">
                          <div className="flex gap-2">
                            <span className="text-red-500">◆</span> 基礎罰金 = 不法所得 × 1.0x
                          </div>
                          <div className="flex gap-2">
                            <span className="text-red-500">◆</span> 累犯 4 次以上：罰金 × 3.0x
                          </div>
                          <div className="flex gap-2">
                            <span className="text-red-500">◆</span> 累犯 7 次以上：罰金 × 6.0x
                          </div>
                          <div className="flex gap-2">
                            <span className="text-red-500">◆</span> 非常上訴敗訴：再 × 2.0x
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex flex-col gap-4 pt-2">
                    <button
                      onClick={async () => {
                        await resolveTrial();
                      }}
                      className="w-full py-6 bg-white text-black font-black rounded-2xl hover:bg-slate-200 transition-all text-2xl uppercase tracking-widest"
                    >
                      {COURT_TEXT.PHASE_6.ACCEPT_BTN}
                    </button>

                    {!trial.extraAppealUsed && !currentPlayer?.hasUsedExtraAppeal && (
                      <button
                        onClick={async () => {
                          await extraordinaryAppeal();
                        }}
                        className="w-full py-5 bg-amber-500/10 border-2 border-amber-500/30 text-amber-500 font-black rounded-2xl hover:bg-amber-500/20 transition-all uppercase tracking-widest text-xl flex items-center justify-center gap-2"
                      >
                        <Zap size={24} />
                        {COURT_TEXT.PHASE_6.EXTRA_APPEAL_BTN(
                          currentPlayer ? getExtraAppealCost(currentPlayer) : 0
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setShowPunishmentDetail(false)}
                      className="text-xs uppercase font-bold text-slate-500 hover:text-slate-300 underline underline-offset-4 tracking-widest"
                    >
                      返回查看判決書文字
                    </button>
                  </div>
                </div>
              )}

              {/* 【真實社會判例故事展示外框】 */}
              {showStoryDetail && (
                <div className="absolute inset-0 z-50 p-6 rounded-[50px] border-4 border-blue-500/50 bg-slate-900/95 shadow-2xl flex flex-col text-left space-y-6 animate-in zoom-in-95 backdrop-blur-3xl overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/10 pb-6 shrink-0">
                    <div className="flex items-center gap-4 text-blue-400">
                      <BookOpen size={48} />
                      <h3 className="text-4xl font-black uppercase tracking-widest">
                        真實世界判例
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowStoryDetail(false)}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-xl font-black tracking-widest uppercase rounded-2xl transition-all"
                    >
                      關閉卷宗
                    </button>
                  </div>
                  
                  <div className="flex-1 mt-4 p-8 bg-black/60 border border-blue-500/20 rounded-3xl overflow-y-auto text-slate-200">
                    <h4 className="text-2xl text-slate-400 font-black mb-6 tracking-widest flex items-center gap-2">
                      <Gavel size={24} className="opacity-50"/> 
                      觸犯法條：{trial.lawCase.lawName}
                    </h4>
                    {(() => {
                      const story = getLawStory(trial.lawCase.id);
                      return (
                        <div className="flex flex-col gap-10 pb-10">
                          {/* 1. 背景區 */}
                          {story.background && story.background.length > 0 && (
                            <section className="space-y-4">
                              <h5 className="text-lg font-black text-slate-500 tracking-widest mb-4 uppercase">1. 背景</h5>
                              {story.background.map((paragraph, i) => (
                                <p key={i} className="text-2xl text-slate-300 leading-relaxed font-serif tracking-wide">
                                  {paragraph}
                                </p>
                              ))}
                            </section>
                          )}

                          {/* 分隔線 */}
                          {story.background && story.event.length > 0 && <div className="h-px bg-white/10 w-full" />}

                          {/* 2. 事件區 */}
                          {story.event && story.event.length > 0 && (
                            <section className="space-y-4">
                              <h5 className="text-lg font-black text-slate-500 tracking-widest mb-4 uppercase">2. 事件</h5>
                              {story.event.map((paragraph, i) => {
                                if (paragraph.startsWith('QUOTE:')) {
                                  return (
                                    <div key={i} className="bg-red-500/10 text-red-400 p-6 rounded-2xl border-l-4 border-red-500 font-bold text-2xl leading-relaxed my-6 shadow-inner tracking-wide">
                                      {paragraph.replace('QUOTE:', '').trim()}
                                    </div>
                                  );
                                }
                                return (
                                  <p key={i} className="text-2xl text-slate-300 leading-relaxed font-serif tracking-wide">
                                    {paragraph}
                                  </p>
                                );
                              })}
                            </section>
                          )}
                          
                          {/* 分隔線 */}
                          {(story.suspect || story.reason) && <div className="h-px bg-white/10 w-full" />}

                          {/* 3. 判決理由 */}
                          {(story.suspect || story.reason) && (
                            <section className="space-y-8">
                              <h5 className="text-lg font-black text-slate-500 tracking-widest mb-4 uppercase">
                                3. {trial.isDefenseSuccess ? '為什麼法院判他無罪' : '為什麼法院判他有罪'}
                              </h5>
                              
                              {story.suspect && (
                                <div className="space-y-4">
                                  <p className="text-2xl text-slate-300 leading-relaxed font-serif tracking-wide whitespace-pre-line">
                                    {story.suspect}
                                  </p>
                                </div>
                              )}
                              
                              {story.reason && (
                                <div className="space-y-4">
                                  <p className="text-2xl text-slate-300 leading-relaxed font-serif tracking-wide whitespace-pre-line">
                                    {story.reason}
                                  </p>
                                </div>
                              )}
                            </section>
                          )}
                          
                          {/* 分隔線 */}
                          {story.result && (story.reason || story.suspect || story.event.length > 0) && (
                            <div className="h-px bg-white/10 w-full mt-4 mb-2" />
                          )}

                          {/* 4. 判決結果黑盒子 */}
                          {story.result && (
                            <section className="p-8 border border-white/10 bg-[#161a20] rounded-2xl space-y-4">
                              <h5 className="text-lg font-black text-slate-400 tracking-widest mb-2">判決</h5>
                              <p className="text-3xl font-black text-slate-100 tracking-widest whitespace-pre-line">
                                {story.result}
                              </p>
                            </section>
                          )}

                          {/* 5. 外部卷宗連結 */}
                          {story.link && (
                            <div className="flex justify-start mt-2">
                              <a
                                href={story.link}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="inline-flex items-center gap-2 px-6 py-4 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold rounded-xl transition-all border border-blue-500/30 hover:border-blue-500 group"
                              >
                                <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                <span>前往司法院檢視原始卷宗</span>
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
            </>
          )}

          {/* -------------------- 階段 7 專屬：非常上訴過場動畫播放器 -------------------- */}
          {trial.stage === 7 && <Stage7Transition onComplete={() => setTrialStage(4)} />}
        </div>

        {/* ======================= 法庭進度麵包屑 (Breadcrumbs Indicator) ======================= */}
        <div className="px-10 py-6 bg-white/5 border-t border-white/5 flex justify-center gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                // 視覺心機：目前進行到的關卡會霸氣地霸佔整個亮點，走過的變成半透明歷史遺跡，還沒到的則黯淡無光。
                trial.stage === s
                  ? 'w-12 bg-blue-500'
                  : trial.stage > s
                    ? 'w-6 bg-blue-500/40'
                    : 'w-6 bg-white/10'
              )}
            />
          ))}
        </div>
      </div>

      {pendingRoulette && (
        <RouletteOverlay
          title={pendingRoulette.title}
          subtitle={pendingRoulette.subtitle}
          options={pendingRoulette.options}
          targetIndex={pendingRoulette.targetIndex}
          onComplete={pendingRoulette.onComplete}
        />
      )}
    </div>
  );
}

/**
 * ============================================================================
 * [輔助附屬子元件區域]
 * ============================================================================
 */

/**
 * 讓人手心冒汗的死亡計時器
 * 利用 SVG 畫出會隨著時間慢慢斷裂消耗的圓形軌道，用來壓榨玩家在法庭上的決策冷靜度。
 */
function CircularTimer({ timer, total }: { timer: number; total: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius; // 圓周長公式：2πr
  // 防呆極限控制：避免初期伺服器不穩導致 timer 為 0 或負數甚至破表溢出
  const safeTimer = Math.max(0, Math.min(timer, total));
  const offset = circumference - (safeTimer / total) * circumference;
  // 當時間只剩 5 秒時進入恐慌警戒狀態 (發布紅光並急促跳點)
  const isUrgent = timer <= 5;

  return (
    <div className="relative flex items-center justify-center w-20 h-20 group">
      {/* 計時器底層的氣氛渲染高斯模糊發光板 (blur-xl) */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-xl transition-all duration-500',
          isUrgent ? 'bg-red-500/20' : 'bg-blue-500/10 group-hover:bg-blue-500/20'
        )}
      />

      {/* SVG 向量繪圖核心區塊 (將圓形旋轉 90 度讓進度條起點落在最正上方的12點鐘方向) */}
      <svg className="w-full h-full transform -rotate-90 relative z-10">
        {/* 背景灰暗消蝕後留下的殘影軌道底線 */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-white/5"
        />
        {/* 在前面實體飛躍追逐時間生命的藍或紅色進度條實線 */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round" // 讓進度條切線不會太生硬切割，以圓潤筆觸收尾
          className={cn(
            'circular-timer-circle',
            isUrgent ? 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-blue-400'
          )}
        />
      </svg>

      {/* 鎮靜地坐在圈圈風暴中心的數字跳動區域 */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center z-20',
          isUrgent ? 'text-red-500 animate-pulse' : 'text-white'
        )}
      >
        <span className="text-xl font-black font-mono leading-none">{timer}</span>
        <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">sec</span>
      </div>
    </div>
  );
}

/**
 * Stage 7 破釜沉舟之法庭終審救濟過渡動畫播放面板
 * 當玩家啟動此項終極奧義，這裡會負責展示一個被無情剝奪 20% 全部家產的震懾動畫演出，
 * 當它讀條轉圈完畢，程式邏輯就會再次被導彈拋回 Stage 4 請求重新答辯！
 */
function Stage7Transition({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 製造一個讓玩家看著就很焦慮緊張的「重載卷宗進度條跳動動畫」（預計花 2 秒鐘磨爛玩家心靈）
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100; // 鎖定 100% 抵達終點不再加
        }
        return prev + 2;
      });
    }, 40);

    // 2.5 秒滿滿儀式感後，無情地把這一切還原打回原形 Stage 4
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  // 大神級別微操技巧：直接透過底層原生 DOM API 去操控注入前端 CSS 自訂變數，藉此繞過 React 重繪機制帶來的頓挫 inline-style 效能消耗
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty('--progress', `${progress}%`);
    }
  }, [progress]);

  return (
    // 使用宇宙神秘紫作為紫禁城終極上訴的威權主色調
    <div className="space-y-8 animate-in zoom-in duration-500 text-center">
      <div className="p-10 rounded-[40px] border-4 border-purple-500/40 bg-purple-500/5 shadow-2xl shadow-purple-500/10 flex flex-col items-center text-center space-y-6">
        {/* 一直在那邊慢慢旋轉閃電逼迫你接受現實的圖騰 */}
        <div className="p-6 rounded-3xl bg-purple-500/10 text-purple-400">
          <Zap size={64} className="animate-spin spin-slow" />
        </div>

        <div>
          <h3 className="text-3xl font-black mb-2 uppercase tracking-tight text-purple-400">
            法庭終審救濟
          </h3>
          <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">
            EXTRAORDINARY APPEAL IN PROGRESS
          </p>
        </div>

        {/* 下方的文本跑馬燈會伴隨進度增加無情拋出嘲諷式提示 */}
        <div className="space-y-4 w-full max-w-md">
          <p className="text-lg text-slate-200 font-bold">
            正在重新調閱卷宗...
            <span className="text-purple-400">（已扣除 20% 資產）</span>
          </p>

          {/* 這就是剛才我們用原生 JS 去拉寬的變色實心進度條實體 */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 progress-bar"
            />
          </div>

          <p className="text-xs text-slate-400 font-mono">
            {progress < 30 && '載入歷史紀錄...'}
            {progress >= 30 && progress < 60 && '比對法條資料庫...'}
            {progress >= 60 && progress < 90 && '重新生成答辯選項...'}
            {progress >= 90 && '準備完成，即將進入答辯...'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 法官碎碎念氣泡元件
 * 以滑入動畫從頂部顯示法官的即時反應台詞，配合法官性格色調。
 */
function JudgeMurmurBubble({
  text,
  judgePersonality,
}: {
  text: string;
  judgePersonality: JudgePersonality | null;
}) {
  const colorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    traditionalist: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    algorithmic: {
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    elegant: {
      border: 'border-purple-500/40',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    },
    pragmatic: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    },
    power_broker: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
  };

  const colors = judgePersonality ? colorMap[judgePersonality] : null;
  const borderClass = colors?.border ?? 'border-blue-500/40';
  const bgClass = colors?.bg ?? 'bg-blue-500/10';
  const textClass = colors?.text ?? 'text-blue-400';
  const glowClass = colors?.glow ?? '';

  return (
    <div
      className={cn(
        'mx-10 px-6 py-4 rounded-2xl border-2 backdrop-blur-sm',
        'flex items-start gap-3',
        'animate-in fade-in slide-in-from-top-4 duration-500',
        borderClass, bgClass, glowClass
      )}
    >
      <Gavel size={20} className={cn('shrink-0 mt-0.5', textClass)} />
      <p className={cn('text-lg font-bold italic leading-relaxed', textClass)}>
        「{text}」
      </p>
    </div>
  );
}

/**
 * 宣判階段碎碎念觸發器
 * 在 Stage 6 渲染時自動觸發一次判決碎碎念（利用 useEffect 確保只觸發一次）。
 */
function VerdictMurmurTrigger({
  triggerMurmur,
  isSuccess,
}: {
  triggerMurmur: (trigger: MurmurTrigger) => void;
  isSuccess?: boolean;
}) {
  const hasFired = useRef(false);
  useEffect(() => {
    if (!hasFired.current) {
      hasFired.current = true;
      triggerMurmur(isSuccess ? 'verdict_innocent' : 'verdict_guilty');
    }
  }, []);
  return null;
}
