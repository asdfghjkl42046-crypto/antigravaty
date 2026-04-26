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

      {/* 覆蓋式詳情面板 (Overlay) */}
      {showDetail && (
        <div
          className={`absolute inset-0 z-50 bg-[#020617] rounded-[30px] px-3.5 py-5 flex flex-col justify-between border-2 animate-in fade-in zoom-in-95 duration-300 shadow-[0_20px_60px_rgba(0,0,0,1)] overflow-hidden ${colors.border.replace(
            'border-2',
            'border-opacity-100'
          )}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetail(false);
          }}
        >
          <div className="space-y-1.5 pointer-events-none">
            <div className="flex items-center space-x-2 mb-1.5 border-b border-white/5 pb-1.5 px-1">
              <role.icon className={`${colors.text} w-3.5 h-3.5`} title={role.name} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                {role.name} 詳情
              </span>
            </div>

            {role.levels.map((level: { type: string; desc: string }, idx: number) => {
              const targetLv = idx + 1;
              const isUnlocked = currentLevel >= targetLv;
              const isCurrentTarget = !isMax && currentLevel === idx;

              return (
                <div
                  key={idx}
                  className={`relative px-1.5 py-1 flex items-start space-x-2 rounded-lg transition-all duration-500 border-2 border-transparent ${
                    isUnlocked
                      ? 'opacity-100 bg-white/5'
                      : isCurrentTarget
                        ? 'opacity-40 border-dashed border-slate-500/40 animate-pulse'
                        : 'opacity-20'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isUnlocked
                        ? colors.badge + ' shadow-[0_0_10px_currentColor]'
                        : 'bg-white/5 border border-white/20'
                    }`}
                  >
                    {isUnlocked ? (
                      <Check size={10} className="text-black" />
                    ) : (
                      <span className="text-[9px] font-black">{targetLv}</span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] flex-1 leading-relaxed font-bold tracking-tight whitespace-pre-line ${
                      isUnlocked ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {level.desc.split('：')[1] || level.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="pt-2 px-1" onClick={(e) => e.stopPropagation()}>
            {!isMax ? (
              canAfford ? (
                <div className="space-y-4">
                  {/* 支付比例分配滑桿 (僅在有海外資金時顯示) */}
                  {player.trustFund > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                        <span className="text-emerald-400">現金: {totalCostG - splitOG}萬</span>
                        <span className="text-blue-300">信託: {splitOG}萬</span>
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
                           title="調整現金與海外資金的支付比例"
                         />
                      </div>
                      <div className="flex justify-between text-[7px] text-slate-500 font-bold">
                        <span>100% G</span>
                        <span>100% OG</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      upgradeRole(role.key, splitOG);
                      setShowDetail(false);
                    }}
                    className={`w-full py-2.5 rounded-xl text-black text-[10px] font-black tracking-widest uppercase transition-all hover:brightness-110 active:scale-95 shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${colors.badge}`}
                  >
                    簽署 LV.${currentLevel + 1} 合約
                  </button>
                </div>
              ) : (
                /* 無法購買：白色虛線框 (Ghost Style) */
                <div className="w-full py-2 rounded-xl border-dashed border-2 border-white/60 flex items-center justify-center bg-transparent">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                    預算 / 人脈不足
                  </span>
                </div>
              )
            ) : (
              <div
                className={`w-full py-1.5 rounded-xl bg-opacity-10 border border-opacity-30 text-[9px] font-black flex items-center justify-center uppercase tracking-[0.3em] ${colors.badge} ${colors.text.replace('text-', 'border-')}`}
              >
                <ShieldCheck size={12} className="mr-2 opacity-50" />
                ACTIVE CONTRACT
              </div>
            )}
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
