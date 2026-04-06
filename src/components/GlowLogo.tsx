'use client';

import { Scale } from 'lucide-react';

/**
 * Premium Glowing App Icon Component
 * 模擬圖片中高質感、霓虹發光的天平 Logo
 */
export default function GlowLogo() {
  return (
    <div className="relative group shrink-0 select-none">
      {/* 全域背景柔和擴散光暈 */}
      <div className="absolute inset-[-40px] bg-blue-500/10 blur-[60px] rounded-full pointer-events-none opacity-50" />
      
      {/* 主 Icon 容器：模擬 iOS App Icon 質感 */}
      <div className="w-[140px] h-[140px] bg-gradient-to-b from-[#ffffff] to-[#94b9ff] p-[3px] rounded-[36px] shadow-[0_0_50px_rgba(37,99,235,0.4)] relative z-10 overflow-hidden">
        
        {/* 內層深色底座 */}
        <div className="w-full h-full bg-gradient-to-br from-[#081235] via-[#020516] to-[#010208] rounded-[33px] flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* 頂部強光切角 (模擬玻璃反光) */}
          <div className="absolute top-0 inset-x-0 h-[40%] bg-white/5 blur-sm pointer-events-none" />
          
          {/* 核心霓虹點光源 */}
          <div className="absolute top-[-20%] right-[-20%] w-24 h-24 bg-blue-400/40 blur-3xl rounded-full" />
          <div className="absolute bottom-[-10%] inset-x-0 h-1/2 bg-blue-600/30 blur-[40px]" />
          
          {/* 內發光細邊框 */}
          <div className="absolute inset-2.5 border border-blue-400/30 rounded-[22px] pointer-events-none" />
          
          {/* 天平 Icon */}
          <div className="relative z-10 mt-1">
            {/* 圖標背後的強化亮圈 */}
            <div className="absolute inset-0 bg-blue-400/20 blur-xl scale-125" />
            <Scale 
              size={54} 
              strokeWidth={1.2} 
              className="text-white drop-shadow-[0_0_15px_rgba(96,165,250,1)] relative z-10" 
            />
          </div>
          
          {/* Logo 底部文字 */}
          <span className="text-[10px] font-black tracking-[0.3em] text-blue-100 z-10 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] mt-2 italic">
            ANTIGRAVITY
          </span>
        </div>
      </div>

      {/* 底部投射在底板上的微弱光圈 */}
      <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-24 h-6 bg-blue-500/20 blur-xl rounded-full pointer-events-none" />
    </div>
  );
}
