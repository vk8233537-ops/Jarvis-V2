import React from 'react';
import { ThemeMode } from '../types';

interface BackgroundFlowProps {
  themeMode: ThemeMode;
}

export const BackgroundFlow: React.FC<BackgroundFlowProps> = ({ themeMode }) => {
  const isLight = themeMode === 'glass-light';
  const isLiquid = themeMode === 'liquid-glass';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-700">
      {/* Base Canvas Gradient */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${
          isLight 
            ? 'bg-gradient-to-br from-slate-100 via-sky-100 to-indigo-100' 
            : themeMode === 'neumorphic'
            ? 'bg-[#0c101d]'
            : 'bg-gradient-to-br from-[#050816] via-[#09112a] to-[#040817]'
        }`}
      />

      {/* Ambient Floating Glowing Orbs (Faithfully grounded in Reference Images 2, 4 & 5) */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] -top-24 -left-20 animate-orb-1 opacity-70"
        style={{
          background: isLight 
            ? 'radial-gradient(circle, rgba(56,189,248,0.5) 0%, rgba(99,102,241,0.2) 70%, transparent 100%)' 
            : 'radial-gradient(circle, rgba(14,165,233,0.35) 0%, rgba(59,130,246,0.18) 60%, transparent 100%)'
        }}
      />

      <div 
        className="absolute w-[450px] h-[450px] rounded-full blur-[130px] top-1/3 -right-20 animate-orb-2 opacity-65"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(244,114,182,0.45) 0%, rgba(168,85,247,0.2) 70%, transparent 100%)'
            : isLiquid
            ? 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(139,92,246,0.18) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(245,158,11,0.28) 0%, rgba(239,68,68,0.15) 60%, transparent 100%)'
        }}
      />

      <div 
        className="absolute w-[420px] h-[420px] rounded-full blur-[110px] -bottom-20 left-1/3 animate-orb-1 opacity-60"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(14,165,233,0.2) 70%, transparent 100%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(6,182,212,0.15) 70%, transparent 100%)'
        }}
      />

      {/* Iconic 3D Glowing Ribbon / Neon Tube (From Reference Images 1 & 3) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-80 mix-blend-screen select-none"
        viewBox="0 0 1600 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Tube Gradient */}
          <linearGradient id="neonTubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#0ea5e9" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
          </linearGradient>

          {/* Secondary Tube Gradient */}
          <linearGradient id="tubeGlowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.7" />
          </linearGradient>

          {/* Liquid Glass Caustic Gradient */}
          <linearGradient id="causticGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          <filter id="tubeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="28" result="blur1" />
            <feGaussianBlur stdDeviation="14" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>

        {/* Ambient deep shadow for 3D depth */}
        <path
          d="M -100,280 C 350,150 480,50 780,180 C 1080,310 1350,190 1700,320"
          stroke="#030712"
          strokeWidth="74"
          strokeLinecap="round"
          opacity="0.5"
          filter="url(#softGlow)"
        />

        {/* Glowing wide outer halo */}
        <path
          d="M -100,280 C 350,150 480,50 780,180 C 1080,310 1350,190 1700,320"
          stroke="url(#tubeGlowGradient)"
          strokeWidth="56"
          strokeLinecap="round"
          filter="url(#tubeGlow)"
          opacity={isLight ? 0.35 : 0.65}
        />

        {/* Crisp core 3D cylindrical tube */}
        <path
          d="M -100,280 C 350,150 480,50 780,180 C 1080,310 1350,190 1700,320"
          stroke="url(#neonTubeGradient)"
          strokeWidth="38"
          strokeLinecap="round"
        />

        {/* Specular highlight stripe running along top edge of tube (creates 3D cylindrical glass/plastic feel) */}
        <path
          d="M -90,272 C 355,142 485,42 782,172 C 1082,302 1352,182 1690,312"
          stroke="url(#causticGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Secondary lower meandering 3D ribbon */}
        <path
          d="M -50,680 C 300,820 620,620 900,760 C 1180,900 1420,710 1680,820"
          stroke="url(#tubeGlowGradient)"
          strokeWidth="42"
          strokeLinecap="round"
          filter="url(#tubeGlow)"
          opacity={isLight ? 0.3 : 0.55}
        />

        <path
          d="M -50,680 C 300,820 620,620 900,760 C 1180,900 1420,710 1680,820"
          stroke="url(#neonTubeGradient)"
          strokeWidth="26"
          strokeLinecap="round"
        />

        <path
          d="M -45,675 C 305,815 625,615 902,755 C 1182,895 1422,705 1675,815"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>

      {/* Subtle fine grid overlay for tactical high-tech HUD feeling */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
