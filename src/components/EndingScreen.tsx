'use client'; // 強制元件在使用者瀏覽器觸發，因為有動畫屬性(animate-in)

import React from 'react';
import { Trophy, Award, Lock, Building2, Banknote, AlertTriangle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Player, EndingResult } from '@/types/game';

// 大結局成績單傳遞介面：判官會送來什麼樣的下場
interface EndingScreenProps {
  result: EndingResult; // 由核心引擎宣判的最終命運與罪狀
  players: Player[]; // 所有的參賽者清單，方便對照看誰笑到最後
  onReset: () => void; // 洗牌重來的時光機：如果破產了不甘心，就按下這個重來一次
}

/**
 * 金權帝國大結局與清算畫面 (Ending Screen)
 * 這是一翻兩瞪眼的法庭終局宣判！
 * 當有人成功統治了商界，或因為資金斷鏈倒閉時，這個畫面會用最戲劇化的方式，冷酷地為這場遊戲畫下句點。
 */
export default function EndingScreen({ result, players, onReset }: EndingScreenProps) {
  // 帝國命運圖鑑：為大善人、大魔王或是破產小丑準備了各自專屬的顏色與圖騰
  const configMap: Record<
    string,
    { color: string; border: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    // 聖人路線：踩著合法防線的虛偽慈善家
    saint: {
      color: 'text-yellow-400',
      border: 'border-yellow-500/40',
      bg: 'bg-yellow-500/5',
      icon: <Trophy size={64} />,
      label: '傳說級結局',
    },
    // 總裁路線：不擇手段吸乾全城財富的商界寡頭
    dragonhead: {
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/5',
      icon: <Award size={64} />,
      label: '優勝結局',
    },
    // 死局路線：周轉不靈被法院法拍的階下囚
    bankrupt: {
      color: 'text-red-400',
      border: 'border-red-500/40',
      bg: 'bg-red-500/5',
      icon: <Lock size={64} />,
      label: '慘敗結局',
    },
  };

  // 無趣的普通下場：要死不死、要活不活的平庸收尾
  const config = configMap[result.type] || {
    color: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    icon: <Building2 size={64} />,
    label: '標準結局',
  };

  return (
    // 命運降臨特效：用充滿壓迫感的極慢速動畫，將宣判書狠狠砸在螢幕上
    <div className="max-w-xl w-full text-center space-y-10 animate-in zoom-in duration-700 select-none">
      {/* 外框設計：依照成敗給予華麗的包裝或是悲慘的囚籠 */}
      <div
        className={cn(
          'p-12 rounded-[50px] border-4 bg-opacity-10 backdrop-blur-xl flex flex-col items-center space-y-8 shadow-2xl',
          config.border,
          config.bg
        )}
      >
        {/* 象徵榮耀或恥辱的巨型徽章 */}
        <div className={cn('p-8 rounded-[40px] bg-white/5 border border-white/10', config.color)}>
          {config.icon}
        </div>

        {/* 極具衝擊力的結局主標題 */}
        <div className="space-y-2">
          <p className={cn('font-black uppercase tracking-widest text-xs', config.color)}>
            {config.label}
          </p>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase">{result.title}</h1>
        </div>

        {/* 墓誌銘與榮譽榜：刻上這位首腦的名字與他被歷史賦予的最終稱號 */}
        <div className="py-2 px-6 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
          <span className="font-bold text-slate-300">
            {players.find((p) => p.id === result.playerId)?.name}
          </span>
          {/* 優雅的分隔小圓點 */}
          <div className="w-1 h-1 rounded-full bg-slate-500 mx-1" />
          <span className={cn('font-black text-[10px]', config.color)}>
            稱號：{result.evaluation}
          </span>
        </div>

        {/* 判決主文：由歷史紀錄親自朗讀你是怎麼爬上來、或是怎麼摔下去的 */}
        <p className="text-slate-400 leading-relaxed text-lg">{result.description}</p>

        {/* 財產清算單：把所有的黑錢、被罰款的數字、跟你殘存的名譽一次攤開 */}
        <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-white/10">
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">總資金</p>
            <p className="text-emerald-400 font-black text-lg flex items-center justify-center gap-1">
              <Banknote size={16} />
              {result.stats.totalProfit} 萬
            </p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">總罰金</p>
            <p className="text-red-400 font-black text-lg flex items-center justify-center gap-1">
              <AlertTriangle size={16} />
              {result.stats.totalFines} 萬
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">殘餘名譽 (RP)</p>
            <p className="text-blue-400 font-black text-lg flex items-center justify-center gap-1">
              <Star size={16} />
              {result.stats.finalRp}
            </p>
          </div>
        </div>

        {/* 讀檔重來按鈕：這場夢醒了，還要不要再來一把更黑心的？ */}
        <button
          onClick={onReset}
          className={cn(
            'w-full py-6 text-white font-black rounded-[30px] transition-all uppercase tracking-widest active:scale-95 shadow-xl shadow-black/50',
            // 情緒渲染：如果破產了，毫不留情地用血紅色警告你的人生失敗了
            result.type === 'bankrupt' ? 'bg-red-600' : 'bg-blue-600'
          )}
        >
          重返人生
        </button>
      </div>
    </div>
  );
}
