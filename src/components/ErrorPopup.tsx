'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorPopupProps {
  message: string | null; // 顯示的文字內容，沒有內容時隱藏
  onClose: () => void; // 關閉視窗時執行的動作
}

/**
 * 一般錯誤提示
 * 用於顯示卡片操作不合法、餘額不足等一般性的警告訊息。
 * 3 秒後自動消失，也可手動點擊關閉。
 */
export default function ErrorPopup({ message, onClose }: ErrorPopupProps) {
  // 自動消失計時器：3 秒後自動關閉
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    // 全螢幕遮罩層
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      {/* 彈窗本體：霓虹紅色警告風格 */}
      <div className="pointer-events-auto max-w-2xl w-full mx-8 p-10 bg-slate-950/95 backdrop-blur-2xl border-4 border-red-500/80 rounded-[2rem] shadow-[0_0_80px_rgba(239,68,68,0.4)] animate-in zoom-in-95 fade-in duration-300">
        <div className="flex items-start gap-6">
          {/* 警告圖示 */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={36} className="text-red-400" />
          </div>

          {/* 錯誤訊息文字 */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-4">錯誤</h3>
            <p className="text-white font-bold text-[28px] leading-[1.4] tracking-wide">{message}</p>
          </div>

          {/* 手動關閉按鈕 */}
          <button
            onClick={onClose}
            title="關閉錯誤訊息"
            className="p-3 rounded-2xl hover:bg-white/10 text-slate-500 hover:text-white transition-all shrink-0 -mt-2 -mr-2"
          >
            <X size={32} />
          </button>
        </div>

        {/* 底部倒數進度條 */}
        <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-red-500/60 rounded-full animate-[shrink_3s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}
