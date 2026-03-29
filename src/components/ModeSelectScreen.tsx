'use client'; // 包含 onClick 互動事件，必須在客端註冊處理

import { Scale } from 'lucide-react';
import type { JudgeMode } from '@/types/game';
import { SETUP_TEXT } from '@/data/setup/SetupData';

// 對外接單合約：通知指揮總部 (page.tsx) 玩家選擇了哪一條不歸路
interface ModeSelectScreenProps {
  onSelect: (mode: JudgeMode) => void;
}

/**
 * 遊戲模式選擇畫面
 * 讓玩家選擇要使用 AI 法官連線，還是原本的純網頁模式。
 */
export default function ModeSelectScreen({ onSelect }: ModeSelectScreenProps) {
  return (
    // 深海壓迫感浮現：透過極慢速的放大動畫，將這個抉擇沉重地壓在玩家面前
    <div className="max-w-4xl w-full space-y-12 animate-in fade-in zoom-in duration-700 py-12 text-center select-none">
      {/* 傾斜的最高法院天平標誌：一開始就暗示這場遊戲裡沒有絕對的公平 */}
      <div className="space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl mx-auto mb-6 rotate-12">
          <Scale size={48} className="text-white" />
        </div>
        <h1 className="text-5xl font-black italic text-white flex items-center justify-center gap-4 uppercase tracking-tighter">
          {SETUP_TEXT.MODE_SELECT.TITLE_MAIN}{' '}
          <span className="text-blue-500">{SETUP_TEXT.MODE_SELECT.TITLE_SUB}</span>
        </h1>
        <p className="text-slate-200 font-medium text-lg">{SETUP_TEXT.MODE_SELECT.PROMPT}</p>
      </div>

      {/* 魔鬼的左右手：兩種截然不同的受苦體驗 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 溫室路線：連線內建的固定規則裁判，免付 API 保護費，適合只想過把癮的新少爺（採用寧靜藍） */}
        <button
          onClick={() => onSelect('website')}
          className="group relative p-10 bg-[#0d1117] border-2 border-white/5 hover:border-blue-500/50 rounded-[40px] text-left transition-all hover:scale-[1.02] shadow-xl hover:shadow-blue-500/10 overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black">{SETUP_TEXT.MODE_SELECT.WEBSITE_TITLE}</h3>
            <p className="text-slate-200 text-sm italic font-medium">
              {SETUP_TEXT.MODE_SELECT.WEBSITE_DESC}
            </p>
            <div className="w-full py-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-center font-black text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase tracking-widest text-xs">
              {SETUP_TEXT.MODE_SELECT.WEBSITE_BTN}
            </div>
          </div>
        </button>

        {/* 硬核連線路線：強制接管！真正的 AI 大模型要在雲端對你做出最變態、最隨機的制裁！（採用生化警告綠） */}
        <button
          onClick={() => onSelect('ai')}
          className="group relative p-10 bg-[#0d1117] border-2 border-white/5 hover:border-emerald-500/50 rounded-[40px] text-left transition-all hover:scale-[1.02] shadow-xl hover:shadow-emerald-500/10 overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-black">{SETUP_TEXT.MODE_SELECT.AI_TITLE}</h3>
            <p className="text-slate-200 text-sm italic font-medium">
              {SETUP_TEXT.MODE_SELECT.AI_DESC}
            </p>
            <div className="w-full py-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-center font-black text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-all uppercase tracking-widest text-xs">
              {SETUP_TEXT.MODE_SELECT.AI_BTN}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
