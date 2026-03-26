'use client'; // 宣告為客端渲染元件，因為內部有支援互動事件 (onClick)

import React from 'react';
import { Card } from '../types/game';
import { CARD_UI_TEXT } from '../data/cards/CardsDB';
import { Gavel, Scale, MousePointer2, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * UI 動態迷彩拼接工具
 * 神不知鬼不覺地把各種樣貌的 CSS 外衣縫合在一起，確保沒有任何畫面穿幫
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 印卡機內部規格合約：這張事件卡需要吃什麼樣的祭品才能發動
interface ActionCardProps {
  cardId: string; // 獨一無二的專利編號 (例如 投資卡 A-01)
  card: Card; // 卡牌背後裝載的血肉與劇情
  onSelect: (optionIdx: 1 | 2 | 3) => void; // 當老闆狠狠點下那三個按鈕之一時，向總部匯報的通訊專線
  disabled?: boolean; // 體力榨乾防護鎖：當這位總裁累癱時，把整張卡片變成灰色禁止再亂動
  playerRp?: number; // (潛藏指標) 紀錄名聲清白度，未來用於解鎖某些黑心隱藏選項
}

/**
 * 投資決策提案卡 (Action Card)
 * 將實體的紙牌數位化，並在畫面上華麗地展開這份「提案報告書」。
 * 上半部描繪了充滿商戰情境的起承轉合，下半部則是殘酷的三選一：你要當個好人還是走歪路？
 */
export default function ActionCard({ cardId, card, onSelect, disabled }: ActionCardProps) {
  // 幫派識別碼：依照卡片首字母 (A到E) 幫整張卡片換上對應的勢力色彩濾鏡
  const type = cardId.charAt(0);
  const themeColors =
    {
      A: 'border-blue-500/30 bg-blue-900/10 text-blue-400', // 商業行動區：科技藍
      B: 'border-emerald-500/30 bg-emerald-900/10 text-emerald-400', // 民生區：鈔票綠
      C: 'border-purple-500/30 bg-purple-900/10 text-purple-400', // 政府特權區：貴族紫
      D: 'border-amber-500/30 bg-amber-900/10 text-amber-400', // 走私黑市：警示黃
      E: 'border-slate-500/30 bg-slate-900/10 text-slate-300', // 法律事務所：低調灰
    }[type] || 'border-slate-700 bg-slate-800 text-slate-300'; // 防呆預設色彩

  // 把冰冷的英文字母解碼成充滿煙硝味的實體地盤名稱 (例如：走私海港、市政黑箱)
  const typeNames = CARD_UI_TEXT.CARD_TYPES[type] || CARD_UI_TEXT.TYPE_DEFAULT;

  return (
    // 提案文件外框：當滑鼠移上去時，整張報表會浮起並且散發野心勃勃的陰影反光
    <div
      className={cn(
        'relative group overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20',
        themeColors,
        'flex flex-col h-full'
      )}
    >
      {/* 提案書頂端那道極具震懾感、如同雷射般掃過的高級防偽漸層線 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />

      {/* 提案書封面：交代這次投資案的來龍去脈與故事背景 */}
      <div className="p-5 pb-2">
        <div className="flex justify-between items-start mb-2">
          {/* 機密代號區：標示這份文件屬於哪個堂口，以及它的出廠編碼 */}
          <span className="px-3 py-1 rounded-lg text-xl font-black uppercase tracking-wider bg-white/10">
            {typeNames} | {cardId}
          </span>
          <Gavel size={16} className="opacity-40" />
        </div>

        {/* 新聞頭條等級的巨大標題字串 */}
        <h3 className="text-3xl font-black text-white mb-4 leading-tight">
          {card.title || CARD_UI_TEXT.DEFAULT_TITLE}
        </h3>

        {/* 劇情交代區：為了不讓懶得看字的老闆抓狂，這裡強制把所有廢話裁剪到最多 3 行以內 */}
        <p className="text-xl text-slate-300 font-medium line-clamp-3 line-clamp-standard-3 leading-relaxed min-h-[6rem]">
          {card.description || CARD_UI_TEXT.DEFAULT_DESC}
        </p>
      </div>

      {/* 命運的十字路口：三個讓你又愛又恨的投資決策按鈕，選錯可能隨時送你進監獄 */}
      <div className="p-4 pt-0 space-y-3 mt-auto">
        {/* 人生沒有無限選項，這裡鐵律就是硬刻三個按鈕出來給你選 */}
        {[1, 2, 3].map((idx) => {
          const opt = card[idx as 1 | 2 | 3];
          if (!opt) return null; // [防禦性渲染]：若卡片數據缺失該選項，直接跳過不渲染，防止 undefined 崩潰
          return (
            <button
              key={idx}
              // 大老闆蓋章授權！把簽字的選項 (1到3) 派信差送去給總戰情室 (page.tsx) 處理結算
              onClick={async () => await onSelect(idx as 1 | 2 | 3)}
              disabled={disabled}
              // 賦予按鈕像真的按下去一樣的微縮反饋手感，如果你沒體力了，就把它狠狠反灰鎖死
              className={cn(
                'w-full text-left p-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-200',
                'hover:bg-white/10 hover:border-white/20 active:scale-[0.98]',
                'disabled:opacity-40 disabled:cursor-not-allowed group/btn',
                'relative overflow-hidden'
              )}
            >
              <div className="flex justify-between items-center mb-1">
                {/* 掩人耳目的糖衣包裝：讓這個骯髒的決議看起來像是在「做公益」或是「專案維護」 */}
                <span className="text-xl font-black px-3 py-1.5 rounded text-slate-300 bg-slate-800/50">
                  {CARD_UI_TEXT.DEFAULT_OPTION(idx)}
                </span>
                <div className="flex gap-5 items-center text-xl font-black uppercase tracking-widest transition-colors text-purple-400 group-hover/btn:text-purple-300">
                  <span className="flex items-center gap-2">
                    <Zap size={14} className="fill-current" />
                    {opt.ap || 1} AP
                  </span>
                  {opt.costG && (
                    <span className="flex items-center gap-1 text-emerald-400 group-hover/btn:text-emerald-300">
                      {opt.costG} G
                    </span>
                  )}
                </div>
              </div>

              {/* 白話翻譯機：撕開糖衣，告訴老闆按下去實際上會扣多少體力、賺多少黑錢 */}
              <p className="text-2xl text-slate-100 font-black line-clamp-2 line-clamp-standard-2 leading-tight mt-1">
                {opt.label || CARD_UI_TEXT.DEFAULT_ACTION_DESC}
              </p>

              {/* 心機的互動特效：當你猶豫要不要按滑鼠游標飄過去時，右側會亮起一條像是刀鋒般的科技漸層光晕 */}
              <div className="absolute inset-y-0 right-0 w-1 bg-current opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* 提案書頁尾封籤：放個天平圖示裝逼，時刻提醒你這場商戰步步驚心，充滿法律風險 */}
      <div className="px-5 py-3 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xl font-black uppercase tracking-widest opacity-60">
          <Scale size={20} />
          <span>{CARD_UI_TEXT.RISK_ASSESSMENT}</span>
        </div>
        <MousePointer2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
