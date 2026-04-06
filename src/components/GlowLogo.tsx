'use client';

import React from 'react';
import { Scale } from 'lucide-react';

export default function GlowLogo() {
  return (
    <div className="relative group select-none">
      {/* 1. 外部圓角白邊框 (Squircle/Icon Frame) */}
      <div className="w-48 h-48 sm:w-56 sm:h-56 p-1.5 bg-gradient-to-br from-white via-slate-200 to-slate-400 rounded-[44px] shadow-2xl relative overflow-hidden">
        
        {/* 2. 內部深色核心 (Deep Blue Core) */}
        <div className="w-full h-full bg-[#050b18] rounded-[40px] relative overflow-hidden flex flex-col items-center justify-center border border-black/50">
          
          {/* 背景微光 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,58,138,0.3)_0%,_transparent_70%)]" />
          
          {/* 3. 霓虹天平 SVG (自定義高精細版) */}
          <div className="relative z-10 w-32 h-32 flex items-center justify-center">
            {/* 強大背光 */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[30px] rounded-full animate-pulse" />
            
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
              {/* 天平橫桿 */}
              <path 
                d="M15 45 Q50 40 85 45" 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="2" 
                strokeLinecap="round" 
                className="animate-[glow_2s_ease-in-out_infinite]"
              />
              {/* 天平中軸 */}
              <path 
                d="M50 15 L50 80 M45 80 L55 80" 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              {/* 橫桿懸掛線 */}
              <path d="M15 45 L10 65 M85 45 L90 65" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
              {/* 天平盤 */}
              <path d="M5 65 Q10 75 15 65 L5 65 Z" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M85 65 Q90 75 95 65 L85 65 Z" fill="none" stroke="#22d3ee" strokeWidth="2" />
              
              {/* 裝飾環 */}
              <circle cx="50" cy="55" r="8" fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 2" className="animate-spin-slow" />
            </svg>

            {/* 4. 粒子特效 (Particles) */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float-particle opacity-0"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* 5. 底部文字 (ANTIGRAVITY) */}
          <div className="mt-2 mb-4 z-10">
            <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
              ANTIGRAVITY
            </span>
          </div>
        </div>
      </div>

      {/* 外圈散發光暈 */}
      <div className="absolute -inset-4 bg-blue-500/10 blur-[40px] rounded-full -z-10 group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <style jsx>{`
        @keyframes glow {
          0%, 100% { opacity: 0.8; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.5); }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-20px) scale(1.5); opacity: 0; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float-particle {
          animation: float-particle ease-out infinite;
        }
      `}</style>
    </div>
  );
}
