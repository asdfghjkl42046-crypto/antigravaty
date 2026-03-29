'use client';

import React, { useState } from 'react';
import { X, Save, Eraser, Plus, Minus, Info } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getBaseTrialFloor, getTrialMultiplierByTrials } from '@/engine/MechanicsEngine';

// Debug 面板組件屬性定義
interface DebugPanelProps {
  onClose: () => void;
}

/**
 * 開發者除錯面板 (Debug Hack Panel)
 * 用於快速修改玩家經營資源 (G, RP, AP, IP) 及清理黑材料，僅供開發測試使用。
 */
export default function DebugPanel({ onClose }: DebugPanelProps) {
  const { players, currentPlayerIndex, debugUpdatePlayer, turn, hardReset } = useGameStore();
  const player = players[currentPlayerIndex];

  // 本地暫存狀態
  const [values, setValues] = useState({
    g: player?.g ?? 0,
    rp: player?.rp ?? 0,
    ap: player?.ap ?? 0,
    ip: player?.ip ?? 0,
  });

  // 對象突然死亡或破產失去資格的話，駭客畫面當場崩解回收避免報錯
  if (!player) return null;

  // 套用變更至 Store
  const handleUpdate = () => {
    debugUpdatePlayer(player.id, values);
    onClose();
  };

  // 清除玩家所有標籤與黑材料紀錄
  const handleClearBM = () => {
    debugUpdatePlayer(player.id, {
      tags: [],
      totalTagsCount: 0,
      blackMaterialSources: [],
    });
    onClose();
  };

  // 實用的小幫手快速加減法包裝器：每次加一百萬或者扣掉一百萬
  const quickAdjust = (key: keyof typeof values, amount: number) => {
    setValues((prev) => ({ ...prev, [key]: prev[key] + amount }));
  };

  // 起訴機率觀測
  const totalTags = player.totalTagsCount || 0;
  // 顯示被起訴的最低機率 (每累積 40 個標籤，被起訴機率就增加 10%)
  const floorPercent = getBaseTrialFloor(totalTags);

  // 累犯倍率觀測
  const trials = player.totalTrials || 0;
  const trialMultiplier = getTrialMultiplierByTrials(trials);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-500/50 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        {/* 開發者工具頭部橫幅大標：以大紅色警示條包裝 */}
        <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-black text-xl italic uppercase tracking-tighter">Debug Tool</h3>
            <p className="text-[10px] opacity-70 font-mono">
              ID: {player.id} | Name: {player.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Close Debug Panel"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* 機密指標觀測區 */}
          <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Info size={10} /> 最低起訴機率
              </p>
              <p className="text-xl font-black text-orange-400">{floorPercent}%</p>
              <p className="text-[8px] text-slate-600">偵查進度: {totalTags} 標籤</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Info size={10} /> 罰金倍率
              </p>
              <p className="text-xl font-black text-red-400">{trialMultiplier.toFixed(1)}x</p>
              <p className="text-[8px] text-slate-600">累計被告次數: {trials} 次</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* 總資本 (G) 暴發富增減與手工強行輸入器 */}
            <div className="space-y-2">
              <label
                htmlFor="input-g"
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
              >
                Total Capital (G)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => quickAdjust('g', -100)}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700"
                  title="Decrease G"
                  aria-label="Decrease Total Capital"
                >
                  <Minus size={14} />
                </button>
                <input
                  id="input-g"
                  type="number"
                  value={values.g}
                  onChange={(e) => setValues({ ...values, g: parseInt(e.target.value) || 0 })}
                  className="flex-1 bg-black border border-slate-700 rounded-xl px-4 py-3 font-black text-emerald-400 text-center text-xl"
                />
                <button
                  onClick={() => quickAdjust('g', 100)}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700"
                  title="Increase G"
                  aria-label="Increase Total Capital"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* 其餘三寶副資源一次性網格橫排輸入表單 (名譽, 體力, 影響力) */}
            <div className="grid grid-cols-3 gap-4">
              {['rp', 'ap', 'ip'].map((k) => {
                const key = k as keyof typeof values;
                return (
                  <div key={key} className="space-y-2 text-center">
                    <label
                      htmlFor={`input-${key}`}
                      className="text-[10px] font-black text-slate-500 uppercase tracking-widest block"
                    >
                      {key}
                    </label>
                    <input
                      id={`input-${key}`}
                      type="number"
                      value={values[key]}
                      onChange={(e) =>
                        setValues({ ...values, [key]: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-black border border-slate-700 rounded-xl px-2 py-3 font-black text-blue-400 text-center text-lg"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右下核彈發射按鈕控制大區 */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            {/* 清除所有證據按鈕 */}
            <button
              onClick={handleClearBM}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-orange-500/30 text-orange-400 font-black hover:bg-orange-500/10 transition-all uppercase tracking-widest text-sm"
              title="清除所有犯罪紀錄"
            >
              <Eraser size={18} />
              清除所有犯罪證據
            </button>
            <button
              onClick={handleUpdate}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> 套用數值更新
            </button>
            <button
              onClick={hardReset}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} className="rotate-45" /> 強制系統重啟
            </button>
          </div>

          {/* 文末免責忠告警語 */}
          <p className="text-[10px] text-center text-slate-500 font-medium">
            ⚠️
            此工具面板設計僅供開發除蟲與極端情境推演測試，遊戲封測與生產環境打包發放前務必記得移除對首頁的關聯掛載入口。
          </p>
        </div>
      </div>
    </div>
  );
}
