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
/**
 * 人才任命合約彈窗：獨立於卡片之外的頂層 UI
 */
function RoleUpgradeModal({ 
  role, 
  player, 
  onClose, 
  onUpgrade 
}: { 
  role: RoleData; 
  player: Player; 
  onClose: () => void;
  onUpgrade: (roleKey: RoleType, splitOG: number) => void;
}) {
  const [splitOG, setSplitOG] = React.useState(0);
  const currentLevel = player.roles?.[role.key] || 0;
  const isMax = currentLevel >= 3;
  const colors = COLOR_MAP[role.color];

  const totalCostG = 100;
  const costIP = 100;
  const maxPossibleOG = Math.min(totalCostG, player.trustFund || 0);
  const minPossibleOG = Math.max(0, totalCostG - (player.g || 0));
  const canAfford = player.ip >= costIP && (player.g + (player.trustFund || 0)) >= totalCostG;

  React.useEffect(() => {
    setSplitOG(minPossibleOG);
  }, [minPossibleOG]);

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      
      {/* 彈窗主體 - 絕密任命書風格 */}
      <div 
        className={`relative w-full max-w-lg bg-[#050508] border-t-2 border-l-2 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ${colors.border.replace('border-2', 'border-opacity-30')}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 頂部裝飾條 */}
        <div className={`h-1.5 w-full ${colors.badge} opacity-50`} />
        
        {/* 內容區 */}
        <div className="flex-1 overflow-y-auto px-10 py-12 custom-scrollbar">
          {/* 職位標題區 */}
          <div className="flex items-start justify-between mb-12">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${colors.badge} animate-pulse`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Classified_Contract</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                {role.name}
              </h2>
              <p className="text-xs font-bold text-slate-400 tracking-widest opacity-60">PERSONNEL_ID: {role.key.toUpperCase()}_V4</p>
            </div>
            <div className={`w-24 h-24 rounded-3xl ${colors.bg} flex items-center justify-center border-2 ${colors.border} shadow-[0_0_40px_rgba(0,0,0,0.5)]`}>
              <role.icon className={`${colors.text} w-12 h-12`} />
            </div>
          </div>

          {/* 核心條款 (等級詳情) */}
          <div className="space-y-8 mb-12">
            <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">升級條款細則</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            
            <div className="grid gap-4">
              {role.levels.map((level, idx) => {
                const targetLv = idx + 1;
                const isUnlocked = currentLevel >= targetLv;
                const isCurrentTarget = !isMax && currentLevel === idx;

                return (
                  <div 
                    key={idx}
                    className={`group relative p-5 rounded-[24px] border-2 transition-all duration-500 ${
                      isUnlocked 
                        ? 'bg-white/[0.03] border-white/5' 
                        : isCurrentTarget 
                          ? `border-${role.color}-500/30 bg-${role.color}-500/5` 
                          : 'border-transparent opacity-20'
                    }`}
                  >
                    <div className="flex items-center space-x-5">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black border ${isUnlocked ? colors.badge + ' border-transparent text-black' : 'border-white/20 text-white'}`}>
                        {isUnlocked ? <Check size={14} /> : targetLv}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isUnlocked ? colors.text : 'text-slate-500'}`}>
                            Phase_0{targetLv}
                          </span>
                          {isUnlocked && <span className="text-[9px] font-bold text-emerald-500/60 uppercase">Active</span>}
                        </div>
                        <p className={`text-sm font-bold leading-relaxed ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                          {level.desc.split('：')[1] || level.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 支付與授權區 */}
          {!isMax && (
            <div className="space-y-8 bg-white/[0.02] rounded-[32px] p-8 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-white uppercase tracking-widest">支付結算方式</span>
                <span className="text-[10px] font-bold text-slate-500 italic">COST: 100M G / 100 IP</span>
              </div>

              {player.trustFund > 0 ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">Cash_Deduction</p>
                      <p className="text-xl font-black text-white leading-none">{totalCostG - splitOG}<span className="text-[10px] ml-1 opacity-40 text-emerald-400 uppercase">萬 G</span></p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest">Trust_Fund_Usage</p>
                      <p className="text-xl font-black text-white leading-none">{splitOG}<span className="text-[10px] ml-1 opacity-40 text-blue-400 uppercase">萬 OG</span></p>
                    </div>
                  </div>
                  
                  <div className="relative h-8 flex items-center">
                    <div className="absolute inset-0 bg-white/5 rounded-full h-1.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="range" 
                      min={minPossibleOG} 
                      max={maxPossibleOG} 
                      value={splitOG}
                      onChange={(e) => setSplitOG(parseInt(e.target.value))}
                      className="w-full h-2 appearance-none bg-transparent cursor-pointer accent-white relative z-10"
                      aria-label="調整支付比例"
                    />
                  </div>
                </div>
              ) : (
                <div className="py-2">
                   <p className="text-sm font-bold text-slate-400 italic">全額使用現有現金 (G) 支付</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按鈕區 */}
        <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="px-6 py-4 rounded-2xl text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            Cancel
          </button>
          {!isMax ? (
            <button
              onClick={() => {
                if (canAfford) {
                  onUpgrade(role.key, splitOG);
                  onClose();
                }
              }}
              disabled={!canAfford}
              className={`flex-1 py-5 rounded-2xl text-black text-[13px] font-black tracking-[0.2em] uppercase transition-all shadow-2xl ${
                canAfford ? colors.badge + ' active:scale-95' : 'bg-slate-800 opacity-20 cursor-not-allowed'
              }`}
            >
              {canAfford ? `正式簽署 LV.${currentLevel + 1} 合約` : '資金或人脈不足'}
            </button>
          ) : (
            <div className={`flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-center text-[11px] font-black uppercase tracking-[0.3em]`}>
              Contract Active
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 個別人才卡片組件 (精簡化，僅負責顯示與觸發)
 */
function TalentCard({ 
  role, 
  player, 
  onSelect 
}: { 
  role: RoleData; 
  player: Player; 
  onSelect: () => void;
}) {
  const currentLevel = player.roles?.[role.key] || 0;
  const isMax = currentLevel >= 3;
  const colors = COLOR_MAP[role.color];

  return (
    <div
      onClick={onSelect}
      className={`relative bg-slate-950/40 border-2 rounded-[32px] px-4 py-8 h-[280px] flex flex-col justify-center items-center shadow-2xl group cursor-pointer transition-all duration-500 hover:scale-[1.03] ${
        isMax
          ? `border-${role.color}-500/40 bg-${role.color}-500/5`
          : `${colors.border.replace('border-2', '')} opacity-90 hover:opacity-100`
      }`}
    >
      <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
        <ChevronDown size={20} className="text-white" />
      </div>

      <div className="flex flex-col items-center space-y-6 text-center">
        <div className={`w-24 h-24 rounded-[32px] ${colors.bg} flex items-center justify-center border-2 ${colors.border} shadow-[0_12px_30px_rgba(0,0,0,0.6)] group-hover:shadow-${role.color}-500/20 transition-all`}>
          <role.icon className={`${colors.text} w-12 h-12`} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-widest mb-3 uppercase">{role.name}</h3>
          <div className="flex justify-center space-x-3.5">
            {[1, 2, 3].map((lv) => (
              <div
                key={lv}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-700 ${
                  lv <= currentLevel ? colors.badge + ' scale-125 shadow-[0_0_10px_currentColor]' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreScreen() {
  const { players, currentPlayerIndex, upgradeRole } = useGameStore();
  const [selectedRole, setSelectedRole] = React.useState<RoleData | null>(null);
  const player = players[currentPlayerIndex];

  if (!player) return null;

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-2 gap-4 pb-14 mt-2">
        {ROLE_DATA.map((role) => (
          <TalentCard 
            key={role.key} 
            role={role} 
            player={player} 
            onSelect={() => setSelectedRole(role)} 
          />
        ))}
      </div>

      {/* 頂層彈窗渲染 */}
      {selectedRole && (
        <RoleUpgradeModal 
          role={selectedRole} 
          player={player} 
          onClose={() => setSelectedRole(null)}
          onUpgrade={upgradeRole}
        />
      )}
    </div>
  );
}
