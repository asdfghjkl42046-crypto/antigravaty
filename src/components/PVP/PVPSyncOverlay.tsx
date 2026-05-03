'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Wifi, ShieldCheck, Loader2 } from 'lucide-react';

interface PVPSyncOverlayProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
}

/**
 * PVP 專屬同步遮罩 (PVPSyncOverlay)
 * 用於多機模式下，等待所有玩家數據同步完成的真實等待介面。
 * 區別於 LoadingScreen，它不顯示虛擬進度，而是強調聯網狀態。
 */
export default function PVPSyncOverlay({ 
  isVisible, 
  message = "正在同步多機宇宙數據...", 
  subMessage = "請稍候，系統正在校對所有節點的雜湊鏈..." 
}: PVPSyncOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl overflow-hidden"
        >
          {/* 背景聯網脈衝裝飾 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
          </div>

          <div className="relative z-10 flex flex-col items-center max-w-sm px-8 text-center">
            {/* 動態聯網圖示 */}
            <div className="relative mb-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border-2 border-dashed border-blue-500/30 flex items-center justify-center"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] animate-bounce-subtle">
                  <Network className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* 訊號溢散效果 */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-blue-400 rounded-full"
              />
            </div>

            {/* 文字資訊 */}
            <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {message}
            </h2>
            <p className="text-blue-400/70 text-[10px] font-bold tracking-widest leading-relaxed uppercase mb-10">
              {subMessage}
            </p>

            {/* 加載狀態點 */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">
                Node Syncing: Online
              </span>
            </div>
          </div>

          {/* 底部裝飾條 */}
          <div className="absolute bottom-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ left: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 w-24 h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
