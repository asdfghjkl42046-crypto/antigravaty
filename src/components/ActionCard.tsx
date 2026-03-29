'use client'; // 宣告為客端渲染元件，因為內部有支援互動事件 (onClick)

import React from 'react';
import { Card } from '../types/game';
import { CARD_UI_TEXT } from '../data/cards/CardsDB';
import { Gavel, Scale, MousePointer2, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 畫面樣式拼接工具
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 行動卡片的內容設定
interface ActionCardProps {
  cardId: string; // 卡片編號
  card: Card; // 卡片內的內容
  onSelect: (optionIdx: 1 | 2 | 3) => void; // 當玩家點選選項時要通知系統
  disabled?: boolean; // 是否禁用這張卡（例如沒體力時）
  playerRp?: number; // 玩家名聲 (未來擴充用)
}

/**
 * 投資決策卡片
 * 顯示卡片的標題、內容描述，以及三個可以點選的選項按鈕。
 */
export default function ActionCard({ cardId, card, onSelect, disabled }: ActionCardProps) {
  // 根據卡片首字母決定主題色彩
  const type = cardId.charAt(0);
  const themeColors =
    {
      A: 'border-blue-500/30 bg-blue-900/10 text-blue-400',
      B: 'border-emerald-500/30 bg-emerald-900/10 text-emerald-400',
      C: 'border-purple-500/30 bg-purple-900/10 text-purple-400',
      D: 'border-amber-500/30 bg-amber-900/10 text-amber-400',
      E: 'border-slate-500/30 bg-slate-900/10 text-slate-300',
    }[type] || 'border-slate-700 bg-slate-800 text-slate-300';

  // 取得對應類型的顯示名稱
  const typeNames = CARD_UI_TEXT.CARD_TYPES[type] || CARD_UI_TEXT.TYPE_DEFAULT;

  return (
    // 卡片的外框容器
    <div
      className={cn(
        'relative group overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20',
        themeColors,
        'flex flex-col h-full'
      )}
    >
      {/* 頂部漸層裝飾線 */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />

      {/* 卡片內容區域 */}
      <div className="p-5 pb-2">
        <div className="flex justify-between items-start mb-2">
          {/* 類型與 ID 標籤 */}
          <span className="px-3 py-1 rounded-lg text-xl font-black uppercase tracking-wider bg-white/10">
            {typeNames} | {cardId}
          </span>
          <Gavel size={16} className="opacity-40" />
        </div>

        {/* 新聞頭條等級的巨大標題字串 */}
        <h3 className="text-3xl font-black text-white mb-4 leading-tight">
          {card.title || CARD_UI_TEXT.DEFAULT_TITLE}
        </h3>

        {/* 劇情描述區，限制顯示行數 */}
        <p className="text-xl text-slate-300 font-medium line-clamp-3 line-clamp-standard-3 leading-relaxed min-h-[6rem]">
          {card.description || CARD_UI_TEXT.DEFAULT_DESC}
        </p>
      </div>

      {/* 選項列表 */}
      <div className="p-4 pt-0 space-y-3 mt-auto">
        {/* 渲染三個決策選項 */}
        {[1, 2, 3].map((idx) => {
          const opt = card[idx as 1 | 2 | 3];
          if (!opt) return null; // [防禦性渲染]：若卡片數據缺失該選項，直接跳過不渲染，防止 undefined 崩潰
          return (
            <button
              key={idx}
              // 執行選項選擇回呼
              onClick={async () => await onSelect(idx as 1 | 2 | 3)}
              disabled={disabled}
              // 按鈕樣式及禁用狀態處理
              className={cn(
                'w-full text-left p-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-200',
                'hover:bg-white/10 hover:border-white/20 active:scale-[0.98]',
                'disabled:opacity-40 disabled:cursor-not-allowed group/btn',
                'relative overflow-hidden'
              )}
            >
              <div className="flex justify-between items-center mb-1">
                {/* 選項索引標籤 */}
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

              {/* 選項描述文案 */}
              <p className="text-2xl text-slate-100 font-black line-clamp-2 line-clamp-standard-2 leading-tight mt-1">
                {opt.label || CARD_UI_TEXT.DEFAULT_ACTION_DESC}
              </p>

              {/* 懸停視覺特效 */}
              <div className="absolute inset-y-0 right-0 w-1 bg-current opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* 底部風險評估標籤 */}
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
