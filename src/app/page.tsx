'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { CARDS_DB } from '../data/cards/CardsDB';
import { LAW_CASES_DB } from '../data/laws/LawCasesDB';
import { AlertTriangle, Camera, ChevronRight, Check, Gift, LogOut, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import ActionCard from '@/components/ActionCard';
import QrScanner from '@/components/QrScanner';
import Courtroom from '@/components/Courtroom';
import HRShop from '@/components/HRShop';
import SetupScreen from '@/components/SetupScreen';
import ModeSelectScreen from '@/components/ModeSelectScreen';
import GameHUD from '@/components/GameHUD';
import PlayerSidebar from '@/components/PlayerSidebar';
import EndingScreen from '@/components/EndingScreen';
import TabNavigation from '@/components/TabNavigation';
import DebugPanel from '@/components/DebugPanel';
import ErrorPopup from '@/components/ErrorPopup';
import EngineErrorModal from '@/components/EngineErrorModal';
import { GLOBAL_UI_TEXT } from '@/data/system/GlobalUI';
import { CARD_UI_TEXT } from '@/data/cards/CardsDB';
import { SYSTEM_MESSAGES } from '@/data/system/SystemMessages';
import RouletteOverlay, { RouletteOption } from '@/components/RouletteOverlay';

/**
 * 遊戲主導控中心
 * 這裡是遊戲的主戰場，負責切換辦公室、法庭或是結束畫面。
 */
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 讀取現在遊戲世界的全局現況
  const {
    players,
    turn,
    currentPlayerIndex,
    phase,
    initGame,
    performAction,
    endTurn,
    resetGame,
    judgePersonality,
    startNotifications,
    clearStartNotifications,
    endingResult,
    setJudgeMode,
    engineError,
    hardReset,
  } = useGameStore();

  // 2. 幕後載入防護網
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 單獨抽出現在這秒「握有掌控權」的玩家資料
  const currentPlayer = players[currentPlayerIndex] || null;

  // 4. 定義你現在看到的螢幕畫面設定（控制相機是否開啟、哪個分頁等）
  const [message, setMessage] = useState(SYSTEM_MESSAGES.READY); // 終端機模擬的單行狀態字
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 錯誤彈窗訊息
  const [scanInput, setScanInput] = useState(''); // 直接手動輸入卡號的框體文字
  const [activeCardId, setActiveCardId] = useState<string | null>(null); // 若掃碼成功，這會被填入地點卡 UUID
  const [activeTab, setActiveTab] = useState<'scan' | 'hrshop' | 'log'>('scan'); // 左側三大功能分頁卡
  const [cameraMode, setCameraMode] = useState(false); // 是否啟動實體鏡頭掃描二維碼模式
  const [showDebug, setShowDebug] = useState(false); // 開發者面板開關 (隱藏在 GameHUD 中)
  const [showModeSelect, setShowModeSelect] = useState(true); // 最開始的模式過場視窗
  const [isPerforming, setIsPerforming] = useState(false); // 🐛 防連點漏洞：非同步結算鎖
  const lastScanTimeRef = useRef(0); // 🐛 效能 Bug 修復: QR 掃描防止硬體連拍的截流閥
  const lastScannedTextRef = useRef(''); // 🐛 記憶最後一次掃描的文字，防止重複連擊
  const [pendingRoulette, setPendingRoulette] = useState<{
    title: string;
    subtitle: string;
    options: RouletteOption[];
    targetIndex: number;
    onComplete: () => void;
  } | null>(null);

  // 人性防線：當你把卡片湊向鏡頭，系統會先停格並跳出說明，讓你好好看清楚自己幹了甚麼好事，不要手殘怪系統。
  const [pendingScan, setPendingScan] = useState<{
    cardId: string;
    optionIndex: 1 | 2 | 3;
    cardTitle: string;
    cardDescription: string;
    optionLabel: string;
    optionDescription: string;
    optionType: string;
  } | null>(null);

  // 統一處理引擎回報的執行結果：成功進日誌，失敗進彈窗
  const handleActionResult = useCallback((result: { success: boolean; message: string }) => {
    if (result.success) {
      setMessage(result.message);
    } else {
      setErrorMessage(result.message);
    }
  }, []);

  // 貪婪的兩難：當你面臨要「合法申報」還是「非法逃脫」的十字路口時，系統會暫存你的把柄資料。
  const [postActionData, setPostActionData] = useState<{
    cardId: string;
    optionIndex: 1 | 2 | 3;
    costG: number;
    title: string;
  } | null>(null);

  /**
   * 條碼神經中樞：不管你是拿真實紙牌掃描鏡頭，還是自己偷偷用鍵盤輸入指令，都必須先受此處審查。
   */
  const handleScanWithValue = useCallback(
    (raw: string) => {
      if (pendingScan) return; // 沒耐心的老闆：畫面上還有剛剛的提案卡等著你簽名，不要急著丟下一張！

      // 🐛 Fix: 防止相機鏡頭對焦不良導致極短間隔內送出超過 2 條相同字串（實作 500ms 短暫無敵冷卻）
      const now = Date.now();
      // 如果短時間內 (3秒內) 掃描完全相同的條碼，或是 500ms 內掃描任何條碼，予以忽略
      if (
        now - lastScanTimeRef.current < 500 ||
        (now - lastScanTimeRef.current < 3000 && lastScannedTextRef.current === raw)
      )
        return;
      lastScanTimeRef.current = now;
      lastScannedTextRef.current = raw;

      // 系統特規攔截：卡牌背面的洗牌條碼 (不分大小寫)
      if (raw.toUpperCase() === 'RECARD') {
        const result = useGameStore.getState().redrawCards();
        handleActionResult(result);
        return;
      }

      // 紙牌身分驗證：必須符合系統註冊過的正規格式 (例: A-01-1 代表 A-01 卡片之第 1 個選項)
      const qrMatch = raw.match(/^(.+)-([1-3])$/);

      if (qrMatch) {
        // 從解析到的陣列位置挖出所需數值
        const [, cardId, optStr] = qrMatch;
        const optIdx = Number(optStr) as 1 | 2 | 3;
        const card = CARDS_DB[cardId];

        // 防外掛：竟然敢拿不存在大資料庫裡的廢卡糊弄系統，拒絕執行！
        if (!card) {
          setErrorMessage(SYSTEM_MESSAGES.INVALID_CARD_ID(cardId));
          return;
        }

        const option = card[optIdx];
        if (!option) {
          setErrorMessage(SYSTEM_MESSAGES.INVALID_OPTION(optIdx));
          return;
        }

        // 當選項牽涉到底層法條矩陣時，撈取該法條用來恐嚇或說服玩家
        const lawCase = (option as { lawCaseIds?: string[] }).lawCaseIds?.[0]
          ? LAW_CASES_DB[(option as { lawCaseIds?: string[] }).lawCaseIds![0]]
          : null;
        let baseDesc = option.label || `執行選項 ${optIdx}`;
        if (baseDesc.endsWith('。')) {
          baseDesc = baseDesc.slice(0, -1);
        }

        // 組合說明：直接使用卡片上定義的精確標籤，不再進行硬編碼拼接，確保文案與 BATCH 1 更新同步
        const fullOptionDesc = baseDesc;

        // 一切都安排妥當了！把準備好的提案送上檯面，就等老闆你的一句「簽字執行」。
        setPendingScan({
          cardId,
          optionIndex: optIdx,
          cardTitle: card.title || cardId,
          cardDescription: card.description || '',
          optionLabel: option.label || `選項 ${optIdx}`,
          optionDescription: fullOptionDesc,
          optionType: option.type,
        });
        handleActionResult({
          success: true,
          message: SYSTEM_MESSAGES.SCAN_SUCCESS(cardId, optIdx),
        });
        return;
      }

      setErrorMessage(SYSTEM_MESSAGES.INVALID_CARD(raw));
    },
    [pendingScan]
  );

  // 按下開發者強行「手動輸入」按鈕的派發轉接
  const handleScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = scanInput.trim().toUpperCase();
    if (!raw) return;
    setScanInput('');
    handleScanWithValue(raw);
  };

  // 鏡頭辨識模組成功解碼後拋回的回呼函數
  const handleCameraScan = useCallback(
    (decodedText: string) => {
      // 依據需求：掃描後維持相機開啟，不自動關閉
      handleScanWithValue(decodedText.trim().toUpperCase());
    },
    [handleScanWithValue]
  );

  /** 最終簽字執行：當你決定放手一搏，狠狠按下確認鍵後，命運的齒輪就會開始轉動。 */
  const handleConfirmScan = async () => {
    if (!pendingScan || isPerforming) return;
    setIsPerforming(true);
    const { cardId, optionIndex } = pendingScan;
    const card = CARDS_DB[cardId];
    const opt = card[optionIndex as 1 | 2 | 3];
    // 解析是不是遇到特殊事件：政府標案類別中帶有 "declareLogic" 特殊標籤的卡片
    const isCSeriesIllegal =
      cardId.startsWith('C-') && (opt as { special?: string }).special === 'declareLogic';

    // 發現特殊雙重分歧案！馬上暫停一般結算流程，把「你想要合法繳稅，還是非法逃稅？」的黑幕面具彈窗丟到畫面最前方。
    if (isCSeriesIllegal && !postActionData) {
      setPostActionData({
        cardId,
        optionIndex: optionIndex as 1 | 2 | 3,
        costG: (opt as { costG?: number }).costG || 0,
        title: card.title || cardId,
      });
      setPendingScan(null); // 把首波彈窗收起來換上二階段視窗
      setIsPerforming(false); // [修正] 解鎖，讓後續二階段面板按鈕可點擊
      return;
    }

    // 一般正常卡片就清除彈窗並正式呼叫 Zustand 連動底層 Engine 發起大屠殺結算
    setPendingScan(null);
    setActiveCardId(null); // [核心修復] 立即清理背景卡片，防止並行洩漏
    const result = await performAction(cardId, optionIndex as 1 | 2 | 3);

    // 判斷是否需要呼叫命運輪盤
    const optConf = card[optionIndex as 1 | 2 | 3];
    const isProbAction =
      optConf &&
      typeof optConf === 'object' &&
      'succRate' in optConf &&
      (optConf as any).succRate !== undefined &&
      (optConf as any).succRate < 1.0;

    // 檢查是否因為資金不足等前置錯誤導致行動提早被取消
    const isEarlyAbort =
      result.apRefunded ||
      result.log?.tags === 'CARD_SKIPPED' ||
      result.log?.tags === 'BANKRUPT' ||
      result.log?.tags === 'INSUFFICIENT_FUNDS';

    if (isProbAction && !isEarlyAbort) {
      const succRate = (optConf as any).succRate;
      // 在 ActionEngine 中，如果機率檢定失敗，success 會是 false
      const targetIndex = result.success ? 0 : 1;
      setPendingRoulette({
        title: '命運輪盤',
        subtitle: `${card.title} - ${optConf.label}`,
        options: [
          { label: '成功', probability: succRate, colorHex: '#10b981' },
          { label: '失敗', probability: 1 - succRate, colorHex: '#ef4444' },
        ],
        targetIndex,
        onComplete: () => {
          setPendingRoulette(null);
          handleActionResult(result);
          setIsPerforming(false);
        },
      });
    } else {
      handleActionResult(result);
      setIsPerforming(false);
    }
  };

  // 承上：二階段決策後置面板的兩種選擇（乖乖給政府抽稅合法申報 declare vs 惡意逃漏隱匿 skip）
  const handlePostAction = async (choice: 'declare' | 'skip') => {
    if (!postActionData || isPerforming) return;
    setIsPerforming(true);
    const { cardId, optionIndex } = postActionData;
    setPostActionData(null);
    // 把抉擇結果一起傳給 Engine 做歷史紀錄與制裁法理依據
    const result = await performAction(cardId, optionIndex, choice);
    handleActionResult(result);
    setIsPerforming(false);
  };

  /** 如果玩家掃完條碼看到選項說明發現不妙，直接按取消。這不扣除任何資源，只算虛驚一場。 */
  const handleCancelScan = () => {
    setPendingScan(null);
    setMessage(SYSTEM_MESSAGES.CANCEL_ACTION);
  };

  /**
   * 當玩家在畫面上直接操作滑鼠點擊非條碼選項 (例如被鎖在地圖或是開發外掛面板) 時用的包裹層
   */
  const handleAction = async (cardId: string, optIdx: 1 | 2 | 3) => {
    if (isPerforming) return;
    const card = CARDS_DB[cardId];
    if (!card) return;

    const opt = card[optIdx];
    const isCSeriesIllegal =
      cardId.startsWith('C-') && (opt as { special?: string }).special === 'declareLogic';

    if (isCSeriesIllegal && !postActionData) {
      setPostActionData({
        cardId,
        optionIndex: optIdx,
        costG: (opt as { costG?: number }).costG || 0,
        title: card.title || cardId,
      });
      setActiveCardId(null);
      setIsPerforming(false); // [修正] 解鎖，讓後續二階段面板按鈕可點擊
      return;
    }

    setActiveCardId(null);
    setIsPerforming(true);
    const result = await performAction(cardId, optIdx);

    // 判斷是否需要呼叫命運輪盤
    const isProbAction =
      opt &&
      typeof opt === 'object' &&
      'succRate' in opt &&
      (opt as any).succRate !== undefined &&
      (opt as any).succRate < 1.0;
    const isEarlyAbort =
      result.apRefunded ||
      result.log?.tags === 'CARD_SKIPPED' ||
      result.log?.tags === 'BANKRUPT' ||
      result.log?.tags === 'INSUFFICIENT_FUNDS';

    if (isProbAction && !isEarlyAbort) {
      const succRate = (opt as any).succRate;
      const targetIndex = result.success ? 0 : 1;
      setPendingRoulette({
        title: '命運輪盤',
        subtitle: `${card.title} - ${opt.label}`,
        options: [
          { label: '成功', probability: succRate, colorHex: '#10b981' },
          { label: '失敗', probability: 1 - succRate, colorHex: '#ef4444' },
        ],
        targetIndex,
        onComplete: () => {
          setPendingRoulette(null);
          handleActionResult(result);
          setIsPerforming(false);
        },
      });
    } else {
      handleActionResult(result);
      setIsPerforming(false);
    }
  };

  // 畫面載入中：等待舞台燈光跟圖層完全掛載上去前，先不要透露任何資訊。
  if (!isMounted) return null;

  return (
    <div className="h-[100dvh] w-screen bg-black text-slate-200 overflow-hidden flex flex-col items-center justify-center">
      <div
        ref={containerRef}
        className="flex flex-col flex-1 w-full h-full min-h-0 relative"
      >
        {/* =============== 分歧一：遊戲破關或宣告倒閉 =============== */}
        {(phase === 'gameover' || phase === 'victory') && endingResult ? (
          <div className="flex-1 flex items-center justify-center min-h-0 w-full overflow-y-auto">
            <EndingScreen result={endingResult} players={players} onReset={resetGame} />
          </div>
        ) : showModeSelect && players.length === 0 ? (
          /* =============== 分歧二：剛開起遊戲的第一畫面，選擇是否連線 AI 法官 =============== */
          <div className="flex-1 flex items-center justify-center min-h-0 w-full">
            <ModeSelectScreen
              onSelect={(mode) => {
                setJudgeMode(mode);
                setShowModeSelect(false);
              }}
            />
          </div>
        ) : players.length === 0 ? (
          /* =============== 分歧三：各路人馬輸入角色名字與抽取開局路線的大廳 =============== */
          <div className="flex-1 flex items-center justify-center min-h-0 w-full overflow-y-auto">
            <SetupScreen
              onComplete={(configs) => initGame(configs)}
              onBack={() => setShowModeSelect(true)}
            />
          </div>
        ) : (
          /* =============== 分歧四：所有事前準備就緒，進入正式遊戲大廳 =============== */
          <div className="flex flex-col flex-1 w-full text-slate-100 font-sans selection:bg-blue-500/30">
            {/* 名譽過低 (RP <= 30) 的警報 */}
            {(currentPlayer?.rp ?? 100) <= 30 && (
              <div className="fixed inset-0 z-[150] pointer-events-none border-[4px] md:border-[8px] border-red-600/50 animate-pulse flex justify-center">
                <div className="mt-20 md:mt-6 bg-red-600/90 backdrop-blur-md border border-red-400 text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-black text-[11px] md:text-[13px] tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.8)] animate-bounce h-fit flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {SYSTEM_MESSAGES.RP_WARNING}
                </div>
              </div>
            )}

            {/* 螢幕正上方的全局橫幅：無情地播報現在是第幾回合，以及這場管事的法官是哪個個性。 */}
            <GameHUD
              turn={turn}
              judgePersonality={judgePersonality}
              onReset={resetGame}
              onDebug={() => setShowDebug(true)}
            />

            {/* 右上浮動控制台：結束回合與返回大廳 (手機版縮小) */}
            <div className="fixed top-4 right-4 md:right-10 z-[100] flex items-center gap-2 md:gap-4 p-1.5 md:p-2 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[20px] md:rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
              {/* 回合計數 */}
              <div className="flex flex-col items-center px-1.5 md:px-3">
                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-slate-500 font-black leading-none mb-0.5 md:mb-1">
                  Round
                </span>
                <span
                  className={cn(
                    'text-base md:text-xl font-black tracking-tighter',
                    turn >= 45
                      ? 'text-red-400 animate-pulse'
                      : turn >= 40
                        ? 'text-amber-400'
                        : 'text-blue-400'
                  )}
                >
                  {turn}/50
                </span>
              </div>

              <div className="w-px h-6 md:h-8 bg-white/10" />

              <button
                onClick={endTurn}
                disabled={phase === 'courtroom'}
                className={cn(
                  'px-3 md:px-6 py-2 md:py-3 font-black rounded-xl md:rounded-2xl shadow-lg transition-all flex items-center gap-1.5 md:gap-2 text-sm md:text-base',
                  phase === 'courtroom'
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:scale-105 active:scale-95'
                )}
              >
                <Zap size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden xs:inline">{GLOBAL_UI_TEXT.COMMON.END_TURN}</span>
              </button>

              <div className="w-px h-6 md:h-8 bg-white/10 mx-0.5 md:mx-1" />

              <button
                onClick={resetGame}
                title={GLOBAL_UI_TEXT.COMMON.BACK}
                className="p-2 md:p-3 bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/20 text-slate-500 hover:text-red-400 rounded-xl md:rounded-2xl transition-all"
              >
                <LogOut size={16} className="md:w-[20px] md:h-[20px]" />
              </button>
            </div>

            {/* 錯誤彈窗：無效卡片等錯誤以彈窗形式顯示 */}
            <ErrorPopup message={errorMessage} onClose={() => setErrorMessage(null)} />

            {/* 核心引擎致命報錯遮罩：數值損毀 (NaN) 或邏輯斷裂時的最終防線 */}
            <EngineErrorModal error={engineError} onReset={hardReset} />

            {/* 核心內容區：分左右板塊，手機版直列，桌機橫列 */}
            <main className="flex-1 w-full mx-auto py-24 md:py-12 flex flex-col xl:flex-row gap-6 md:gap-10 overflow-y-auto xl:overflow-hidden relative z-10 px-4 md:px-8">
              {/* 左側首腦陣列板 */}
              <PlayerSidebar players={players} currentPlayerIndex={currentPlayerIndex} />

              {/* 中間偏右巨大主視窗 */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* 戰場切換樞紐：如果有人被告了，毫不留情地把右側辦公區砸碎，換上最殘酷的法庭辯論戰場！ */}
                {phase === 'courtroom' ? (
                  <Courtroom />
                ) : (
                  <>
                    {/* 分頁導航移至此處，取代原本的冗餘標題 */}
                    <div className="w-fit mx-auto mb-8 p-1.5 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>

                    {/* 當畫面在掃碼主頁籤時要渲染的整個刷卡機模組 */}
                    {activeTab === 'scan' &&
                      (() => {
                        // 檢查該名玩家體力極限，若歸零則將所有輸入框封閉鎖死
                        const isApEmpty = (currentPlayer?.ap ?? 0) <= 0;
                        return (
                          <div className="flex flex-col gap-6 flex-1">
                            <section className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center space-y-4">
                              <h3 className="text-xl font-black tracking-tight">
                                {GLOBAL_UI_TEXT.SCAN.TITLE}
                              </h3>
                              {cameraMode ? (
                                // 高耗能真實相機對接模組，利用 HTML5-QRCode 運作
                                <QrScanner
                                  active={cameraMode}
                                  onScanSuccess={handleCameraScan}
                                  onClose={() => setCameraMode(false)}
                                />
                              ) : (
                                <div className="flex gap-2 max-w-md mx-auto">
                                  {/* 開啟實體相機的啟動鈕 */}
                                  <button
                                    disabled={isApEmpty}
                                    onClick={() => setCameraMode(true)}
                                    title={GLOBAL_UI_TEXT.COMMON.OPEN_CAMERA}
                                    aria-label={GLOBAL_UI_TEXT.COMMON.OPEN_CAMERA}
                                    className="p-4 bg-emerald-600/20 disabled:bg-slate-800 border border-emerald-500/30 disabled:border-slate-700 disabled:text-slate-500 text-emerald-400 rounded-2xl disabled:cursor-not-allowed"
                                  >
                                    <Camera size={24} />
                                  </button>
                                  {/* 開發者無實體卡牌手動除錯輸入框 */}
                                  <form onSubmit={handleScan} className="flex-1 flex gap-2">
                                    <input
                                      value={scanInput}
                                      onChange={(e) => setScanInput(e.target.value)}
                                      placeholder={isApEmpty ? 'AP不夠' : 'A-01-1'}
                                      disabled={isApEmpty}
                                      className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-4 font-mono text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                      type="submit"
                                      disabled={isApEmpty}
                                      title={GLOBAL_UI_TEXT.COMMON.MANUAL_READ}
                                      aria-label={GLOBAL_UI_TEXT.COMMON.MANUAL_READ}
                                      className="px-6 bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-2xl font-bold transition-all"
                                    >
                                      {GLOBAL_UI_TEXT.COMMON.READ}
                                    </button>
                                  </form>
                                </div>
                              )}
                            </section>

                            {/* 如果掃完顯示為純開發端虛擬介面測試，會在這裡展開 ActionCard 零件讓滑鼠點選 */}
                            <div className="flex-1 flex items-center justify-center">
                              {activeCardId ? (
                                <ActionCard
                                  cardId={activeCardId}
                                  card={CARDS_DB[activeCardId]}
                                  onSelect={(idx) => handleAction(activeCardId, idx as 1 | 2 | 3)}
                                  disabled={isApEmpty || isPerforming}
                                />
                              ) : (
                                <div className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-40">
                                  {GLOBAL_UI_TEXT.SCAN.WAITING}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    {/* 人才獵頭市場卡：有錢就能為所欲為，買下一整支高階律師或是公關團隊替你擋子彈。 */}
                    {activeTab === 'hrshop' && <HRShop onActionResult={handleActionResult} />}

                    {/* 第三分頁卡：保留給未來的開發中系統 */}
                    {activeTab === 'log' && (
                      <div className="flex-1 flex items-center justify-center bg-white/5 rounded-3xl text-slate-500 font-bold uppercase tracking-widest opacity-40">
                        Log System Under Development
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>

            {/* ======================= 以下皆為最上層的絕對定位層級 (Z-Index MODALS 區塊) ======================= */}

            {/* 特硃道德抉擇：當你按下申報或逃稅類按鈕時，浮出擋下全場的致命選擇題 */}
            {postActionData && (
              <div className="fixed inset-0 z-[210] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-slate-900 border border-slate-700/50 rounded-[32px] p-10 space-y-8 animate-in zoom-in-95">
                  <h3 className="text-2xl font-black text-center text-white italic">
                    {CARD_UI_TEXT.POST_ACTION.DECLARE_TITLE(postActionData.title)}
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePostAction('declare')}
                      className="w-full p-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-left"
                    >
                      <span className="text-xl font-black text-slate-200 block">
                        {CARD_UI_TEXT.POST_ACTION.DECLARE_LABEL}
                      </span>
                      <p className="text-lg text-slate-400 mt-2 font-medium leading-relaxed">
                        {CARD_UI_TEXT.POST_ACTION.DECLARE_DESC}
                      </p>
                    </button>
                    <button
                      onClick={() => handlePostAction('skip')}
                      className="w-full p-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-left"
                    >
                      <span className="text-xl font-black text-slate-200 block">
                        {CARD_UI_TEXT.POST_ACTION.SKIP_LABEL}
                      </span>
                      <p className="text-lg text-slate-400 mt-2 font-medium leading-relaxed">
                        {CARD_UI_TEXT.POST_ACTION.SKIP_DESC}
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 常規確任動作窗：每次你逼逼逼掃完二維碼，它都會跳出來再三確認你懂不懂這按鈕有被抓的潛在風險 */}
            {pendingScan && (
              <div className="fixed inset-0 z-[220] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
                <div className="max-w-4xl w-full bg-[#111418] border border-white/10 rounded-[40px] p-16 space-y-12 animate-in zoom-in-95">
                  <div className="text-center space-y-4">
                    <p className="text-xl font-black text-blue-500 uppercase tracking-widest">
                      {GLOBAL_UI_TEXT.SCAN.CONFIRM_TITLE}
                    </p>
                    <h3 className="text-6xl font-black text-white italic">
                      {pendingScan.cardTitle}
                    </h3>
                  </div>
                  <div className="p-10 bg-white/5 border border-white/5 rounded-3xl flex flex-col gap-8 shadow-inner">
                    {/* 卡片背景情境描述 */}
                    {pendingScan.cardDescription && (
                      <p className="text-2xl text-slate-400 font-medium leading-relaxed pl-6 border-l-4 border-slate-600/50 italic">
                        {pendingScan.cardDescription}
                      </p>
                    )}
                    {/* 玩家選擇的行動決議 */}
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black">
                          {pendingScan.optionIndex}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-slate-200 leading-relaxed flex-1">
                        {pendingScan.optionDescription}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    {/* 取消一切沒事發生鈕 */}
                    <button
                      onClick={handleCancelScan}
                      className="py-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-2xl text-slate-400 transition-all"
                    >
                      {GLOBAL_UI_TEXT.COMMON.CANCEL}
                    </button>
                    {/* 送出並等著被引擎隨機數宣判死刑的確認鈕 */}
                    <button
                      onClick={handleConfirmScan}
                      className="py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl rounded-2xl shadow-lg transition-all active:scale-95"
                    >
                      {GLOBAL_UI_TEXT.SCAN.CONFIRM_BTN}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 開場天賦紅利全版廣播：用以通報所有玩家這回合有誰拿了特殊豁免權或賄賂了這把的法官 */}
            {startNotifications && startNotifications.length > 0 && (
              <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
                <div className="max-w-md w-full bg-gradient-to-b from-amber-500/20 to-black border-2 border-amber-500/50 rounded-[40px] p-10 space-y-8 animate-in zoom-in-95">
                  <div className="text-center space-y-4">
                    <div className="inline-flex p-5 rounded-3xl bg-amber-500 text-black shadow-lg rotate-12 mx-auto">
                      <Gift size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-amber-100 tracking-tight">
                      {SYSTEM_MESSAGES.REWARD_OBTAINED}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {startNotifications.map((note, i) => (
                      <div
                        key={i}
                        className="p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-4"
                      >
                        <Check size={20} className="text-amber-400 mt-1 shrink-0" />
                        <p className="text-xl font-black text-slate-200 leading-tight">{note}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={clearStartNotifications}
                    className="w-full py-5 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {SYSTEM_MESSAGES.REWARD_CONFIRM} <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* 給工程師用的底層暴力修改外掛 (不對外展示) */}
            {showDebug && <DebugPanel onClose={() => setShowDebug(false)} />}
          </div>
        )}
      </div>

      {/* 機率大轉盤：確保覆蓋於所有組件 (含 Courtroom 跟 GameOver) 之上，以防畫面直接切換破梗 */}
      {pendingRoulette && (
        <RouletteOverlay
          title={pendingRoulette.title}
          subtitle={pendingRoulette.subtitle}
          options={pendingRoulette.options}
          targetIndex={pendingRoulette.targetIndex}
          onComplete={pendingRoulette.onComplete}
        />
      )}
    </div>
  );
}
