'use client';

import React from 'react';
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
  return (
    // 左側側板基底畫布：設定寬度為限制區間，如果大螢幕擴寬至 640px，套用毛玻璃浮動特效背景並允許當玩家超過兩人時可以垂直捲動 (overflow-y-auto)
    <aside className="w-[320px] xl:w-[640px] flex-shrink-0 bg-[#0d1117]/80 backdrop-blur-sm border border-white/5 p-4 rounded-3xl flex flex-col gap-4 overflow-y-auto shadow-xl custom-scrollbar">
      {/* 側邊情報網的霸氣抬頭 */}
      <h2 className="text-xl font-black tracking-tighter uppercase italic text-blue-500">
        {PLAYER_UI_TEXT.SIDEBAR.TITLE}
      </h2>

      {/* 將這些勾心鬥角的總裁們像戰利品一樣並排展示出來 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {players.map((p, i) => {
          // 聚光燈鎖定：這回合到底是哪個大老闆在呼風喚雨？
          const isCurrent = i === currentPlayerIndex;

          return (
            <div
              key={p.id} // React 陣列用身分證防亂圖
              className={cn(
                // 每一張單人專屬卡片的通用基底樣式框架
                'p-5 rounded-[32px] border-2 transition-all duration-500 relative overflow-hidden group',
                // 權力者的光芒：當輪到他發號施令時，整張情報卡會霸道地往前浮出，並散放充滿野心的金橘色光暈！
                isCurrent
                  ? 'bg-amber-500/10 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.2)] md:scale-[1.02] z-10'
                  : 'bg-white/5 border-white/5 opacity-50'
              )}
            >
              {/* 【特效元件】如果有行動權限，在卡片四射的背景上啟動雷射霓虹光流動的劇烈呼吸動畫 (animate-pulse) */}
              {isCurrent && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-50 animate-pulse pointer-events-none" />
              )}

              {/* 卡片姓名銘牌標頭：顯示企業註冊全名與他們當年選配的家世路線檔次 */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-sm font-black text-slate-200">{p.name}</span>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                    {/* 揭露他那見不得光的真實出身階級 */}
                    {p.startPath ? START_PATH_NAMES[p.startPath as StartPath] : ''}
                  </p>
                </div>

                {/* 暴發戶專屬的高調皇冠徽章，閃瞎其他人的狗眼 */}
                {isCurrent && (
                  <div className="text-xs xl:text-sm font-black px-4 py-1.5 rounded-full bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] tracking-widest animate-pulse">
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
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 font-mono">
                      {PLAYER_UI_TEXT.SIDEBAR.TOTAL_CAPITAL}
                    </span>
                    <div className="flex items-baseline gap-1">
                      {/* 套用前面做好的那顆有精緻加減跳動動畫的專門數值組件 (牽扯金錢的就亮綠燈) */}
                      <StatValue
                        value={p.g}
                        suffix={PLAYER_UI_TEXT.SIDEBAR.CURRENCY_UNIT}
                        color="text-emerald-400"
                        fontSize="text-xl"
                      />
                    </div>
                  </div>

                  {/* 恥辱的法院凍結款：只有當你真正被法官扒過層皮，這筆見不得光的押金才會浮現在眾人眼前供人恥笑。 */}
                  {p.trustFund > 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest mb-1 font-mono">
                        {PLAYER_UI_TEXT.SIDEBAR.TRUST_FUND}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <StatValue
                          value={p.trustFund}
                          suffix={PLAYER_UI_TEXT.SIDEBAR.CURRENCY_UNIT}
                          color="text-amber-400"
                          fontSize="text-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 軍火庫底牌揭露：把影響力、清白度、體力還有黑料，直接攤在陽光下 */}
                <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
                  {/* IP: 專門用來跟政府喬事情的人際關係影響力點數 */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1.5">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.IP}
                    </span>
                    <StatValue value={p.ip ?? 0} color="text-amber-400" fontSize="text-sm" />
                  </div>
                  {/* RP: 決定這間公司會不會受媒體寵愛或唾棄的社會名譽清白度 */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1.5">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.RP}
                    </span>
                    <StatValue value={p.rp} color="text-blue-400" fontSize="text-sm" />
                  </div>
                  {/* AP: 本周剩下的體力工作時數，抽卡發牌與做壞事都會劇烈燃燒 */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1.5">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.AP}
                    </span>
                    <StatValue value={p.ap} color="text-purple-400" fontSize="text-sm" />
                  </div>
                  {/* BM (Black Materials): 非常致命且會招致特偵組直接登門起訴的底層犯罪指數黑洞 */}
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-500 uppercase leading-none mb-1.5">
                      {PLAYER_UI_TEXT.SIDEBAR.STAT_LABELS.BM}
                    </span>
                    {/* 查水表行動：調閱他犯下的所有罪狀，加總成致命的黑料指數 (BM) 等待引爆！ */}
                    <StatValue
                      value={getTotalBlackMaterials(p)}
                      color="text-rose-400"
                      fontSize="text-sm"
                    />
                  </div>
                </div>

                {/* 恥辱柱與犯罪博物館：這裡血淋淋地展示了這位總裁這輩子幹過的所有骯髒事，如果同一個罪名犯太多次，還會貼心幫你加上 xN 倍率。 */}
                {p.tags && p.tags.length > 0 && (
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
                      {PLAYER_UI_TEXT.SIDEBAR.CRIMINAL_RECORDS}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {/* 罪名濃縮器：把厚厚一疊性質相同的案底歸檔成同一個文件夾 */}
                      {Object.values(
                        p.tags.reduce(
                          (acc, tag) => {
                            const key = tag.text;
                            if (!acc[key]) {
                              acc[key] = { text: tag.text, count: 0, isResolved: true };
                            }
                            // 遇到同名的犯罪歷史又跑出來，就在計數器硬上加一
                            acc[key].count += 1;
                            // 連帶血債：只要這個犯罪名目下還有一筆沒繳清的罰單，這個人就休想脫離這片滿江紅的犯罪通緝榜！
                            if (!tag.isResolved) acc[key].isResolved = false;
                            return acc;
                          },
                          {} as Record<string, { text: string; count: number; isResolved: boolean }>
                        )
                      ).map((group, gIdx) => (
                        <span
                          key={gIdx}
                          title={group.text} // 滑鼠懸停顯示原意避免縮寫看不懂
                          // 根據洗錢被抓到的罪名罪孽深度配給藍紅底板與小圖示裝飾
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all',
                            'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                          )}
                        >
                          <TagIcon size={8} />
                          {/* 最長限制80像素，超過的就喀擦掉斷尾以求保持優雅的 UI 弧線 */}
                          <span className="truncate max-w-[80px]">{group.text}</span>
                          {/* xN 表示他在同一個坑重複跌了多少次 (用更小且半透明的微縮字體在標籤後面點綴) */}
                          {group.count > 1 && (
                            <span className="ml-0.5 px-1 bg-white/10 rounded text-[8px] opacity-70">
                              x{group.count}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
