"use client";

import React from 'react';
import type { Track } from '../../types/music';
import { getColorTheme } from '../../lib/color-themes';

// --- TONEARM ---
export const Tonearm = ({ isActive }: { isActive: boolean }) => {
  const rotation = isActive ? 32 : 0;
  return (
    <div
      className="absolute top-[5%] right-[5%] w-[25%] h-[65%] z-30 pointer-events-none transition-transform duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1) origin-[50%_15%]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Base/Pivot */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] aspect-square rounded-full bg-gradient-to-b from-[var(--color-muted)] to-[var(--color-surface)] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center border border-white/10">
        <div className="w-[70%] h-[70%] rounded-full bg-[var(--color-surface-alt)] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border border-black flex items-center justify-center">
          <div className="w-[40%] h-[40%] rounded-full bg-gradient-to-br from-gray-300 to-gray-600 shadow-md" />
        </div>
      </div>

      {/* Arm Structure */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[18%] bg-[#222] rounded-sm shadow-lg border-t border-white/5" />

      {/* Main Tube */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[10%] h-[72%] bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 shadow-2xl rounded-full" />

      {/* Headshell */}
      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[32%] h-[16%] bg-[var(--color-surface)] rounded-sm border border-white/10 shadow-xl transform -rotate-12 origin-top flex flex-col items-center">
         <div className="w-full h-full bg-gradient-to-b from-[var(--color-border)] to-[var(--color-bg)] rounded-sm relative">
            {/* Finger lift */}
            <div className="absolute -right-[30%] top-[20%] w-[60%] h-[8%] bg-gray-400 rounded-full rotate-12" />
            {/* Cartridge */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-amber-500/80 rounded-b-sm shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
         </div>
      </div>

      {/* Counterweight */}
       <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[45%] h-[12%] bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-800 rounded-sm shadow-lg border border-black/50" />
    </div>
  );
};

// --- VINYL RECORD ---
export const VinylRecord = ({ track, isPlaying }: { track: Track, isPlaying: boolean }) => {
  return (
    <div className={`relative w-full h-full rounded-full shadow-2xl flex items-center justify-center transition-all duration-1000 ${isPlaying ? 'shadow-[0_0_50px_rgba(0,0,0,0.6)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`}>
      {/* Outer Rim / Base */}
      <div className="absolute inset-0 rounded-full bg-[#0a0a0a] border border-[#1a1a1a]" />

      {/* Grooves Texture - Realistic */}
      <div className={`absolute inset-[2%] rounded-full overflow-hidden opacity-90 ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '1.8s' }}>
         <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#111_0deg,#1c1c1c_45deg,#0f0f0f_90deg,#1c1c1c_135deg,#111_180deg,#1c1c1c_225deg,#0f0f0f_270deg,#1c1c1c_315deg,#111_360deg)]" />
         <div className="absolute inset-0 rounded-full opacity-40" style={{ background: 'repeating-radial-gradient(#000 0, #000 2px, #222 3px, #222 4px)' }} />
      </div>

      {/* Light Reflection (Sheen) */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent rotate-45 pointer-events-none mix-blend-overlay ${isPlaying ? 'animate-pulse' : ''}`} />

      {/* Label */}
      <div className={`absolute z-10 w-[38%] h-[38%] rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center border-[3px] border-[#0a0a0a] overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '4s' }}>
        <div className="absolute inset-0" style={{ background: getColorTheme(track.color).gradient }} />

        {/* Label Details */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center scale-75">
           <div className="w-12 h-px bg-black/20 mb-1" />
           <span className="text-[6px] font-mono uppercase tracking-widest text-black/60 font-bold">Stereo</span>
           <div className="w-12 h-px bg-black/20 mt-1" />
        </div>

        {/* Center Hole */}
        <div className="absolute w-3 h-3 bg-[#050505] rounded-full border border-gray-800 shadow-inner z-20" />
      </div>
    </div>
  );
};

// --- TURNTABLE ---
export const Turntable = ({ track, isPlaying, isTonearmMoving }: { track: Track, isPlaying: boolean, isTonearmMoving: boolean }) => {
  return (
    <div className="relative w-full aspect-square rounded-[2.5rem] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 transform transition-transform duration-1000 bg-[#111]">
       {/* Chassis Texture - Brushed Metal/Dark Matte */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-[#121212] overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      </div>

      {/* Power Light */}
      <div className="absolute bottom-8 left-8 w-14 h-14 rounded-full bg-[#080808] shadow-[inset_0_2px_5px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center border border-white/5">
        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isPlaying ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'bg-gray-800'}`} />
      </div>

      {/* Pitch Slider - Cosmetic */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 items-center">
        <div className="w-1.5 h-10 bg-[#050505] rounded-full relative overflow-hidden shadow-inner border border-white/5">
          <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-t from-amber-900 to-amber-600 opacity-50" />
          <div className="absolute top-[40%] w-full h-[20%] bg-gray-600 rounded-sm shadow-sm" />
        </div>
      </div>

      {/* Platter */}
      <div className="relative w-[86%] h-[86%] rounded-full bg-[#050505] shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-[#1a1a1a] flex items-center justify-center">
        {/* Platter Ring */}
        <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />

        <div className="w-[94%] h-[94%] transition-transform duration-[2000ms]">
          <VinylRecord track={track} isPlaying={isPlaying} />
        </div>
      </div>

      <Tonearm isActive={isTonearmMoving} />
    </div>
  );
};
