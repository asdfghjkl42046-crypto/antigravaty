'use client';

import React from 'react';

export default function GlowLogo() {
  return (
    <div className="relative group select-none flex flex-col items-center">
      {/* 1. 主標誌影像容器 */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 transform transition-all duration-700 group-hover:scale-110 active:scale-95 drop-shadow-[0_0_30px_rgba(37,99,235,0.3)]">
        {/* 背景發光氛圍 */}
        <div className="absolute -inset-4 bg-blue-600/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Logo 本體 */}
        <img 
          src="/assets/logo.png" 
          alt="Antigravity Logo" 
          className="w-full h-full object-contain relative z-10"
        />
        
        {/* 動態粒子 (保留部分裝飾案) */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="logo-particle opacity-40" />
          <div className="logo-particle opacity-40" />
          <div className="logo-particle opacity-40" />
        </div>
      </div>

      {/* 底部發光氛圍 */}
      <div className="absolute -bottom-10 inset-x-0 h-20 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.15)_0%,_transparent_70%)] blur-2xl -z-10" />
    </div>
  );
}
