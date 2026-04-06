'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { BRAND_ASSETS } from '@/config/assets';

export const GlowLogo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !logoRef.current) return;

    const container = containerRef.current;
    const logo = logoRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      gsap.to(logo, {
        rotateY: x * 30, // 增加旋轉幅度增加立體感
        rotateX: -y * 30,
        scale: 1.1,
        duration: 0.6,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };

    const onMouseLeave = () => {
      gsap.to(logo, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
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
      {/* 1. 影片標誌影像容器 (含 GSAP 3D 效果) */}
      <div 
        ref={logoRef}
        className="relative w-48 h-48 sm:w-56 sm:h-56 transform-gpu transition-shadow duration-700 active:scale-95"
      >
        {/* 背景發光氛圍 (多層次 Bloom) */}
        <div className="absolute -inset-6 bg-blue-600/30 blur-[60px] rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-700 animate-pulse" />
        <div className="absolute -inset-1 bg-cyan-400/20 blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-glow-pulse" />
        
        {/* Logo 動態影片 (高清原生質感) */}
        <div className="relative w-full h-full rounded-[40px] overflow-hidden bg-slate-950 border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
          <video 
            src={BRAND_ASSETS.LOGO.VIDEO}
            autoPlay={BRAND_ASSETS.LOGO.SETTINGS.AUTO_PLAY}
            loop={BRAND_ASSETS.LOGO.SETTINGS.LOOP}
            muted={BRAND_ASSETS.LOGO.SETTINGS.MUTED}
            playsInline={BRAND_ASSETS.LOGO.SETTINGS.PLAYS_INLINE}
            className="w-full h-full object-cover relative z-10"
          />
        </div>
        
        {/* 動態粒子系統 (保留做為氛圍點綴) */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-visible">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="logo-particle animate-float-particle" 
            />
          ))}
        </div>
      </div>

      {/* 底部投射微光 */}
      <div className="absolute -bottom-10 inset-x-0 h-20 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.2)_0%,_transparent_70%)] blur-2xl -z-10" />
    </div>
  );
};
