'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import type { RoleType } from '@/types/game';
import { Briefcase, ChevronUp, Lock, Zap, Star, MessageSquare } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS 動態組合工具
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { ROLE_DATA, COLOR_MAP, HR_UI_TEXT } from '@/data/roles/RoleData';

interface HRShopProps {
  onActionResult: (res: { success: boolean; message: string }) => void; // 向上層打報告：這次黑箱招募的完整結果
}

/**
 * 地下人才黑市 (HR Shop)
 * 這是一個讓總裁們能夠揮霍大把金錢與人脈，秘密招募頂尖律師或精算師來幫自己擦屁股的市場。
 * 天下沒有白吃的午餐，每次挖角升級都要固定砸下：100 點影響力 + 100 萬黑錢 + 1 點行動體力。
 */
export default function HRShop({ onActionResult }: HRShopProps) {
  // 從系統後台金庫調出現在這位大老闆的身家報表
  const { players, currentPlayerIndex, upgradeRole } = useGameStore();
  const player = players[currentPlayerIndex];

  // 破產者無權點餐：如果這位玩家已經鋃鐺入獄或身敗名裂，立刻對他關閉這扇黑市大門。
  if (!player) return null;

  // 砸錢買人的下單流程
  const handleUpgrade = (role: RoleType) => {
    // 把這筆人口買賣的交易請求送交給核心引擎進行無情的財力審查
    const result = upgradeRole(role);
    // 把交易結果回傳給父層，由父層決定是顯示在日誌還是跳出錯誤彈窗
    onActionResult(result);
  };

  return (
    // 暗網載入中：讓這個地下市場優雅且神祕地從螢幕下方浮現出來
    <div className="flex-1 min-h-0 overflow-y-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pr-2 custom-scrollbar">
      {/* 黑市招牌與你的保險箱餘額 */}
      {/* 原版資源提示樣式：顯示目前擁有的 IP, G 與升級所需固定成本 */}
      <div className="text-center space-y-2 mb-4">
        <p className="text-xl text-blue-400 font-black uppercase tracking-widest mt-1">
          {HR_UI_TEXT.COST_DESC}
        </p>
        <div className="flex justify-center gap-10 text-lg font-black uppercase">
          <span className="text-blue-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            IP: {player.ip}
          </span>
          <span className="text-emerald-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
            G: {player.g} 萬
          </span>
          <span className="text-purple-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
            AP: {player.ap}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 翻開人力資料夾：把會計師、公關專員、王牌律師的全息履歷卡全部印出來 */}
        {ROLE_DATA.map((role) => {
          // 調查履歷：看這位總裁已經把這個部門擴編到第幾階了（滿編三階）
          const currentLv = Number(player.roles?.[role.key]) || 0;
          const colors = COLOR_MAP[role.color];
          // 冰冷的刷卡機判斷：這個貪婪的老闆是不是已經買到頂了？他戶頭的錢跟人脈還夠不夠買下一個階級？
          const canBuy = currentLv < 3 && player.ip >= 100 && player.g >= 100;
          // 這支特戰部隊是否已經擴編到了武裝到牙齒的境界
          const isMaxed = currentLv >= 3;
          const Icon = role.icon;

          return (
            <div
              key={role.key}
              className={cn(
                'group relative flex flex-col p-4 rounded-[32px] transition-all duration-700',
                'backdrop-blur-3xl border-2',
                colors.bg, // 使用主題色透明背景，避免全黑
                colors.border,
                // 原汁原味的高亮度發光陰影，比照玩家卡片的設計語言
                role.color === 'amber' && 'shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]',
                role.color === 'pink' && 'shadow-[0_0_40px_-10px_rgba(236,72,153,0.4)]',
                role.color === 'emerald' && 'shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
                role.color === 'blue' && 'shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]',
                'hover:-translate-y-3 hover:bg-black/40', // Hover 時稍微加深以突顯內容
                'hover:ring-4 hover:ring-white/10',
                role.color === 'amber' && 'hover:shadow-[0_0_60px_-5px_rgba(245,158,11,0.6)]',
                role.color === 'pink' && 'hover:shadow-[0_0_60px_-5px_rgba(236,72,153,0.6)]',
                role.color === 'emerald' && 'hover:shadow-[0_0_60px_-5px_rgba(16,185,129,0.6)]',
                role.color === 'blue' && 'hover:shadow-[0_0_60px_-5px_rgba(59,130,246,0.6)]'
              )}
            >
              {/* 背景彩色漸層：解決「框裡面是黑的」的關鍵，對齊玩家卡片的通透感 */}
              <div
                className={cn(
                  'absolute inset-0 opacity-20 pointer-events-none rounded-[40px]',
                  role.color === 'amber' &&
                    'bg-gradient-to-br from-amber-500/30 via-transparent to-amber-500/10',
                  role.color === 'pink' &&
                    'bg-gradient-to-br from-pink-500/30 via-transparent to-pink-500/10',
                  role.color === 'emerald' &&
                    'bg-gradient-to-br from-emerald-500/30 via-transparent to-emerald-500/10',
                  role.color === 'blue' &&
                    'bg-gradient-to-br from-blue-500/30 via-transparent to-blue-500/10'
                )}
              />
              {/* 卡片裝飾：側邊發光條，強化 3D 質感與品牌辨識度 */}
              <div
                className={cn(
                  'absolute left-0 top-12 bottom-12 w-1.5 rounded-r-full opacity-80 shadow-[4px_0_15px_rgba(0,0,0,0.2)]',
                  colors.bg
                )}
              />

              {/* 履歷表抬頭：秀出這個部門的威風名號與代表他們實力的星星 */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      'w-20 h-20 rounded-2xl border-2 shadow-inner transition-all group-hover:scale-110 duration-500 flex items-center justify-center shrink-0',
                      colors.bg,
                      'border-white/20'
                    )}
                  >
                    <span className="text-5xl drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                      {role.emoji}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-5 mb-2">
                      <span className="font-black text-4xl tracking-tighter text-white group-hover:text-blue-400 transition-colors">
                        {role.name}
                      </span>
                      <span
                        className={cn(
                          'text-xl font-black px-3 py-1.5 rounded-full border-2 uppercase tracking-[0.2em] shadow-lg',
                          colors.bg,
                          colors.border,
                          colors.text,
                          role.color === 'amber' && 'shadow-amber-500/20',
                          role.color === 'pink' && 'shadow-pink-500/20',
                          role.color === 'emerald' && 'shadow-emerald-500/20',
                          role.color === 'blue' && 'shadow-blue-500/20'
                        )}
                      >
                        LV {currentLv}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((lv) => (
                        <Star
                          key={lv}
                          size={18}
                          className={cn(
                            'transition-all duration-500',
                            lv <= currentLv ? colors.text : 'text-white/5'
                          )}
                          fill={lv <= currentLv ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 簽署合約的下單按鈕：更有份量感的實體設計 */}
                <button
                  onClick={() => handleUpgrade(role.key)}
                  disabled={!canBuy || isMaxed}
                  className={cn(
                    'px-6 py-1.5 rounded-full font-black text-xl uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2',
                    isMaxed
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                      : canBuy
                        ? cn(
                            'text-black animate-pulse',
                            role.color === 'amber' &&
                              'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]',
                            role.color === 'pink' &&
                              'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.6)]',
                            role.color === 'emerald' &&
                              'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]',
                            role.color === 'blue' &&
                              'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                          )
                        : cn(
                            'cursor-not-allowed border',
                            role.color === 'amber' &&
                              'bg-amber-500/10 text-amber-500/50 border-amber-500/30',
                            role.color === 'pink' &&
                              'bg-pink-500/10 text-pink-500/50 border-pink-500/30',
                            role.color === 'emerald' &&
                              'bg-emerald-500/10 text-emerald-500/50 border-emerald-500/30',
                            role.color === 'blue' &&
                              'bg-blue-500/10 text-blue-500/50 border-blue-500/30'
                          )
                  )}
                >
                  {isMaxed ? 'MAXED' : 'UPGRADE'}
                </button>
              </div>

              {/* 核心技能清單：垂直條列式，強化立體感與去扁平化展示 */}
              <div className="flex-1 flex flex-col gap-2">
                {role.levels.map((lv, idx) => {
                  const lvNum = idx + 1;
                  const isUnlocked = lvNum <= currentLv;
                  const isNext = lvNum === currentLv + 1;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-start gap-3 p-2 rounded-xl transition-all duration-500 border',
                        isUnlocked
                          ? [
                              'bg-white/10 border-white/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]',
                              role.color === 'amber' &&
                                'shadow-[0_0_25px_rgba(245,158,11,0.35)] border-amber-500/60',
                              role.color === 'pink' &&
                                'shadow-[0_0_25px_rgba(236,72,153,0.35)] border-pink-500/60',
                              role.color === 'emerald' &&
                                'shadow-[0_0_25px_rgba(16,185,129,0.35)] border-emerald-500/60',
                              role.color === 'blue' &&
                                'shadow-[0_0_25px_rgba(59,130,246,0.35)] border-blue-500/60',
                            ]
                          : isNext
                            ? cn(
                                'bg-white/5 border-2 border-dashed shadow-[0_0_20px_rgba(255,255,255,0.1)]',
                                role.color === 'amber' &&
                                  'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)]',
                                role.color === 'pink' &&
                                  'border-pink-500/50 shadow-[0_0_25px_rgba(236,72,153,0.2)]',
                                role.color === 'emerald' &&
                                  'border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]',
                                role.color === 'blue' &&
                                  'border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.2)]'
                              )
                            : 'bg-black/40 border-white/10 opacity-30 ring-1 ring-inset ring-white/5'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-1 p-2 rounded-lg border flex items-center justify-center shrink-0',
                          isUnlocked
                            ? colors.bg + ' border-white/20'
                            : 'bg-slate-800 border-white/5'
                        )}
                      >
                        {isUnlocked ? (
                          <Zap size={20} className="text-white fill-current" />
                        ) : (
                          <Lock size={16} className="text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                            <MessageSquare size={20} />
                            特質描述
                          </span>
                          {isUnlocked && (
                            <span
                              className={cn(
                                'text-xl font-black px-4 py-2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest'
                              )}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-black leading-relaxed text-white drop-shadow-sm">
                          {lv.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
