'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Building2,
  Eye,
  Settings2,
  Check,
  Wallet,
  Star,
  Zap,
  Gem,
  Award,
} from 'lucide-react';
import gsap from 'gsap';
import { PlayerConfig, StartPath, BribeItem } from '@/types/game';
import AlignmentTool, { AlignmentElement } from './AlignmentTool';

// 定義天賦類型，對齊全域 StartPath
type Talent = 'self-made' | 'financed' | 'blackbox';

interface PlayerRegistrationScreenProps {
  playerIndex: number;
  totalPlayers: number;
  onConfirm: (config: PlayerConfig) => void;
  onBack: () => void;
}

/**
 * 天賦選擇卡片組件
 */
interface TalentCardProps {
  type: Talent;
  title: string;
  sub: string;
  money: string;
  rp: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

function TalentCard({
  type,
  title,
  sub,
  money,
  rp,
  icon,
  isActive,
  onClick,
  className,
}: TalentCardProps) {
  const getThemeColor = () => {
    switch (type) {
      case 'self-made':
        return 'rgba(59, 130, 246, 0.5)';
      case 'financed':
        return 'rgba(168, 85, 247, 0.5)';
      case 'blackbox':
        return 'rgba(245, 158, 11, 0.5)';
      default:
        return 'rgba(59, 130, 246, 0.5)';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-4 border-2 transition-all cursor-pointer group rounded-[22px]
        talent-${type}
        ${isActive ? 'talent-active scale-[1.02]' : 'talent-inactive hover:border-white/20'}
        ${className}
      `}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600/20 text-white' : 'bg-white/5 text-slate-500'}`}
        >
          {icon}
        </div>
        <div>
          <h4
            className={`text-lg font-black transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}
          >
            {title}
          </h4>
          <p className="text-[8px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
            {sub}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end space-y-1 ml-auto">
        <div className="flex items-center space-x-2">
          <span className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-0.5">
            <Wallet className="w-2 h-2" /> 資金
          </span>
          <span className={`text-sm font-black ${isActive ? 'text-white' : 'text-slate-400'}`}>
            {money}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-0.5">
            <Star className="w-2 h-2" /> 名聲
          </span>
          <span
            className={`text-sm font-black ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            {rp}
          </span>
        </div>
      </div>

      {isActive && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-3 h-3 text-white" strokeWidth={4} />
        </div>
      )}
    </div>
  );
}

export default function PlayerRegistrationScreen({
  playerIndex,
  totalPlayers,
  onConfirm,
  onBack,
}: PlayerRegistrationScreenProps) {
  const [isDesignMode, setIsDesignMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentName, setCurrentName] = useState('');
  const [isReady, setIsReady] = useState(false); // 動畫完成前禁止點擊提交
  const [selectedTalent, setSelectedTalent] = useState<Talent>('self-made');
  const [showBribeModal, setShowBribeModal] = useState(false);
  const [selectedBribe, setSelectedBribe] = useState<BribeItem | null>(null);

  const BRIBE_OPTIONS: {
    id: BribeItem;
    name: string;
    icon: any;
    desc: string;
    color: string;
    glow: string;
  }[] = [
    {
      id: 'antique',
      name: '傳世古董',
      icon: Shield,
      desc: '歲月洗禮的價值，專為愛好古物的保守派準備。',
      color: 'text-amber-400',
      glow: 'rgba(251, 191, 36, 0.4)',
    },
    {
      id: 'crypto',
      name: '虛擬貨幣',
      icon: Wallet,
      desc: '區塊鏈上的無名財金，用於繞過傳統監管的最佳利器。',
      color: 'text-cyan-400',
      glow: 'rgba(34, 211, 238, 0.4)',
    },
    {
      id: 'art',
      name: '名家油畫',
      icon: Gem,
      desc: '流動的美學與財富，適合與追求品味的高層建立連結。',
      color: 'text-fuchsia-400',
      glow: 'rgba(217, 70, 239, 0.4)',
    },
    {
      id: 'wine',
      name: '特供紅酒',
      icon: Zap,
      desc: '微醺間的利益交換，酒桌文化中永不退流行的籌碼。',
      color: 'text-rose-400',
      glow: 'rgba(244, 63, 94, 0.4)',
    },
    {
      id: 'intel',
      name: '機密情報',
      icon: Award,
      desc: '掌握他人的軟肋，是談判桌上最有份量的武器。',
      color: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
  ];

  // 將 UI 的人才稱呼轉換為引擎路徑標章
  const mapTalentToPath = (talent: Talent): StartPath => {
    switch (talent) {
      case 'self-made':
        return 'normal';
      case 'financed':
        return 'backdoor';
      case 'blackbox':
        return 'blackbox';
      default:
        return 'normal';
    }
  };

  // 初始原子佈局數據 (v5.0 極致顆粒度)
  const [layout, setLayout] = useState<Record<string, AlignmentElement>>({
    header_title: {
      top: 11.146861196550637,
      left: 5.857142857142858,
      width: 40.95238095238095,
      height: 5.450473984635475,
      fontSize: 25,
      label: '經營權登記',
      radius: 0,
    },
    player_badge: {
      top: 12.8,
      left: 52, // 往左移騰出空間
      width: 44, // 放寬以容納文字
      height: 5.373815038411312,
      fontSize: 12,
      label: 'PLAYER X/Y',
      radius: 100,
    },
    back_btn: {
      top: 5,
      left: 6,
      width: 12,
      height: 6,
      radius: 18,
      label: '返回按鈕',
    },
    logo: {
      top: 4.587855488476606,
      left: 81.28571428571429,
      width: 14.857142857142858,
      height: 7.511196542252443,
      radius: 18,
      label: 'LOGO 區',
    },

    input_label: {
      top: 17.862618496158866,
      left: 10.238095238095237,
      width: 28,
      height: 4.373815038411312,
      fontSize: 19,
      label: '企業名稱',
    },
    input_field: {
      top: 22.511196542252442,
      left: 10,
      width: 79.04761904761904,
      height: 5.252369923177377,
      radius: 16,
      fontSize: 14,
      label: '輸入框容器',
    },

    // T1 原子
    t1_box: {
      top: 29,
      left: 10,
      width: 84,
      height: 10,
      radius: 22,
      label: 'T1 背景框',
    },
    t1_name: {
      top: 30.5,
      left: 15.52857142857143,
      width: 30,
      height: 4,
      fontSize: 18,
      label: '一、白手起家', // 引用自背景故事標題
    },
    t1_money: {
      top: 31,
      left: 70,
      width: 14,
      height: 3,
      fontSize: 14,
      label: '100 萬',
    },
    t1_money_label: {
      top: 31.741173380924934,
      left: 60.5,
      width: 8,
      height: 2,
      fontSize: 8,
      label: '資金',
    },
    t1_rp: {
      top: 34.5,
      left: 70,
      width: 14,
      height: 3,
      fontSize: 14,
      label: '105 RP',
    },
    t1_rp_label: {
      top: 34.80473984635475,
      left: 60.5,
      width: 8,
      height: 2,
      fontSize: 8,
      label: '名聲',
    },

    // T2 原子
    t2_box: {
      top: 40,
      left: 10,
      width: 84,
      height: 10,
      radius: 22,
      label: 'T2 背景框',
    },
    t2_name: {
      top: 41.5,
      left: 15.5,
      width: 30,
      height: 4,
      fontSize: 18,
      label: '二、融資創業', // 引用自背景故事標題
    },
    t2_money: {
      top: 42,
      left: 70,
      width: 14,
      height: 3,
      fontSize: 14,
      label: '250 萬',
    },
    t2_money_label: {
      top: 42.7,
      left: 60.5,
      width: 8,
      height: 2,
      fontSize: 8,
      label: '資金',
    },
    t2_rp: {
      top: 45.5,
      left: 70,
      width: 14,
      height: 3,
      fontSize: 14,
      label: '90 RP',
    },
    t2_rp_label: {
      top: 45.8,
      left: 60.5,
      width: 8,
      height: 2,
      fontSize: 8,
      label: '名聲',
    },

    // T3 原子
    t3_box: {
      top: 51,
      left: 10,
      width: 84,
      height: 10,
      radius: 22,
      label: 'T3 背景框',
    },
    t3_name: {
      top: 52.5,
      left: 15.5,
      width: 30,
      height: 4,
      fontSize: 18,
      label: '三、家族企業', // 引用自背景故事標題
    },
    t3_money: {
      top: 53,
      left: 70,
      width: 14,
      height: 3,
      fontSize: 14,
      label: '400 萬',
    },
    t3_money_label: {
      top: 53.7,
      left: 60.5,
      width: 8,
      height: 2,
      fontSize: 8,
      label: '資金',
    },
    t3_rp: {
      top: 56.5,
      left: 70,
      width: 14,
      height: 3,
      fontSize: 14,
      label: '75 RP',
    },
    t3_rp_label: {
      top: 56.8,
      left: 60.5,
      width: 8,
      height: 2,
      fontSize: 8,
      label: '名聲',
    },

    char: {
      top: 62.124468112045754,
      left: 0,
      width: 100,
      height: 20,
      label: '角色插畫',
    },
    submit: {
      top: 83.32902886940154,
      left: 15,
      width: 70,
      height: 8,
      radius: 999,
      fontSize: 14,
      label: '提交按鈕',
    },
  });

  // 提交按鈕 ref，用於獨立動畫控制
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // [修正] 切換玩家時重置所有暫存狀態
    setCurrentName('');
    setSelectedTalent('self-made');
    setSelectedBribe(null);
    setShowBribeModal(false);
    setIsReady(false);

    if (containerRef.current && !isDesignMode) {
      // 確保提交按鈕在動畫開始時完全隱藏
      if (submitRef.current) {
        gsap.set(submitRef.current, { opacity: 0, x: 20, pointerEvents: 'none' });
      }

      // 其餘元素的 stagger 進場動畫
      gsap.fromTo(
        '.reg-animate',
        { opacity: 0, x: 20 },
        {
          opacity: 1, x: 0, duration: 0.4, ease: 'power3.out',
          onComplete: () => {
            // 全部元素動畫完成後，才讓提交按鈕獨立淡入
            setIsReady(true);
            if (submitRef.current) {
              gsap.fromTo(
                submitRef.current,
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', pointerEvents: 'auto' }
              );
            }
          },
        }
      );
    }
  }, [playerIndex, isDesignMode]);

  // 動態定位類別注入 (支援 v5.0 原子化編輯器)
  const layoutStyles = `
    ${Object.entries(layout)
      .map(
        ([id, el]) => `
      .${id}-pos { 
        top: ${el.top}%; 
        left: ${el.left}%; 
        width: ${el.width}%; 
        height: ${el.height}%; 
        border-radius: ${el.radius || 0}px !important; 
        font-size: ${el.fontSize || 14}px !important; 
        position: absolute !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
    `
      )
      .join('\n')}
    
    /* 人才專屬顏色定義 */
    .talent-self-made { --talent-color: #3b82f6; }
    .talent-financed { --talent-color: #8b5cf6; }
    .talent-blackbox { --talent-color: #f59e0b; }

    .talent-active { border-color: var(--talent-color) !important; background: color-mix(in srgb, var(--talent-color) 15%, transparent) !important; box-shadow: 0 0 20px color-mix(in srgb, var(--talent-color) 30%, transparent) !important; }
    .talent-inactive { border-color: rgba(255, 255, 255, 0.05) !important; background: transparent !important; }

    /* 賄賂道具專屬螢光樣式 (動態生成) */
    ${BRIBE_OPTIONS.map(
      (opt) => `
      .bribe-glow-${opt.id} {
        box-shadow: 0 0 15px ${opt.glow} !important;
        border-color: ${opt.glow} !important;
      }
      .bribe-glow-modal-${opt.id} {
        box-shadow: 0 0 20px ${opt.glow} !important;
        border-color: ${opt.glow} !important;
      }
    `
    ).join('\n')}
  `;

  const handleNext = () => {
    onConfirm({
      name: currentName.trim() || `企業 ${playerIndex}`,
      path: mapTalentToPath(selectedTalent),
      bribeItem: selectedBribe || undefined,
    });
  };

  const handleBribeSelect = (bribe: BribeItem | null) => {
    setSelectedBribe(bribe);
    setShowBribeModal(false);
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-[#020617]">
      <style dangerouslySetInnerHTML={{ __html: layoutStyles }} />

      <div
        ref={containerRef}
        className="relative w-full h-full select-none text-white overflow-hidden flex flex-col items-center"
      >
        {/* 設計模式按鈕 */}
        <button
          onClick={() => setIsDesignMode(!isDesignMode)}
          className="absolute top-20 right-4 z-[2000] p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-white"
          title="切換排版模式"
        >
          {isDesignMode ? (
            <Eye className="w-5 h-5 text-emerald-400" />
          ) : (
            <Settings2 className="w-5 h-5" />
          )}
        </button>

        {/* 底層參考圖 (設計模式) */}
        {isDesignMode && (
          <img
            src="/ui/ref_player_registration.png"
            alt="Reference"
            className="absolute inset-0 w-full h-full object-contain opacity-40 pointer-events-none z-0"
          />
        )}

        {/* 背景 */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#020617]" />
          <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at:50%_40%,rgba(30,58,138,0.2)_0%,transparent:70%)]" />
        </div>

        {/* 標題與人員標記：原子化 */}
        {layout.back_btn && (
          <button
            onClick={onBack}
            title="返回"
            className="back_btn-pos bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md shadow-xl flex items-center justify-center reg-animate z-30"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
        )}

        {layout.logo && (
          <div className="logo-pos relative ui-animate z-30">
            <div className="w-full h-full rounded-2xl bg-transparent shadow-[0_0_25px_rgba(59,130,246,0.2)]">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 backdrop-blur-xl group">
                <video
                  src="/assets/logo_anim.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        )}

        {layout.header_title && (
          <h2 className="header_title-pos text-white font-black tracking-tight reg-animate">
            {layout.header_title.label}
          </h2>
        )}

        {layout.player_badge && (
          <div className="player_badge-pos px-2 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black tracking-widest flex items-center justify-center whitespace-nowrap reg-animate">
            PLAYER {playerIndex} / {totalPlayers}
          </div>
        )}

        {/* 內容區：疊加模式 (支援 v5.0 原子化編輯器) */}
        <div
          className={`absolute inset-0 z-20 pointer-events-none transition-all duration-500 ${isDesignMode ? 'opacity-40 grayscale blur-[0.5px]' : 'opacity-100'}`}
        >
          {/* 企業名稱輸入：原子化 */}
          {layout.input_label && (
            <label className="input_label-pos text-blue-400/80 font-black tracking-[0.2em] uppercase px-1 reg-animate">
              企業名稱
            </label>
          )}
          {layout.input_field && (
            <div className={`input_field-pos group reg-animate ${isReady ? 'pointer-events-auto' : 'pointer-events-none'}`}>
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder={`例如：九龍集團`}
                className="w-full h-full bg-[#0f172a]/80 border-2 border-white/5 rounded-[inherit] px-6 text-sm font-bold text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-[#0f172a]/95 transition-all outline-none"
              />
            </div>
          )}

          {/* 天賦組件原子化：完全展開 (v5.5 文字連動) */}
          {[1, 2, 3].map((num) => {
            const prefix = `t${num}`;
            if (!layout[`${prefix}_box`]) return null;

            const type = num === 1 ? 'self-made' : num === 2 ? 'financed' : 'blackbox';
            const isActive = selectedTalent === type;

            return (
              <React.Fragment key={prefix}>
                {/* 背景框 */}
                <div
                  onClick={() => {
                    setSelectedTalent(type as Talent);
                    if (type !== 'self-made') {
                      setShowBribeModal(true);
                    } else {
                      // 選擇白手起家時清空道具
                      setSelectedBribe(null);
                    }
                  }}
                  className={`
                      ${prefix}_box-pos border-2 transition-all cursor-pointer group talent-${type} ${isReady ? 'pointer-events-auto' : 'pointer-events-none'} reg-animate
                      ${isActive ? 'talent-active scale-[1.02]' : 'talent-inactive hover:border-white/20'}
                    `}
                />

                {/* 名稱 */}
                {layout[`${prefix}_name`] && (
                  <h4
                    className={`${prefix}_name-pos font-black transition-colors reg-animate ${isActive ? 'text-white' : 'text-slate-300'}`}
                  >
                    {layout[`${prefix}_name`].label}
                  </h4>
                )}

                {/* 副標 */}
                {layout[`${prefix}_sub`] && (
                  <p
                    className={`${prefix}_sub-pos font-bold tracking-widest text-slate-500 uppercase reg-animate`}
                  >
                    {layout[`${prefix}_sub`].label}
                  </p>
                )}

                {/* 資金標籤 */}
                {layout[`${prefix}_money_label`] && (
                  <span
                    className={`${prefix}_money_label-pos font-bold text-slate-500 uppercase flex items-center gap-0.5 reg-animate`}
                  >
                    {layout[`${prefix}_money_label`].label}
                  </span>
                )}

                {/* 資金數值 */}
                {layout[`${prefix}_money`] && (
                  <span
                    className={`${prefix}_money-pos font-black reg-animate ${isActive ? 'text-white' : 'text-slate-400'}`}
                  >
                    {layout[`${prefix}_money`].label}
                  </span>
                )}

                {/* 名聲標籤 */}
                {layout[`${prefix}_rp_label`] && (
                  <span
                    className={`${prefix}_rp_label-pos font-bold text-slate-500 uppercase flex items-center gap-0.5 reg-animate`}
                  >
                    {layout[`${prefix}_rp_label`].label}
                  </span>
                )}

                {/* 名聲數值 */}
                {layout[`${prefix}_rp`] && (
                  <span
                    className={`${prefix}_rp-pos font-black reg-animate ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}
                  >
                    {layout[`${prefix}_rp`].label}
                  </span>
                )}

                {/* 賄賂道具標籤回饋：僅在選中且非白手起家時顯示 */}
                {isActive && selectedBribe && type !== 'self-made' && (
                  <div
                    className={`${prefix}_box-pos pointer-events-none flex items-end justify-start p-3`}
                  >
                    <div
                      key={selectedBribe}
                      className={`bg-black/60 border px-3 py-1 rounded-lg backdrop-blur-md flex items-center space-x-2 animate-bounce-subtle bribe-glow-${selectedBribe}`}
                    >
                      {React.createElement(
                        BRIBE_OPTIONS.find((o) => o.id === selectedBribe)?.icon || Shield,
                        {
                          className: `w-3 h-3 ${BRIBE_OPTIONS.find((o) => o.id === selectedBribe)?.color}`,
                        }
                      )}
                      <span
                        className={`text-[9px] font-black tracking-widest uppercase ${BRIBE_OPTIONS.find((o) => o.id === selectedBribe)?.color}`}
                      >
                        已備妥：{BRIBE_OPTIONS.find((o) => o.id === selectedBribe)?.name}
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* 插畫層 (不隨文字原子移動) */}
          <div
            className={`absolute inset-0 z-10 pointer-events-none transition-opacity ${isDesignMode ? 'opacity-20' : 'opacity-100'}`}
          >
            {layout.char && (
              <div className="char-pos overflow-hidden flex items-end justify-center">
                <img
                  src="https://img.freepik.com/free-photo/portrait-successful-businessman-wearing-glasses_23-2148908920.jpg?t=st=1740320490~exp=1740324090~hmac=5693006198f3908f51a4f0099031ef660a92f8021118fbda0c6118fbda0c61"
                  alt="Representative"
                  className="h-full w-auto object-contain grayscale mix-blend-lighten"
                />
              </div>
            )}
          </div>

          {layout.submit && (
            <button
              ref={submitRef}
              onClick={handleNext}
              disabled={!isReady}
              className={`submit-pos bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black tracking-[0.3em] flex items-center justify-center group shadow-[0_8px_25px_rgba(37,99,235,0.4)] active:scale-95 transition-all cursor-pointer opacity-0 pointer-events-none`}
            >
              <span>{playerIndex === totalPlayers ? '開始冒險' : '下一位玩家'}</span>
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* 賄賂選擇彈窗 (黑箱準備) */}
        {showBribeModal && (
          <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
            <div className="relative w-full max-w-[360px] bg-slate-900/90 border border-white/10 rounded-[32px] p-8 overflow-hidden shadow-2xl">
              {/* 背景裝飾 */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-widest">初始預備手段</h3>
                </div>
                <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] mb-8 uppercase">
                  透過初始人脈準備一份「薄禮」來疏通法庭關係
                </p>

                <div className="space-y-4">
                  {BRIBE_OPTIONS.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleBribeSelect(item.id)}
                      className={`group flex items-center p-4 bg-white/5 border hover:bg-white/10 rounded-2xl transition-all cursor-pointer 
                        ${item.id === selectedBribe ? `bg-white/10 bribe-glow-modal-${item.id}` : 'border-white/5'}`}
                    >
                      <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-blue-500/10 transition-colors mr-4">
                        <item.icon className={`w-5 h-5 transition-colors ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-black mb-1 transition-colors ${item.color}`}>
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <p className="text-[9px] font-bold text-slate-600 tracking-[0.2em] uppercase">
                    ※ 選擇出身背景必須配套初始對位道具
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 排版工具容器 */}
        {isDesignMode && (
          <div className="absolute inset-0 z-[1000]">
            <AlignmentTool
              containerRef={containerRef}
              initialElements={layout}
              onUpdate={setLayout}
              renderElement={(id, el) => (
                <div className="w-full h-full border-2 border-dashed border-blue-400 bg-blue-600/10 flex flex-col items-center justify-center font-black text-[9px] text-blue-400">
                  <p className="uppercase">{id}</p>
                </div>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
