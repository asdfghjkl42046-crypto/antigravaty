'use client';

import { useState } from 'react';
import { User, Check, ChevronLeft, ChevronRight, Sword, ShieldAlert, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SETUP_TEXT, START_PATH_LABELS } from '@/data/setup/SetupData';
import { BRIBE_LABELS } from '../data/judges/JudgeTemplatesDB';
import type { StartPath, BribeItem } from '@/types/game';
import type { PlayerConfig } from '@/store/gameStore';

// 秘書處回報專線：當所有老闆都簽好生死狀後，立刻向主戰場伺服器發送開戰信號
interface SetupScreenProps {
  onComplete: (configs: PlayerConfig[]) => void;
  onBack?: () => void;
}

/**
 * 企業聯合註冊大廳 (Setup Screen)
 * 這是你正式跳入火坑前，選擇要當白手起家的窮小子、還是背景超硬的富二代的地方。
 * 系統會無情地逼迫在場的 2 到 4 位總裁輪流交出底牌，再把這些見不得光的設定打包送往核心處理器。
 */
export default function SetupScreen({ onComplete, onBack }: SetupScreenProps) {
  // 大廳動線導航：先決定有多少獵物要進場 (count)，再輪流帶進小房間拷問登記 (config)
  const [step, setStep] = useState<'count' | 'config'>('count');
  const [playerCount, setPlayerCount] = useState(2); // 參與玩家總數 (預設至少 2 人互鬥，上限 4)
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0); // 當前正在輸入設定是幾號仔的指標
  const [configs, setConfigs] = useState<PlayerConfig[]>([]); // 儲存已暫存完畢的玩家陣列堆疊

  // 當前這一位活人玩家輸入中的暫存欄位空間
  const [currentName, setCurrentName] = useState('');
  const [currentPath, setCurrentPath] = useState<StartPath>('normal');
  const [currentBribe, setCurrentBribe] = useState<BribeItem>('antique');

  // 防牽拖暗門設計：為了不讓背後的其他總裁偷看你打算帶什麼違禁品進場，特別加裝的實體保密隔板
  const [showSecret, setShowSecret] = useState(false);

  // 當這位玩家設定滿意，確認進入下一名玩家 (或所有人完畢後啟動遊戲主板)
  const handleNextPlayer = () => {
    // 幽靈企業防堵：如果你連幫自己公司取名都懶，系統會強制塞給你一個免洗的隨機空殼公司名字
    const newConfig: PlayerConfig = {
      name: currentName.trim() || SETUP_TEXT.DEFAULT_CORP_NAME(currentPlayerIdx),
      path: currentPath,
      // 只有選擇「非正常起點 (如黑金特權開局)」的犯規玩家，才能特別指定手提箱要用什麼賄賂品去討好法官
      bribeItem: currentPath !== 'normal' ? currentBribe : undefined,
    };

    // 將心生好的檔案壓入陣列
    const newConfigs = [...configs, newConfig];

    // 還有下一個待宰的羔羊嗎？立刻清空小房間的桌條，請下一位總裁進門，並再次拉下黑幕
    if (currentPlayerIdx + 1 < playerCount) {
      setConfigs(newConfigs);
      setCurrentPlayerIdx((p) => p + 1);
      setCurrentName('');
      setCurrentPath('normal');
      setShowSecret(false);
    } else {
      // 倒數結束，全員註冊到齊！把所有預處理參數打入 GameStore 初始化這場邪惡的商戰
      onComplete(newConfigs);
    }
  };

  // 悔過書機制：萬一剛才手抖選錯了，這裡可以給你最後一次機會時光倒流回去改口供
  const handleBackConfig = () => {
    // 正在暗房輸入的話，單純退回「敲暗門準備輸入」的罩子階段保護隱私
    if (showSecret) {
      setShowSecret(false);
      return;
    }
    // 如果從第一號人物就想退回上一頁，代表是退回大廳首頁要改「總遊玩人數」了
    if (currentPlayerIdx === 0) {
      setStep('count');
    } else {
      // 把剛才那傢伙從資料庫挖出來，強制把他的筆錄復原在桌上讓他重寫
      const prevIdx = currentPlayerIdx - 1;
      const prevConfig = configs[prevIdx];
      setCurrentPlayerIdx(prevIdx);
      setCurrentName(prevConfig.name);
      setCurrentPath(prevConfig.path as StartPath);
      if (prevConfig.bribeItem) setCurrentBribe(prevConfig.bribeItem);
      // 將最後一個元素從大陣列斬斷切掉
      setConfigs(configs.slice(0, prevIdx));
      setShowSecret(false); // 同樣要退到外面，以免現在畫面前面的人不是當選者，被破壞隱私
    }
  };

  return (
    // 充滿壓迫感的登記桌：固定你的視線，強迫你面對這場殘酷的報名儀式
    <div className="max-w-xl w-full space-y-8 animate-in fade-in zoom-in duration-500 py-12">
      {/* 步驟一：讓室長首先選擇本局實體在場總連線玩家數量 */}
      {step === 'count' && (
        <div className="text-center space-y-8 relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute -top-8 left-0 p-2 text-slate-400 hover:text-white transition-all flex items-center gap-1 text-sm font-bold uppercase tracking-widest"
            >
              <ChevronLeft size={18} /> {SETUP_TEXT.EXIT_BTN}
            </button>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-blue-500 italic">{SETUP_TEXT.SETUP_TITLE}</h1>
            <h2 className="text-2xl font-black opacity-80 uppercase tracking-widest">
              {SETUP_TEXT.SETUP_SUBTITLE}
            </h2>
          </div>

          {/* 生成 1~4 的大型數字浮水方塊列供手指直覺點選 (大面積 UI) */}
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => setPlayerCount(n)}
                className={cn(
                  'aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all',
                  // 點中有高光縮放特效，未點中則處於灰暗邊緣模式
                  playerCount === n
                    ? 'bg-blue-600 border-blue-400 shadow-xl scale-105'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                )}
              >
                <span className="text-3xl font-black">{n}</span>
                <span className="text-[10px] font-bold uppercase opacity-50 tracking-widest">
                  {SETUP_TEXT.PLAYER_COUNT_LABEL}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('config')}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-500 hover:text-white shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
          >
            {SETUP_TEXT.NEXT_STEP_BTN} <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* 步驟二：進入伸手不見五指的總裁審問小房間填寫底牌 */}
      {step === 'config' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 relative">
          <button
            onClick={handleBackConfig}
            className="absolute -top-12 left-0 p-2 text-slate-500 hover:text-white transition-all flex items-center gap-1 text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={18} />{' '}
            {/* 這裡是一個神乎其技的文字判斷：根據你現在處於哪一層暗門深處來套用不同字樣的標題文宣以減少玩家混淆 */}
            {showSecret
              ? SETUP_TEXT.BACK_TO_PREP_BTN
              : currentPlayerIdx > 0
                ? SETUP_TEXT.BACK_TO_PREV_PLAYER_BTN
                : SETUP_TEXT.BACK_TO_COUNT_BTN}
          </button>

          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {/* 顯示「現在是第 N 人 / 總共 N 人」等比例進度的小計數器銘牌 */}
                <span className="text-white font-black text-2xl bg-blue-600 px-3 py-1 rounded-xl shadow-lg">
                  {currentPlayerIdx + 1} / {playerCount}
                </span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">
                {SETUP_TEXT.REGISTRATION_TITLE}
              </h2>
            </div>

            <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black tracking-widest rounded-xl flex items-center gap-2 animate-pulse mb-2">
              <ShieldAlert size={14} /> {SETUP_TEXT.AVOIDANCE_NOTICE}
            </div>
          </div>

          {/* 黑幕防護罩：防範物理層面的偷瞄！在點擊「開始設定」前，別人絕對看不到你的財產申報表 */}
          {!showSecret ? (
            <div className="p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center gap-6 text-center">
              <div className="p-4 bg-white/5 rounded-full">
                <User size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-200 font-bold">{SETUP_TEXT.SECRET_SETTING_PROMPT}</p>
              <button
                onClick={() => setShowSecret(true)} // 點下去解除暗門保密結界！
                className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl"
              >
                {SETUP_TEXT.START_SETTING_BTN}
              </button>
            </div>
          ) : (
            // 開啟暗門後真正的絕密設定表單本體
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-10">
              {/* 1. 企業大名代號輸入框 */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {SETUP_TEXT.NAME_LABEL}
                </label>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  placeholder={SETUP_TEXT.NAME_PLACEHOLDER(currentPlayerIdx)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold text-lg"
                  autoFocus // UX 加分小細節：進入這層暗房滑鼠會自己閃游標在框上，不用多點擊一次就可直接打字
                />
              </div>

              {/* 2. 決定妳/你的出身階級，投胎是一門專業的技術 */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {SETUP_TEXT.PATH_LABEL}
                </label>
                <div className="space-y-2">
                  {(Object.entries(START_PATH_LABELS) as [StartPath, string][]).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setCurrentPath(key)}
                        className={cn(
                          'w-full p-5 rounded-2xl border-2 flex justify-between items-center transition-all',
                          currentPath === key
                            ? 'bg-blue-600/20 border-blue-500' // 當選中的那項會發出充滿高科技的特異藍綠邊框光
                            : 'bg-white/5 border-transparent hover:border-white/10'
                        )}
                      >
                        <span
                          className={cn(
                            'font-black text-sm tracking-tight',
                            currentPath === key ? 'text-blue-400' : 'text-slate-200'
                          )}
                        >
                          {label}
                        </span>
                        {/* 蓋下鋼印的確切感：一個發著科技藍光的實心打勾符號 */}
                        {currentPath === key && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 黑暗交易所開啟：只有出身特權階級的狂徒，才有資格在這裡挑選等一下要在法庭上賄賂法官用的專屬貢品！ */}
              {currentPath !== 'normal' && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-2">
                    <Gift size={14} /> {SETUP_TEXT.PREP_MEANS_LABEL}
                  </label>
                  {/* 你打算買古董、名畫還是直接塞比特幣？每個法官收賄的品味可完全不一樣喔。 */}
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(BRIBE_LABELS) as [BribeItem, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setCurrentBribe(key)}
                        className={cn(
                          'py-3 truncate px-1 rounded-xl border-2 text-[10px] font-black transition-all',
                          currentBribe === key
                            ? 'bg-red-600 border-red-400' // 非法賄賂勾當用滿身發毛的警戒紅底標示區別
                            : 'bg-white/5 border-transparent text-slate-400'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 簽字畫押！下好離手，沒有後悔藥了。 */}
              <button
                onClick={handleNextPlayer}
                className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 text-xl tracking-widest flex items-center justify-center gap-3"
              >
                <Sword size={20} className="rotate-45" />{' '}
                {currentPlayerIdx < playerCount - 1
                  ? SETUP_TEXT.NEXT_PLAYER_BTN
                  : SETUP_TEXT.START_GAME_BTN}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
