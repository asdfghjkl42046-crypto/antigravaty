'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function GlowLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !logoRef.current) return;

    const container = containerRef.current;
    const logo = logoRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      // 計算傾斜角度 (最大 15 度)
      const xPercent = (x / width - 0.5) * 2;
      const yPercent = (y / height - 0.5) * 2;
      
      gsap.to(logo, {
        rotateY: xPercent * 15,
        rotateX: -yPercent * 15,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };

    const onMouseLeave = () => {
      gsap.to(logo, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)',
      });
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative group select-none flex flex-col items-center">
      {/* 1. 主標誌影像容器 (含 GSAP 3D 效果) */}
      <div 
        ref={logoRef}
        className="relative w-48 h-48 sm:w-56 sm:h-56 transform-gpu transition-shadow duration-700 active:scale-95"
      >
        {/* 背景發光氛圍 (多層次 Bloom) */}
        <div className="absolute -inset-6 bg-blue-600/30 blur-[60px] rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-700 animate-pulse" />
        <div className="absolute -inset-1 bg-cyan-400/20 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-glow-pulse" />
        
        {/* Logo 本體 (增加高對比與銳利度濾鏡) */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-slate-950 border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
          <img 
            src="/assets/logo.png" 
            alt="Antigravity Logo" 
            className="w-full h-full object-cover relative z-10 contrast-[1.1] brightness-[1.05] saturate-[1.1] shadow-inner"
          />
          
          {/* 高清紋理疊層 (Noise) */}
          <div className="absolute inset-0 noise-overlay z-20 pointer-events-none" />
          
          {/* 掃描光束特效 (Shine Sweep) */}
          <div className="absolute inset-[-100%] bg-gradient-to-br from-transparent via-white/30 to-transparent animate-shine-sweep z-30 pointer-events-none" />
        </div>
        
        {/* 動態粒子系統 (數位塵埃) */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="logo-particle animate-float-particle" 
              style={{
                '--left': `${10 + Math.random() * 80}%`,
                '--top': `${20 + Math.random() * 60}%`,
                '--delay': `${Math.random() * 2}s`,
                '--duration': `${2 + Math.random() * 2}s`,
                '--color-cyan-400': i % 2 === 0 ? '#22d3ee' : '#3b82f6'
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* 底部投射微光 */}
      <div className="absolute -bottom-10 inset-x-0 h-20 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.2)_0%,_transparent_70%)] blur-2xl -z-10" />
    </div>
  );
}
