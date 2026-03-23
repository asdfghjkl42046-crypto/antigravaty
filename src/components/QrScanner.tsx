'use client'; // 代表此元件包含瀏覽器專屬 API (navigator.camera 等)，必須在客端渲染

import { useEffect, useRef, useState, useCallback } from 'react';
import { SYSTEM_MESSAGES } from '@/data/system/SystemMessages';
import { GLOBAL_UI_TEXT } from '@/data/system/GlobalUI';

/**
 * 企業監視錄影網：實體卡牌掃描特勤模組
 * 負責徵用你手機或電腦的真實攝影機，當你把那些代表骯髒交易的實體小卡遞到鏡頭前，
 * 它就能瞬間解碼內含的黑心合約，並立刻切斷電源防止反追蹤。
 */
interface QrScannerProps {
  /** 當偷拍成功並成功解除了卡牌上的密碼鎖後，要把證據送交給哪個部門？ */
  onScanSuccess: (decodedText: string) => void;
  /** 控制相機電源的總開關，省電也防駭客偷窺 */
  active: boolean;
  /** 外部要求強制中止掃描器關閉視窗的回呼 */
  onClose: () => void;
}

export default function QrScanner({ onScanSuccess, active, onClose }: QrScannerProps) {
  // 綁定 DOM 元素讓 Html5Qrcode 套件可以把 <video> 標籤塞進去
  const scannerRef = useRef<HTMLDivElement>(null);

  // 使用 useRef 來存放 Html5Qrcode 實例記憶體參照，避免因 React 生命週期造成重複初始化與記憶體洩漏
  const html5QrCodeRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);

  // 鏡頭啟動失敗或被使用者拒絕權限時的錯誤字串狀態
  const [error, setError] = useState<string | null>(null);
  // 用於顯示「相機暖機中」的旋轉 loading 籠罩層
  const [isStarting, setIsStarting] = useState(false);
  // 防呆與防爆：攝影機這種硬體很嬌弱，必須等它完全暖機亮綠燈後，才能讓急性子的老闆按下關閉按鈕，避免當機。
  const [isReady, setIsReady] = useState(false);

  // 封裝掃描成功的穩定回呼，避免被 useEffect 依賴鏈頻繁更新
  const handleSuccess = useCallback(
    (decodedText: string) => {
      onScanSuccess(decodedText);
    },
    [onScanSuccess]
  );

  /**
   * 系統崩潰防護罩：
   * 如果老闆在相機剛通電的瞬間就反悔按關閉，瀏覽器底層會因為來不及反應而噴出恐怖的紅色當機畫面。
   * 我們在這裡部署了靜默攔截網，偷偷把這個錯誤吃掉，假裝一切都沒事發生。
   */
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason instanceof Error &&
        reason.name === 'AbortError' &&
        reason.message.includes('play()')
      ) {
        // 大聲說：這是我預期中的「取消播放」，不要阻擋遊戲進度更不要拋出 Error Boundary！
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // ----------------------------------------------------------------------
  // 相機啟動與生命週期主控台
  // ----------------------------------------------------------------------
  useEffect(() => {
    // 指令 A：長官下令關閉監視器
    if (!active) {
      setIsReady(false); // 鎖死所有開關
      // 找出記憶體中的舊相機實例進行銷毀
      if (html5QrCodeRef.current) {
        const scanner = html5QrCodeRef.current;
        html5QrCodeRef.current = null;
        try {
          // 強制停止串流
          scanner
            .stop()
            .then(() => {
              try {
                // 清洗 DOM 標籤殘留
                scanner.clear();
              } catch {
                /* 處於銷毀階段的錯誤一律靜默吸收 */
              }
            })
            .catch(() => {
              try {
                scanner.clear();
              } catch {
                /* 靜默忽略 */
              }
            });
        } catch {
          try {
            scanner.clear();
          } catch {
            /* 靜默忽略 */
          }
        }
      }
      return;
    }

    // 指令 B：通電！喚醒這隻會吃光手機電量的監視器怪獸
    let cancelled = false; // 競爭條件 (Race Condition) 防彈衣

    const initScanner = async () => {
      try {
        setIsStarting(true);
        setError(null);

        // 為了避免雲端伺服器因為沒有實體鏡頭而死機，這裡限定必須在玩家自己的設備上才把掃描套件載入。
        const { Html5Qrcode } = await import('html5-qrcode');

        // 若在載入期間玩家就手賤按了上一頁，迅速脫離
        if (cancelled) return;

        const scannerId = 'qr-scanner-region';
        const scanner = new Html5Qrcode(scannerId);
        // 紀錄進 useRef，供拆除函式讀取
        html5QrCodeRef.current = scanner;

        // 打開硬體權限
        await scanner.start(
          { facingMode: 'environment' }, // 第一志願：優先霸佔手機後鏡頭，若桌機沒後鏡頭會自動 Fallback 找前置
          {
            fps: 10, // 為了省電與防止手機發燙，把偵測幀數限制為每秒 10 張照片即可
            qrbox: { width: 250, height: 250 }, // 螢幕中央劃出一塊漂亮的正方形掃描範圍
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Callback：掃到了！而且符合規格！
            // 立即命令相機停止吃電 (使用 trycatch 防爆)
            scanner.stop().catch(() => {
              /* 靜默忽略 */
            });
            // 傳遞戰利品給上層元件
            handleSuccess(decodedText);
          },
          () => {
            // Callback：每幀解碼失敗的回報區 (極為頻繁，通常留空，這代表相機視野裡沒有發現任何像二維條碼的黑白斑點)
          }
        );

        // 防禦機制：若剛啟動完畢但其實組件已經要銷毀了，馬上補一槍阻止
        if (cancelled) {
          scanner.stop().catch(() => {
            /* 靜默忽略 */
          });
        } else {
          // 相機就緒後，強迫老闆多等一秒鐘才能關閉。
          // 這是為了讓晶片層級的畫面確實暖機完畢，否則秒開秒關一定會引發系統大當機。
          setTimeout(() => setIsReady(true), 1000);
        }
      } catch (err) {
        if (!cancelled) {
          const errMsg = err instanceof Error ? err.message : String(err);
          // 若捕捉到 AbortError 證明是玩家惡意連點關閉相機時瀏覽器的自我防衛，我們假裝沒看到
          if (err instanceof Error && err.name === 'AbortError') {
            // do nothing
          } else if (errMsg.includes('Permission') || errMsg.includes('NotAllowed')) {
            // 玩家殘酷地按下了「拒絕存取攝影機」
            setError(SYSTEM_MESSAGES.CAMERA.PERMISSION_DENIED);
          } else if (errMsg.includes('NotFound') || errMsg.includes('no camera')) {
            // 這個網頁開在沒有攝影機的破銅爛鐵上
            setError(SYSTEM_MESSAGES.CAMERA.NOT_FOUND);
          } else {
            // 未知神祕崩潰原因
            setError(SYSTEM_MESSAGES.CAMERA.START_FAILED(errMsg));
          }
        }
      } finally {
        if (!cancelled) {
          setIsStarting(false); // 移除全畫面的 Loading 轉圈圈
        }
      }
    };

    // 呼叫這巨型啟動函式
    initScanner();

    // 給 useEffect 的 componentWillUnmount 拆除炸彈引信
    return () => {
      cancelled = true; // 立刻拉起 Race condition 防線
      if (html5QrCodeRef.current) {
        const scanner = html5QrCodeRef.current;
        html5QrCodeRef.current = null; // 切斷參照
        try {
          scanner
            .stop()
            .then(() => {
              try {
                scanner.clear();
              } catch {
                /* 裝死 */
              }
            })
            .catch(() => {
              try {
                scanner.clear();
              } catch {
                /* 裝死 */
              }
            });
        } catch {
          try {
            scanner.clear();
          } catch {
            /* 裝死 */
          }
        }
      }
    };
  }, [active, handleSuccess]);

  // 如果根本沒通電，這顆元件就不要出來佔版面了
  if (!active) return null;

  return (
    // 半透明背景的科技感圓角框體
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60">
      {/* 這是準備讓鏡頭訊號強行覆寫的觀景窗畫布 */}
      <div id="qr-scanner-region" ref={scannerRef} className="w-full min-h-[300px]" />

      {/* 相機晶片載入與暖機時的保護覆蓋面紗 (避免玩家以為當機) */}
      {isStarting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 z-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full spin-slow" />
          <p className="text-slate-400 text-sm font-medium">{SYSTEM_MESSAGES.CAMERA.STARTING}</p>
        </div>
      )}

      {/* 若出錯 (例如沒有相機或是被拒絕權限) 顯示的錯誤求救畫面 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4 z-10 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-400 text-2xl">⚠</span>
          </div>
          <p className="text-red-400 text-sm font-bold max-w-xs">{error}</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-sm font-bold rounded-xl transition-all"
          >
            {GLOBAL_UI_TEXT.COMMON.CLOSE}
          </button>
        </div>
      )}

      {/* 關閉相機鈕：帶有暖機鎖定防護，在相機完全啟動前，這顆按鈕會被焊死，防止手殘連擊。 */}
      {!error && (
        <button
          onClick={isReady ? onClose : undefined}
          disabled={!isReady}
          className={`absolute top-3 right-3 z-20 px-4 py-2 text-white text-xs font-bold rounded-xl border border-white/20 transition-all backdrop-blur-sm
            ${isReady ? 'bg-black/70 hover:bg-red-500/80 cursor-pointer' : 'bg-black/30 opacity-40 cursor-not-allowed'}`}
        >
          {isReady ? SYSTEM_MESSAGES.CAMERA.CLOSE : SYSTEM_MESSAGES.CAMERA.INITIALIZING}
        </button>
      )}
    </div>
  );
}
