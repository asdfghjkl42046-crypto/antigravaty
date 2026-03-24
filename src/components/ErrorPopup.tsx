'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorPopupProps {
  message: string | null; // 錯誤訊息內容，null 時隱藏
  onClose: () => void; // 關閉彈窗的回呼函數
}

/**
 * 錯誤彈窗元件 (Error Popup)
 * 用於顯示無效卡片、無法讀取等錯誤訊息。
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
      <div className="pointer-events-auto max-w-lg w-full mx-4 p-6 bg-slate-950/95 backdrop-blur-2xl border-2 border-red-500/60 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.3)] animate-in zoom-in-95 fade-in duration-300">
        <div className="flex items-start gap-4">
          {/* 警告圖示 */}
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-red-400" />
          </div>

          {/* 錯誤訊息文字 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-red-400 uppercase tracking-widest mb-2">
              錯誤
            </h3>
            <p className="text-white font-bold text-base leading-relaxed">
              {message}
            </p>
          </div>

          {/* 手動關閉按鈕 */}
          <button
            onClick={onClose}
            title="關閉錯誤訊息"
            className="p-2 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-all shrink-0"
          >
            <X size={20} />
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
