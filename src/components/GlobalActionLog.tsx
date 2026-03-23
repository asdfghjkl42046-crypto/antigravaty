'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { History, Hash, Clock, User, Tag as TagIcon, FileText } from 'lucide-react';
import { CARDS_DB } from '../data/cards/CardsDB';

/**
 * 暗網行動追蹤日誌 (Global Action Log)
 * 專門給駭客跟國稅局看的交易流水帳。
 * 畫面上會赤裸裸地展示這局所有總裁幹過的骯髒事、被法院貼上的恥辱標籤，
 * 以及用最高規格密碼學防護過的、絕對無法竄改湮滅的 Hash 犯罪鐵證。
 */
export default function GlobalActionLog() {
  // 駭入核心伺服器，把所有的黑箱作業紀錄全倒出來
  const { actionLogs, players } = useGameStore();

  // 無罪推定狀態：如果遊戲剛開始，大家都還是清新的白紙，就給個空蕩蕩的畫面
  if (actionLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
        <History size={48} />
        <p className="mt-4 font-black uppercase tracking-widest text-xs">No Actions Recorded</p>
      </div>
    );
  }

  // 反向追蹤：把最新幹下的壞事推到最上面，以方便檢調單位即時追緝
  const reversedLogs = [...actionLogs].reverse();

  return (
    // 高壓的無盡卷軸：限制視窗高度，讓滿滿的犯罪紀錄只能在裡面擁擠地滾動
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {reversedLogs.map((log) => {
        // 抓出元兇：從嫌疑犯清單中比對，揪出到底是哪個總裁簽下這份提案
        const player = players.find((p) => p.id === log.playerId);
        // 罪狀解析：把這筆案子夾帶的「內線交易」、「做假帳」標籤給拆解剝離出來
        const tags = log.tags ? log.tags.split(',') : [];

        return (
          // 單筆犯罪檔案：當滑鼠掃過時，背景會閃著如同警車巡邏般的藍色微光
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
