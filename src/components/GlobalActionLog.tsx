'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { History, Hash, Clock, User, Tag as TagIcon, FileText } from 'lucide-react';
import { CARDS_DB } from '../data/cards/CardsDB';

/**
 * 遊戲紀錄顯示區域
 * 負責顯示所有玩家過去做過的行動紀錄。
 */
export default function GlobalActionLog() {
  // 從資料庫拿取所有紀錄與玩家名單
  const actionLogs = useGameStore((s) => s.actionLogs);
  const players = useGameStore((s) => s.players);

  // 如果遊戲剛開始，顯示空狀態
  if (actionLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
        <History size={48} />
        <p className="mt-4 font-black uppercase tracking-widest text-xs">No Actions Recorded</p>
      </div>
    );
  }

  // 反向排序：將最新的紀錄顯示在最上方
  const reversedLogs = [...actionLogs].reverse();

  return (
    // 紀錄列表容器
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {reversedLogs.map((log) => {
        // 找到這則紀錄是哪個玩家產生的
        const player = players.find((p) => p.id === log.playerId);
        // 解析紀錄標籤
        const tags = log.tags ? log.tags.split(',') : [];

        return (
          // 單筆紀錄顯示區塊
          <div
            key={log.hash} // 終極鐵證：用絕對無法偽造的區塊鏈 Hash 碼來鎖死這個操作陣列
            className="group relative bg-[#0d1117] border border-white/5 rounded-2xl p-4 transition-all hover:border-blue-500/30 hover:bg-blue-900/5"
          >
            {/* 檔案頁首：無情地寫下嫌疑犯在幾點幾分、第幾回合鑄下大錯 */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <User size={16} />
                </div>
                <div>
                  <div className="text-xs font-black text-white leading-none mb-1">
                    {player?.name || '未知企業'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} />
                    Turn {log.turn} • {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* 右上角的密碼學簽章：留下作案卡牌代號與一小段密麻的 Hash 碼來震懾內鬼 */}
              <div className="flex flex-col items-end">
                <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase">
                  Card: {log.cardId}
                </div>
                <div className="text-[8px] font-mono text-slate-400 mt-1 flex items-center gap-1 group-hover:text-blue-500/50 transition-colors">
                  <Hash size={8} />
                  {log.hash.substring(0, 12)}...
                </div>
              </div>
            </div>

            {/* 案情回放區：還原當時他面對誘惑時到底按下了哪顆會下地獄的按鈕 */}
            <div className="pl-10 space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-black text-white flex items-center gap-2">
                  <FileText size={12} className="text-blue-400" />
                  {/* 調閱檔案室：查出這張作案卡牌本來的標題名字是什麼 */}
                  {(() => {
                    const card = CARDS_DB[log.cardId];
                    return card ? card.title : `未知行動 (${log.cardId})`;
                  })()}
                </p>
                {/* 呈堂證供：他選填的這句狡辯與動作 */}
                <p className="text-[11px] text-slate-400 leading-relaxed pl-5 border-l border-white/10 ml-1.5">
                  {(() => {
                    const card = CARDS_DB[log.cardId];
                    const opt = card ? card[log.optionIndex as 1 | 2 | 3] : null;
                    return opt ? opt.label : `執行了選項 ${log.optionIndex}`;
                  })()}
                </p>
              </div>

              {/* 定罪結印：如果這步棋讓他沾上了犯罪嫌疑，就用血滴子般的紅色印記狠狠貼在他臉上 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black text-red-500 uppercase tracking-tighter"
                    >
                      <TagIcon size={8} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
