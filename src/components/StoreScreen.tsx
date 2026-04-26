import React from 'react';
import { ROLE_DATA, COLOR_MAP } from '../data/roles/RoleData';
import { useGameStore } from '../store/gameStore';
import { Users, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import type { Player, RoleType } from '../types/game';

interface RoleData {
  key: RoleType;
  name: string;
  emoji: string;
  icon: React.ElementType;
  color: string;
  levels: { type: string; desc: string }[];
}

/**
 * 個別人才卡片組件：高度色彩同步，按鈕與邊框根據職位螢光色呈現
 */
function TalentCard({ 
  role, 
  player, 
  upgradeRole 
}: { 
  role: RoleData; 
  player: Player; 
  upgradeRole: (roleKey: RoleType, splitOG?: number) => void 
}) {
  const [showDetail, setShowDetail] = React.useState(false);
  const [splitOG, setSplitOG] = React.useState(0);
  
  const currentLevel = player.roles?.[role.key] || 0;
  const isMax = currentLevel >= 3;
  const colors = COLOR_MAP[role.color];

  // 支付能力動態檢查：總費用 100M G + 100 IP
  const totalCostG = 100;
  const costIP = 100;
  
  // 計算滑桿限制區間
  // OG 支付上限 = min(100, 玩家現有 OG)
  // OG 支付下限 = max(0, 100 - 玩家現有 G) -> 若現金不足 100，則強迫必須使用部分 OG
  const maxPossibleOG = Math.min(totalCostG, player.trustFund || 0);
  const minPossibleOG = Math.max(0, totalCostG - (player.g || 0));
  const canAfford = player.ip >= costIP && (player.g + (player.trustFund || 0)) >= totalCostG;

  // 當開啟詳情時，預設優先使用現金支付 (即盡量靠左，除非現金不足)
  React.useEffect(() => {
    if (showDetail) {
      setSplitOG(minPossibleOG);
    }
  }, [showDetail, minPossibleOG]);

  return (
    <div
      onClick={() => setShowDetail(!showDetail)}
      className={`relative bg-slate-950/40 border-2 rounded-[32px] px-4 py-6 transition-all duration-500 h-[285px] flex flex-col justify-center items-center shadow-2xl group cursor-pointer ${
        showDetail ? 'z-50 scale-[1.02]' : 'z-10'
      } ${
        isMax
          ? `border-${role.color}-500/60 bg-${role.color}-500/5 ${
              role.color === 'amber'
                ? 'shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : role.color === 'emerald'
                  ? 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : role.color === 'blue'
                    ? 'shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : role.color === 'pink'
                      ? 'shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                      : 'shadow-[0_0_20px_rgba(255,255,255,0.05)]'
            }`
          : `${colors.border.replace('border-2', '')} opacity-90 hover:opacity-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]`
      }`}
    >
      {/* 視覺提示：倒三角 */}
      <div className="absolute top-4 right-5 w-6 h-6 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
        <ChevronDown
          size={18}
          className={`text-white transition-transform duration-500 ${showDetail ? 'rotate-180' : ''}`}
        />
      </div>

      {/* 壓縮態：大圖示與名稱 */}
      <div className="flex flex-col items-center space-y-6 px-1 text-center">
        <div
          className={`w-24 h-24 rounded-[32px] ${colors.bg} flex items-center justify-center border-2 ${colors.border} shadow-[0_12px_30px_rgba(0,0,0,0.6)] transition-transform group-hover:scale-110 duration-500`}
        >
          <role.icon className={`${colors.text} w-12 h-12`} />
        </div>
        <div>
          <h3 className="text-[18px] font-black text-white tracking-widest mb-3 uppercase leading-tight">
            {role.name}
          </h3>
          <div className="flex justify-center space-x-3.5">
            {[1, 2, 3].map((lv) => (
              <div
                key={lv}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
                  lv <= currentLevel
                    ? colors.badge + ' scale-125 shadow-[0_0_10px_currentColor]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 覆蓋式詳情面板 (等比例放大模式) */}
      {showDetail && (
        <div
          className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetail(false);
          }}
        >
          <div
            className={`relative w-full max-w-[360px] aspect-[9/16] bg-slate-950 border-[3px] rounded-[48px] p-8 flex flex-col shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-90 duration-500 ${colors.border.replace(
              'border-2',
              'border-opacity-100'
            )}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 頂部光暈效果 */}
            <div className={`absolute -top-24 -left-24 w-64 h-64 ${colors.bg} rounded-full blur-[100px] opacity-20 pointer-events-none`} />

            {/* 卡片標題區 (放大版) */}
            <div className="flex flex-col items-center text-center space-y-6 mb-10 mt-4 relative z-10">
              <div className={`w-28 h-28 rounded-[36px] ${colors.bg} flex items-center justify-center border-2 ${colors.border} shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
                <role.icon className={`${colors.text} w-14 h-14`} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-[0.15em] uppercase">
                  {role.name}
                </h2>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3].map((lv) => (
                    <div
                      key={lv}
                      className={`w-3 h-3 rounded-full transition-all duration-700 ${
                        lv <= currentLevel
                          ? colors.badge + ' scale-125 shadow-[0_0_15px_currentColor]'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 詳情滾動區 */}
            <div className="flex-1 overflow-y-auto space-y-4 px-2 mb-8 custom-scrollbar relative z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-center">CONTRACT_DETAILS</p>
              {role.levels.map((level: { type: string; desc: string }, idx: number) => {
                const targetLv = idx + 1;
                const isUnlocked = currentLevel >= targetLv;
                const isCurrentTarget = !isMax && currentLevel === idx;

                return (
                  <div
                    key={idx}
                    className={`relative px-5 py-4 flex items-start space-x-4 rounded-3xl transition-all duration-500 border-2 ${
                      isUnlocked
                        ? 'opacity-100 bg-white/5 border-white/5'
                        : isCurrentTarget
                          ? 'opacity-100 border-dashed border-white/20 bg-white/5 animate-pulse'
                          : 'opacity-20 border-transparent'
                    }`}
                  >
                    <div
                      className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isUnlocked
                          ? colors.badge + ' shadow-[0_0_15px_currentColor]'
                          : 'bg-white/5 border border-white/20'
                      }`}
                    >
                      {isUnlocked ? (
                        <Check size={12} className="text-black" />
                      ) : (
                        <span className="text-[10px] font-black">{targetLv}</span>
                      )}
                    </div>
                    <p className={`text-[12px] leading-relaxed font-bold tracking-tight ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                      {level.desc.split('：')[1] || level.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 操作區 */}
            <div className="pt-2 relative z-10" onClick={(e) => e.stopPropagation()}>
              {!isMax ? (
                canAfford ? (
                  <div className="space-y-6">
                    {/* 支付比例分配滑桿 */}
                    {player.trustFund > 0 && (
                      <div className="space-y-3 bg-white/5 p-5 rounded-[28px] border border-white/5">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                          <span className="text-emerald-400">G: {totalCostG - splitOG}萬</span>
                          <span className="text-blue-300">OG: {splitOG}萬</span>
                        </div>
                        <div className="relative h-6 flex items-center">
                           <input 
                             type="range" 
                             min={minPossibleOG} 
                             max={maxPossibleOG} 
                             value={splitOG}
                             onChange={(e) => setSplitOG(parseInt(e.target.value))}
                             className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                             aria-label="支付比例分配"
                             title="調整支付比例"
                           />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        upgradeRole(role.key, splitOG);
                        setShowDetail(false);
                      }}
                      className={`w-full py-5 rounded-[24px] text-black text-xs font-black tracking-[0.3em] uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${colors.badge}`}
                    >
                      簽署 LV.${currentLevel + 1} 合約
                    </button>
                  </div>
                ) : (
                  <div className="w-full py-5 rounded-[24px] border-dashed border-2 border-white/20 flex flex-col items-center justify-center bg-white/5">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">
                      Insufficient Assets
                    </span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      100萬 G + 100 IP
                    </span>
                  </div>
                )
              ) : (
                <div
                  className={`w-full py-5 rounded-[24px] bg-opacity-10 border border-opacity-30 text-xs font-black flex items-center justify-center uppercase tracking-[0.3em] ${colors.badge} ${colors.text.replace('text-', 'border-')}`}
                >
                  <ShieldCheck size={20} className="mr-3 opacity-70" />
                  ACTIVE CONTRACT
                </div>
              )}
              
              <p className="text-[9px] font-black text-slate-600 text-center uppercase tracking-[0.5em] mt-6 opacity-40">
                點擊空白處返回市場
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoreScreen() {
  const { players, currentPlayerIndex, upgradeRole } = useGameStore();
  const player = players[currentPlayerIndex];

  if (!player) return null;

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-2 gap-4 pb-14 mt-2">
        {ROLE_DATA.map((role) => (
          <TalentCard key={role.key} role={role} player={player} upgradeRole={upgradeRole} />
        ))}
      </div>
    </div>
  );
}
