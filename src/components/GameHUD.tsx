'use client'; // 儀表板需要無時無刻監聽最新戰況，必須在客端即時渲染

import React from 'react';
import { Scale, LogOut, Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JUDGE_LABELS } from '../data/judges/JudgeTemplatesDB';
import type { JudgePersonality } from '@/types/game';
import { GLOBAL_UI_TEXT } from '@/data/system/GlobalUI';
import { COURT_TEXT } from '@/data/court/CourtData';

// 戰情室抬頭顯示器 (HUD) 匯流排：接收來自核心引擎的最高機密參數
interface GameHUDProps {
  turn: number; // 死亡倒數記號：目前商業版圖的推進回合數
  judgePersonality: JudgePersonality | null; // 幕後黑手：今天到底是哪一位戴著假髮的 AI 判官在地獄法庭坐鎮？
  onReset: () => void; // 掀桌按鈕：直接毀滅這條時間線，全員破產重來
  onDebug?: () => void; // 上帝模式開關：給神明（開發者）走後門專用的作弊控制台
}

/**
 * 最高指揮所抬頭顯示器 (Game HUD)
 * 就像是無間道裡警局與黑幫天台上的對講機。
 * 負責在遊戲的最上方，無情地提醒你死線什麼時候到，還有今天盯著你們看的法官是誰。
 */
export default function GameHUD({ turn, judgePersonality, onReset, onDebug }: GameHUDProps) {
  return (
    // 防爆玻璃穹頂：將這條戰情列死死訂在畫面最上方，任憑下面殺得血流成河也不會動搖
    <nav className="sticky top-0 z-50 px-6 py-4 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
      {/* 判官席位監視器：告訴你今天最高法院是誰在當家 */}
      <div className="flex items-center gap-4">
        {/* 象徵絕對權力的琥珀色法官名牌，自帶威臨天下的壓迫感 */}
        <div className="pl-3 pr-6 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-10 transition-all hover:bg-amber-500/20 shadow-sm">
          {/* 從不公平的法律天平標誌 */}
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/40">
            <Scale size={22} className="text-white" />
          </div>
          {/* 銘刻著判官稱號的文字碑 */}
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-amber-500/80 uppercase tracking-[0.3em] leading-none mb-1.5">
              {COURT_TEXT.JUDGE_TITLE}
            </span>
            {/* 系統解碼：把冷冰冰的代碼翻譯成讓全場肅然起敬的法官尊稱 */}
            <span className="font-black text-xl tracking-wider text-amber-500">
              {judgePersonality &&
              (JUDGE_LABELS as Record<string, { judgeName: string }>)[judgePersonality]
                ? ` ${(JUDGE_LABELS as Record<string, { judgeName: string }>)[judgePersonality].judgeName} `
                : GLOBAL_UI_TEXT.GAME_HUD.SYSTEM_PREPARING}
            </span>
          </div>
        </div>
      </div>

      {/* 倒數計時器與緊急逃生口：隨著局勢越發危險，這裡會越來越紅 */}
      <div className="flex items-center gap-6">
        {/* 死亡螺旋計時器：告訴總裁們剩下的壽命還有幾回合 */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            Current Turn
          </span>
          <span
            // 溫水煮青蛙特效：越靠近 50 回合的死線，顏色就越像警報器一樣轉為閃爍的血紅
            className={cn(
              'text-2xl font-black tracking-tighter',
              turn >= 45
                ? 'text-red-400 animate-pulse'
                : turn >= 40
                  ? 'text-amber-400'
                  : 'text-blue-400'
            )}
          >
            ROUND {turn}/50
          </span>
        </div>

        {/* 視覺分隔線 */}
        <div className="h-8 w-px bg-white/10" />

        {/* Matrix 的後門漏洞：只有造物主(開發者)才能看得到並使用的神秘蟲洞按鈕 */}
        {onDebug && (
          <button
            onClick={onDebug}
            title="開啟外掛工具 (Debug)"
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-red-500 transition-colors"
          >
            <Bug size={20} />
          </button>
        )}

        {/* 洗錢滅證按鈕：按下去後，這局所有的記憶與紀錄將被無情抹除，彷彿一切從未發生 */}
        <button
          onClick={onReset}
          title="重置系統"
          aria-label="重置系統"
          className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
