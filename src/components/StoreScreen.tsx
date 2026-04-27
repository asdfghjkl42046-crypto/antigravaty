import React from 'react';
import { ROLE_DATA, COLOR_MAP, ROLE_UPGRADE_COST, RoleColor } from '../data/roles/RoleData';
import { useGameStore } from '../store/gameStore';
import { Users, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { formatValue } from '@/engine/MathEngine';
import { SystemStrings } from '@/data/SystemStrings';
import type { Player, RoleType } from '../types/game';

interface RoleData {
  key: RoleType;
  name: string;
  emoji: string;
  icon: React.ElementType;
  color: RoleColor;
  levels: { type: string; desc: string }[];
}

/**
 * 個別人才卡片組件：高度色彩同步，按鈕與邊框根據職位螢光色呈現
 */
/**
 * 支付結算彈窗：專門處理資金分配
 */
function PaymentModal({
  role,
  player,
  onClose,
  onConfirm,
}: {
  role: RoleData;
  player: Player;
  onClose: () => void;
  onConfirm: (splitOG: number) => void;
}) {
  const [splitOG, setSplitOG] = React.useState(0);
  const colors = COLOR_MAP[role.color];
  const totalCostG = ROLE_UPGRADE_COST.g;
  const maxPossibleOG = Math.min(totalCostG, player.trustFund || 0);
  const minPossibleOG = Math.max(0, totalCostG - (player.g || 0));

  React.useEffect(() => {
    setSplitOG(minPossibleOG);
  }, [minPossibleOG]);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xs bg-[#0a0a0f] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-lg font-black text-white uppercase tracking-widest">{SystemStrings.UI_LABELS.PAYMENT_TITLE}</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {SystemStrings.UI_LABELS.PAYMENT_SOURCE}
          </p>
        </div>

        <div className="space-y-8 mb-10">
          <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">
                {SystemStrings.UI_LABELS.CASH_PAY}
              </span>
              <p className="text-lg font-black text-white leading-none">{formatValue(totalCostG - splitOG, SystemStrings.UNITS.MONEY)}</p>
            </div>
            {player.trustFund > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="space-y-1 text-right">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
                    {SystemStrings.UI_LABELS.TRUST_PAY}
                  </span>
                  <p className="text-lg font-black text-white leading-none">{formatValue(splitOG, SystemStrings.UNITS.MONEY)}</p>
                </div>
              </>
            )}
          </div>

          {/* 只有當擁有海外資產 (og > 0) 時才出現滑感組件 */}
          {player.trustFund > 0 && (
            <div className="relative h-10 flex items-center px-2">
              <div className="absolute inset-x-2 h-1 bg-white/10 rounded-full" />
              <input
                type="range"
                min={minPossibleOG}
                max={maxPossibleOG}
                value={splitOG}
                onChange={(e) => setSplitOG(parseInt(e.target.value))}
                className="w-full h-2 appearance-none bg-transparent cursor-pointer accent-white relative z-10"
                aria-label="調整支付來源比例"
                title="滑動以調整現金與海外資金的分配"
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onConfirm(splitOG)}
            className={`w-full py-4 rounded-2xl text-black text-[11px] font-black tracking-[0.2em] uppercase shadow-xl ${colors.badge}`}
          >
            {SystemStrings.UI_LABELS.CONFIRM_HIRE}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
          >
            {SystemStrings.UI_LABELS.CANCEL}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 人才任命合約彈窗：獨立於卡片之外的頂層 UI
 */
function RoleUpgradeModal({
  role,
  player,
  onClose,
  onOpenPayment,
}: {
  role: RoleData;
  player: Player;
  onClose: () => void;
  onOpenPayment: () => void;
}) {
  const currentLevel = player.roles?.[role.key] || 0;
  const isMax = currentLevel >= 3;
  const colors = COLOR_MAP[role.color];

  const totalCostG = ROLE_UPGRADE_COST.g;
  const costIP = ROLE_UPGRADE_COST.ip;
  const canAfford = player.ip >= costIP && player.g + (player.trustFund || 0) >= totalCostG;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />

      {/* 彈窗主體 - 緊湊任命書風格 */}
      <div
        className={`relative w-full max-w-md bg-[#050508] border-t-2 border-l-2 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 ${colors.border.replace('border-2', 'border-opacity-20')}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 頂部裝飾條 */}
        <div className={`h-1.5 w-full ${colors.badge} opacity-40`} />

        {/* 內容區 - 加入最大高度限制與滾動 */}
        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar max-h-[70vh]">
          {/* 職位標題區 - 改為更緊湊的橫向排版 */}
          <div className="flex items-center space-x-5 mb-8">
            <div
              className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center border-2 ${colors.border} flex-shrink-0 shadow-lg`}
            >
              <role.icon className={`${colors.text} w-8 h-8`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.badge} animate-pulse`} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  {SystemStrings.STORE.HR_DOSSIER}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase truncate leading-tight">
                {role.name}
              </h2>
              <p className="text-[9px] font-bold text-slate-500 tracking-widest opacity-60">
                {SystemStrings.STORE.ID_LABEL}: {role.key.toUpperCase()}_V4
              </p>
            </div>
          </div>
          <div className="grid gap-3">
            {role.levels.map((level, idx) => {
              const targetLv = idx + 1;
              const isUnlocked = currentLevel >= targetLv;
              const isCurrentTarget = !isMax && currentLevel === idx;

              return (
                <div
                  key={idx}
                  className={`group relative p-4 rounded-2xl border-2 transition-all duration-500 ${
                    isUnlocked
                      ? 'bg-white/[0.02] border-white/5'
                      : isCurrentTarget
                        ? `border-${role.color}-500/20 bg-${role.color}-500/5`
                        : 'border-transparent opacity-20'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border ${isUnlocked ? colors.badge + ' border-transparent text-black' : 'border-white/10 text-white/40'}`}
                    >
                      {isUnlocked ? <Check size={12} /> : targetLv}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest ${isUnlocked ? colors.text : 'text-slate-600'}`}
                        >
                          {SystemStrings.STORE.STAGES} 0{targetLv}
                        </span>
                        {isUnlocked && (
                          <span className="text-[8px] font-bold text-emerald-500/50 uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs font-bold leading-relaxed ${isUnlocked ? 'text-white' : 'text-slate-500'}`}
                      >
                        {level.desc.split('：')[1] || level.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部按鈕區 - 更加緊湊 */}
        <div className="px-6 py-6 bg-white/[0.01] border-t border-white/5 flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            {SystemStrings.STORE.CANCEL}
          </button>
          {!isMax ? (
            <button
              onClick={() => {
                if (canAfford) {
                  onOpenPayment();
                }
              }}
              disabled={!canAfford}
              className={`flex-1 py-4 rounded-xl text-black text-[12px] font-black tracking-[0.15em] uppercase transition-all shadow-xl ${
                canAfford
                  ? colors.badge + ' active:scale-95'
                  : 'bg-slate-800 opacity-20 cursor-not-allowed'
              }`}
            >
              {canAfford ? SystemStrings.STORE.CONFIRM_HIRE_PROMPT : SystemStrings.STORE.INSUFFICIENT_FUNDS}
            </button>
          ) : (
            <div
              className={`flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-500 text-center text-[10px] font-black uppercase tracking-[0.2em]`}
            >
              {SystemStrings.STORE.CONTRACT_ACTIVE}
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
  onSelect,
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
        <div
          className={`w-24 h-24 rounded-[32px] ${colors.bg} flex items-center justify-center border-2 ${colors.border} shadow-[0_12px_30px_rgba(0,0,0,0.6)] group-hover:shadow-${role.color}-500/20 transition-all`}
        >
          <role.icon className={`${colors.text} w-12 h-12`} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-widest mb-3 uppercase">
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
    </div>
  );
}

export default function StoreScreen() {
  const { players, currentPlayerIndex, upgradeRole } = useGameStore();
  const [selectedRole, setSelectedRole] = React.useState<RoleData | null>(null);
  const [showPayment, setShowPayment] = React.useState(false);
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

      {/* 第一層：任命合約彈窗 */}
      {selectedRole && !showPayment && (
        <RoleUpgradeModal
          role={selectedRole}
          player={player}
          onClose={() => setSelectedRole(null)}
          onOpenPayment={() => setShowPayment(true)}
        />
      )}

      {/* 第二層：支付結算彈窗 */}
      {selectedRole && showPayment && (
        <PaymentModal
          role={selectedRole}
          player={player}
          onClose={() => setShowPayment(false)}
          onConfirm={(splitOG) => {
            upgradeRole(selectedRole.key, splitOG);
            setShowPayment(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}
