'use client';

import React, { useState } from 'react';
import { X, Save, Eraser, Plus, Minus, Info } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

// 為避免誤用對外宣告必須提供關閉視窗的鉤子回呼
interface DebugPanelProps {
  onClose: () => void; // 點選右上角的叉叉或者點選儲存後順手連鎖關閉彈窗的小精靈
}

/**
 * 萬能開發者帝王權限面板 (Debug Hack Panel)
 * 專司提供工程人員、GM(GameMaster)以及展場主考官用來在展場/測試環節
 * 以「不可被違抗之神力直接進入記憶體強行替換」修改任意一位場上玩家數值的純暗門介面工具。
 * ⚠️ 安全技術聲明：此組件實屬極危險金手指，未來在釋出生產環境打包版前不應輕易留下任何隱藏敲擊入口。
 */
export default function DebugPanel({ onClose }: DebugPanelProps) {
  // 從 Store 系統核心深處撈出一種絕對防禦級數的「無視任何商業邏輯強制無情派發覆寫」函示 (名叫 debugUpdatePlayer)
  const { players, currentPlayerIndex, debugUpdatePlayer, turn } = useGameStore();
  const player = players[currentPlayerIndex];

  // 面板專用內存暫存區域 Local State，我們先在這裡暫時拖曳玩弄各種天價數字，
  // 因為若每改一塊錢就連往 Store 發動請求，會導致背後的 React Canvas 或網頁 DOM 完全卡死凍結
  const [values, setValues] = useState({
    g: player?.g ?? 0,
    rp: player?.rp ?? 0,
    ap: player?.ap ?? 0,
    ip: player?.ip ?? 0,
  });

  // 對象突然死亡或破產失去資格的話，駭客畫面當場崩解回收避免報錯
  if (!player) return null;

  // 確認所有欄位的恐怖數據竄改完成，點擊「確認套用」後一次性把那坨骯髒的數據推倒灌往 Zustand Store 大腦中
  const handleUpdate = () => {
    debugUpdatePlayer(player.id, values); // 下此神諭，無法反悔
    onClose(); // 送走介面完工
  };

  // 無上皇恩大赦天下神聖按鈕：當開發人員要修 bug 想觀察初期狀態時，
  // 能用這個鈕一鍵清除與淨化掉這位倒楣玩家身上因為長年幹壞事堆積成的犯罪標章與巨量黑材料
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

  // [V2.88] 為了便利後端演算法設計師微調並觀察法院模型數值設計，
  // 特別直接在此駭客黑盒子面板下緣提供一處透明看板：專門洩漏計算底層這回合「即將機率算出多少被起訴率」的恐怖真實值。
  const totalTags = player.totalTagsCount || 0;
  // 推論暗黑算法底線展示 (法律系統裡，玩家的罪名只要每累積到 40 張無情標籤，就會強制墊高這傢伙 10% 機率底層極限紅線，絕對不會因為他跟法官關係好就有特例被消除)
  const floorPercent = totalTags > 0 ? Math.min(100, Math.ceil(totalTags / 40) * 10) : 0;

  // 同步計算並秀出另一項致命要素：這個人如果下一局再次不幸被告，他上回留下的案底會被法院追加成幾「倍」的變態體制裁罰，讓測試者有事先的心理建設準備與預警
  const trials = player.totalTrials || 0;
  let trialMultiplier = 1.0;
  if (trials >= 7)
    trialMultiplier = 6.0; // 7連被告，根本十大要犯
  else if (trials >= 4) trialMultiplier = 3.0;

  return (
    // 最高統治層特權 (z-[1000])：全黑不透明度 60% 毛玻璃佈景，用以暴力蓋滿整個外觀後方所有系統流程按紐防止誤觸操作引發連鎖競態問題
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* 面板本體：血紅色警戒極粗邊框與恐怖血腥光彩擴散背光暈，用以威嚇表示這是一定要慎用的極高特權行為破壞區 */}
      <div className="w-full max-w-md bg-slate-900 border-2 border-red-500/50 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        {/* 開發者工具頭部橫幅大標：以大紅色警示條包裝 */}
        <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="font-black text-xl italic uppercase tracking-tighter">
              Debug Tool (外掛)
            </h3>
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
          {/* [V2.88] 實時底層機密指標觀測區 (洩漏法官的內心運算底線機密數據) */}
          <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Info size={10} /> 起訴強制死線底限 (Floor)
              </p>
              <p className="text-xl font-black text-orange-400">{floorPercent}%</p>
              <p className="text-[8px] text-slate-600">偵查進度: {totalTags} 標籤</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <Info size={10} /> 庭審罰金相乘倍率 (Multi)
              </p>
              <p className="text-xl font-black text-red-400">{trialMultiplier.toFixed(1)}x</p>
              <p className="text-[8px] text-slate-600">累計登錄前科被告次數: {trials} 次</p>
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
                  onClick={() => quickAdjust('g', -100)} // 點一下瞬間人間蒸發一百萬鉅資
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
                  onClick={() => quickAdjust('g', 100)} // 點一下空投空降一百萬紓困金
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
                      type="number" // 取消英文字母亂寫權限
                      value={values[key]}
                      // 極其重要：確保修改後依然是被轉為 Integer 純十進位整數格式，若寫出小數點或其他妖魔鬼怪符號將立刻引發接下來十張卡牌後台 Engine 的無聲嚴重炸裂崩壞錯誤！
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
            <button
              onClick={handleUpdate}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> 套用數值更新執行覆寫
            </button>
            <button
              onClick={handleClearBM}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Eraser size={18} /> 清洗所有黑材料 (BM) 紀錄
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
