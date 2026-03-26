'use client';

import React, { useState } from 'react';
import { Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatValue from './StatValue';
import { getTotalBlackMaterials } from '@/engine/GameEngine';
import type { Player, StartPath } from '@/types/game';
import { PLAYER_UI_TEXT } from '@/data/player/PlayerData';
import { START_PATH_NAMES } from '@/data/setup/SetupData';

// 暗網情報站的通訊接口：隨時攔截場上總裁們的戶頭餘額跟官司狀態
interface PlayerSidebarProps {
  players: Player[]; // 這局存活/破產的所有參賽者陣列
  currentPlayerIndex: number; // 目前擁有「發動回合權力」的活躍玩家索引值，指向陣列位置
}

/**
 * 總裁財報監視側邊欄 (Player Sidebar)
 * 就算是最骯髒的地下金流，也會毫無保留地展示在這個情報看板上。
 * 讓你能隨時死命關注對手的口袋有多深、黑料累積了幾疊，以及他們是不是已經窮到買不起會計師了。
 */
export default function PlayerSidebar({ players, currentPlayerIndex }: PlayerSidebarProps) {
  // 追蹤哪個玩家的犯罪前科下拉選單正在展開
  const [openTagPlayer, setOpenTagPlayer] = useState<string | null>(null);

  return (
    // 左側側板基底畫布：固定寬度為 900px，以容納 2x2 的優化玩家資訊矩陣
    <aside className="w-[900px] mt-44 flex-shrink-0 bg-[#0d1117]/80 backdrop-blur-sm border border-white/5 p-2 rounded-[40px] flex flex-col gap-4 overflow-y-auto shadow-2xl custom-scrollbar">
      {/* 側邊情報網的霸氣抬頭 */}
      <h2 className="text-xl font-black tracking-tighter uppercase italic text-blue-500">
        {PLAYER_UI_TEXT.SIDEBAR.TITLE}
      </h2>

      {/* 回歸 2x2 矩陣排版，將所有參賽者的情報一覽無遺 */}
      <div className="grid grid-cols-2 gap-4">
        {players.map((p, i) => {
          // 聚光燈鎖定：這回合到底是哪個大老闆在呼風喚雨？
          const isCurrent = i === currentPlayerIndex;

          return (
            <div
              key={p.id} // React 陣列用身分證防亂圖
              className={cn(
                // 每一張單人專屬卡片的通用基底樣式框架
                'p-5 rounded-[32px] border-2 transition-all duration-500 relative group',
                // 權力者的光芒：當輪到他發號施令時，整張情報卡會霸道地往前浮出，並散放充滿野心的金橘色光暈！
                isCurrent
                  ? 'bg-amber-500/10 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.2)] md:scale-[1.02] z-10'
                  : 'bg-white/5 border-white/5 opacity-50',
                // 如果該玩家的犯罪標籤正在展開，則強制拉高層級，避免下拉選單被後面的卡片蓋住
                openTagPlayer === p.id ? 'z-30 opacity-100' : ''
              )}
            >
              {/* 【特效元件】如果有行動權限，在卡片四射的背景上啟動雷射霓虹光流動的劇烈呼吸動畫 (animate-pulse) */}
              {isCurrent && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-50 animate-pulse pointer-events-none rounded-[32px]" />
              )}

              {/* 卡片姓名銘牌標頭：顯示企業註冊全名與他們當年選配的家世路線檔次 */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-2xl font-black text-slate-200">{p.name}</span>
                  <p
                    className={cn(
                      'text-base font-bold tracking-wider',
                      p.startPath === 'normal'
                        ? 'text-amber-400'
                        : p.startPath === 'backdoor'
                          ? 'text-cyan-400'
                          : 'text-red-400'
                    )}
                  >
                    {/* 揭露他那見不得光的真實出身階級 */}
                    {p.startPath ? START_PATH_NAMES[p.startPath as StartPath] : ''}
                  </p>
                </div>

                {/* 暴發戶專屬的高調皇冠徽章，閃瞎其他人的狗眼 */}
                {isCurrent && (
                  <div className="text-sm xl:text-base font-black px-5 py-2 rounded-full bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] tracking-widest animate-pulse">
                    {PLAYER_UI_TEXT.SIDEBAR.NOW_PLAYING}
                  </div>
                )}
              </div>

              {/* ===================== 本局重頭戲：核心五大財務指標面板 ===================== */}
              <div className="space-y-4 relative z-10">
                {/* 現金流檢視區：看他到底是富可敵國，還是隨時會跳票倒閉？ */}
                <div className="flex justify-between border-t border-white/5 pt-4">
                  {/* 可用活期現金池 (G) */}
                  <div className="flex flex-col">
                    <span className="text-[15px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">
                      {PLAYER_UI_TEXT.SIDEBAR.TOTAL_CAPITAL}
                    </span>
                    <div className="flex items-baseline gap-1">
                      {/* 套用前面做好的那顆有精緻加減跳動動畫的專門數值組件 (牽扯金錢的就亮綠燈) */}
                      <StatValue
                        value={p.g}
                        suffix={PLAYER_UI_TEXT.SIDEBAR.CURRENCY_UNIT}
                        color="text-emerald-400"
                        fontSize="text-4xl"
                      />
                    </div>
                  </div>

                  {/* 恥辱的法院凍結款：只有當你真正被法官扒過層皮，這筆見不得光的押金才會浮現在眾人眼前供人恥笑。 */}
                  {p.trustFund > 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-black text-amber-500/80 uppercase tracking-widest mb-1 font-mono">
                        {PLAYER_UI_TEXT.SIDEBAR.TRUST_FUND}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <StatValue
                          value={p.trustFund}
                          suffix={PLAYER_UI_TEXT.SIDEBAR.CURRENCY_UNIT}
                          color="text-amber-400"
                          fontSize="text-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 軍火庫底牌揭露：把影響力、清白度、體力還有黑料，直接攤在陽光下 */}
                <div className="grid grid-cols-4 gap-4 border-t border-white/5 pt-6">
                  {/* IP: 專門用來跟政府喬事情的人際關係影響力點數 */}
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-500 uppercase leading-none mb-3 whitespace-nowrap">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.IP}
                    </span>
                    <StatValue value={p.ip ?? 0} color="text-amber-400" fontSize="text-3xl" />
                  </div>
                  {/* RP: 決定這間公司會不會受媒體寵愛或唾棄的社會名譽清白度 */}
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-500 uppercase leading-none mb-3 whitespace-nowrap">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.RP}
                    </span>
                    <StatValue value={p.rp} color="text-blue-400" fontSize="text-3xl" />
                  </div>
                  {/* BM (Black Materials): 非常致命且會招致特偵組直接登門起訴的底層犯罪指數黑洞 */}
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-500 uppercase leading-none mb-3 whitespace-nowrap">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.BM}
                    </span>
                    <StatValue
                      value={getTotalBlackMaterials(p)}
                      color="text-rose-400"
                      fontSize="text-3xl"
                    />
                  </div>
                  {/* AP: 每週消耗之行動體力時數，顯示為 當前/上限 */}
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-500 uppercase leading-none mb-3 whitespace-nowrap">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.AP}
                    </span>
                    <div className="flex items-baseline gap-1 text-purple-400">
                      <span className="text-4xl font-black tracking-tighter">{p.ap}</span>
                      <span className="text-2xl font-black opacity-60">/ 5</span>
                    </div>
                  </div>
                </div>

                {/* 犯罪前科：下拉覆蓋式展開選單 */}
                {p.tags &&
                  p.tags.length > 0 &&
                  (() => {
                    // 預先濃縮犯罪標籤
                    const grouped = Object.values(
                      p.tags.reduce(
                        (acc, tag) => {
                          const sourceSuffix = tag.multiplierSource
                            ? ` (${tag.multiplierSource})`
                            : '';
                          const key = tag.text + sourceSuffix;
                          if (!acc[key]) {
                            acc[key] = {
                              text: tag.text,
                              count: 0,
                              isResolved: true,
                              source: tag.multiplierSource,
                            };
                          }
                          acc[key].count += 1;
                          if (!tag.isResolved) acc[key].isResolved = false;
                          return acc;
                        },
                        {} as Record<
                          string,
                          { text: string; count: number; isResolved: boolean; source?: string }
                        >
                      )
                    );

                    return (
                      <div className="pt-4 border-t border-white/5 relative">
                        {/* 可點擊的標題列：顯示犯罪數量與展開箭頭 */}
                        <button
                          onClick={() => setOpenTagPlayer(openTagPlayer === p.id ? null : p.id)}
                          title={`展開${p.name}的犯罪前科`}
                          className="w-full flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <span className="text-[15px] font-black text-rose-500 uppercase tracking-widest font-mono">
                            {PLAYER_UI_TEXT.SIDEBAR.CRIMINAL_RECORDS}
                          </span>
                          <span className="text-xs font-black text-rose-600 flex items-center gap-1">
                            {p.tags.length} 筆
                            <span
                              className={cn(
                                'transition-transform duration-300 inline-block',
                                openTagPlayer === p.id ? 'rotate-180' : ''
                              )}
                            >
                              ▾
                            </span>
                          </span>
                        </button>

                        {/* 覆蓋式下拉面板：absolute 定位，不推移下方內容 */}
                        {openTagPlayer === p.id && (
                          <div className="absolute left-0 right-0 top-full mt-2 z-50 p-4 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-wrap gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                              {grouped.map((group, gIdx) => (
                                <span
                                  key={gIdx}
                                  title={group.text}
                                  className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-lg font-black uppercase tracking-tighter border transition-all',
                                    'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                                  )}
                                >
                                  <TagIcon size={8} />
                                  <span>{group.text}</span>
                                  {group.source && (
                                    <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1 rounded ml-1">
                                      {group.source}
                                    </span>
                                  )}
                                  {group.count > 1 && (
                                    <span className="ml-1.5 px-2 py-0.5 bg-black/40 rounded-md text-sm font-mono border border-white/10 opacity-90">
                                      x{group.count}
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
