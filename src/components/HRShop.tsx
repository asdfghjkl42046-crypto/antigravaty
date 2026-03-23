'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import type { RoleType } from '@/types/game';
import { Briefcase, ChevronUp, Lock, Zap, Star } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS 動態組合工具
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { ROLE_DATA, COLOR_MAP, HR_UI_TEXT } from '@/data/roles/RoleData';

interface HRShopProps {
  onMessage: (msg: string) => void; // 向上層打報告：這次黑箱招募到底是成功了還是資金不足被搞砸了？
}

/**
 * 地下人才黑市 (HR Shop)
 * 這是一個讓總裁們能夠揮霍大把金錢與人脈，秘密招募頂尖律師或精算師來幫自己擦屁股的市場。
 * 天下沒有白吃的午餐，每次挖角升級都要固定砸下：100 點影響力 + 100 萬黑錢 + 1 點行動體力。
 */
export default function HRShop({ onMessage }: HRShopProps) {
  // 從系統後台金庫調出現在這位大老闆的身家報表
  const { players, currentPlayerIndex, upgradeRole } = useGameStore();
  const player = players[currentPlayerIndex];

  // 破產者無權點餐：如果這位玩家已經鋃鐺入獄或身敗名裂，立刻對他關閉這扇黑市大門。
  if (!player) return null;

  // 砸錢買人的下單流程
  const handleUpgrade = (role: RoleType) => {
    // 把這筆人口買賣的交易請求送交給核心引擎進行無情的財力審查
    const result = upgradeRole(role);
    // 把交易結果（歡慶成功或是被笑窮逼）甩在上面的系統跑馬燈公諸於世
    onMessage(result.message);
  };

  return (
    // 暗網載入中：讓這個地下市場優雅且神祕地從螢幕下方浮現出來
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 黑市招牌與你的保險箱餘額 */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 rounded-2xl border border-white/10">
          <Briefcase size={20} className="text-blue-400" />
          <h2 className="text-xl font-black tracking-tight uppercase">{HR_UI_TEXT.TITLE}</h2>
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          {HR_UI_TEXT.COST_DESC}
        </p>
        <div className="flex justify-center gap-6 text-xs font-bold">
          {/* 殘酷地提醒你現在手頭緊不緊（這裡只收影響力與現金） */}
          <span className="text-blue-400">IP: {player.ip}</span>
          <span className="text-emerald-400">G: {player.g} 萬</span>
        </div>
      </div>

      {/* 人才貨架區：各種能幫你做盡壞事的高級知識份子一字排開 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 翻開人力資料夾：把會計師、公關專員、王牌律師的全息履歷卡全部印出來 */}
        {ROLE_DATA.map((role) => {
          // 調查履歷：看這位總裁已經把這個部門擴編到第幾階了（滿編三階）
          const currentLv = Number(player.roles?.[role.key]) || 0;
          // 給每個部門換上符合他們調性的專屬制服顏色
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
                'p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group',
                colors.bg,
                colors.border
              )}
            >
              {/* 履歷表抬頭：秀出這個部門的威風名號與代表他們實力的星星 */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2.5 rounded-xl', colors.bg, 'border', colors.border)}>
                    <Icon size={20} className={colors.text} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm tracking-tight text-white">
                        {role.emoji} {role.name}
                      </span>
                    </div>
                    {/* 花錢砸出來的榮譽徽章：用實心發亮的星星無情地展現財力 */}
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1, 2, 3].map((lv) => (
                        <Star
                          key={lv}
                          size={12}
                          className={cn(
                            'transition-colors',
                            lv <= currentLv ? colors.text : 'text-white/10'
                          )}
                          fill={lv <= currentLv ? 'currentColor' : 'none'}
                        />
                      ))}
                      <span className={cn('text-[10px] font-black ml-1 uppercase', colors.text)}>
                        LV{currentLv}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 簽署合約的下單按鈕 */}
                {isMaxed ? (
                  // 部門已經滿編了，無情地把這顆按鈕上鎖封死
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Lock size={10} />
                    {HR_UI_TEXT.MAX_LEVEL}
                  </div>
                ) : (
                  // 還有擴張空間？那就依據這位總裁的財力來決定這顆按鈕是要閃爍誘人的光芒還是黯淡無光
                  <button
                    onClick={() => handleUpgrade(role.key)}
                    disabled={!canBuy}
                    className={cn(
                      'px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95',
                      canBuy
                        ? cn('bg-white text-black hover:shadow-lg', `hover:${colors.glow}`)
                        : 'bg-white/5 text-slate-400 border border-white/5 cursor-not-allowed'
                    )}
                  >
                    <ChevronUp size={14} />
                    {HR_UI_TEXT.UPGRADE_BTN(currentLv + 1)}
                  </button>
                )}
              </div>

              {/* 合約細項條款：這支團隊到底能為你在商戰中提供什麼樣的恐怖火力（技能樹） */}
              <div className="space-y-2">
                {role.levels.map((lv, idx) => {
                  const lvNum = idx + 1;
                  const isUnlocked = lvNum <= currentLv; // 已經被你用錢砸開的特權，用全亮的顏色炫耀
                  const isNext = lvNum === currentLv + 1; // 畫大餅時間：下一次升級你能嚐到的甜頭，用半透明線條誘惑你

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex items-start gap-2.5 px-3 py-2 rounded-xl transition-all text-xs',
                        isUnlocked
                          ? cn('bg-white/5 border border-white/10', '')
                          : isNext
                            ? 'bg-white/[0.02] border border-dashed border-white/10 opacity-70'
                            : 'opacity-30' // 遙不可及的高階機密，全部打入冷宮極度暗化
                      )}
                    >
                      <div
                        className={cn(
                          'shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase',
                          isUnlocked ? cn(colors.badge, 'text-white') : 'bg-white/10 text-slate-400'
                        )}
                      >
                        {lv.type}
                      </div>
                      <div>
                        {/* 白話翻譯：這些西裝暴徒到底能幫你幹嘛？ */}
                        <span
                          className={cn(
                            'font-bold leading-snug',
                            isUnlocked ? 'text-slate-200' : 'text-slate-400'
                          )}
                        >
                          LV{lvNum}：{lv.desc}
                        </span>
                        {isUnlocked && (
                          <span className={cn('ml-2 text-[10px] font-black', colors.text)}>
                            <Zap size={10} className="inline" /> {HR_UI_TEXT.UNLOCKED}
                          </span>
                        )}
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
