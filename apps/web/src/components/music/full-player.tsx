"use client";

import React from 'react';
import { X, Play, Pause, SkipBack, SkipForward, MoreHorizontal } from 'lucide-react';
import type { Track } from '../../types/music';
import { getColorTheme } from '../../lib/color-themes';
import { Turntable } from './turntable';

export const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const FullPlayer = ({
  activeTrack,
  isPlaying,
  immersiveMode,
  isTonearmMoving,
  currentLyricIndex,
  currentTime,
  duration,
  playerShowFlash,
  progressBarRef,
  onClose,
  onTogglePlay,
  onToggleImmersive,
  onScrub,
  onSkip,
}: {
  activeTrack: Track;
  isPlaying: boolean;
  immersiveMode: boolean;
  isTonearmMoving: boolean;
  currentLyricIndex: number;
  currentTime: number;
  duration: number;
  playerShowFlash: boolean;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onTogglePlay: () => void;
  onToggleImmersive: () => void;
  onScrub: (clientX: number) => void;
  onSkip: (seconds: number) => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-hidden pb-[env(safe-area-inset-bottom)] flex items-stretch justify-center animate-slide-up-slow">
      {/* Strobe Flash Overlay */}
      {playerShowFlash && (
        <div className="absolute inset-0 z-50 bg-white pointer-events-none" style={{ animation: 'strobe-flash var(--dur-strobe-flash, 140ms) ease-out forwards' }} />
      )}

      {/* Background Grain + Dynamic Mesh Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />
        {(() => {
          const theme = getColorTheme(activeTrack.color);
          return (
            <div className="absolute inset-0 overflow-hidden">
              <div
                className={`absolute -top-16 -left-24 w-[70%] h-[70%] rounded-full blur-[130px] mix-blend-screen mesh-drift ${isPlaying ? 'opacity-60' : 'opacity-30'}`}
                style={{ background: theme.primary }}
              />
              <div
                className={`absolute bottom-[-12%] right-[-8%] w-[60%] h-[60%] rounded-full blur-[120px] mix-blend-screen mesh-pulse ${isPlaying ? 'opacity-55' : 'opacity-25'}`}
                style={{ background: theme.secondary }}
              />
              <div
                className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[55%] h-[55%] rounded-full blur-[110px] mix-blend-screen mesh-glow ${isPlaying ? 'opacity-45' : 'opacity-20'}`}
                style={{ background: theme.accent }}
              />
            </div>
          );
        })()}
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-6xl px-4 sm:px-8 lg:px-12 py-4 sm:py-6 md:py-10">

        {/* Header */}
        <header className="flex justify-between items-center mb-2 sm:mb-4 transition-all duration-500 opacity-80 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-gray-400">Now Playing</div>
          <button
            onClick={onToggleImmersive}
            className="p-2 hover:bg-white/5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <MoreHorizontal className="w-6 h-6 text-gray-300" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center py-2 sm:py-6 relative min-h-0">
          {/* 1. VINYL VIEW */}
          <div className={`w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] aspect-square transition-all duration-500 ease-out
             ${immersiveMode ? 'opacity-0 scale-90 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
             <Turntable track={activeTrack} isPlaying={isPlaying} isTonearmMoving={isTonearmMoving} />
          </div>

          {/* 2. LYRICS VIEW */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center px-4 text-center transition-all duration-500
             ${immersiveMode ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
             {activeTrack.lyrics?.length > 0 ? (
                <div className="w-full flex flex-col items-center justify-center min-h-[200px] animate-lyrics-fade-in">
                   <div key={currentLyricIndex} className="animate-lyric-crossfade">
                      <h2
                        className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-lyrics text-white leading-tight uppercase tracking-tight text-balance"
                        style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.3)' }}
                      >
                        {(() => {
                          const lyric = activeTrack.lyrics[currentLyricIndex];
                          if (!lyric) return '...';
                          if (typeof lyric === 'string') return lyric;

                          let text = lyric.translation || lyric.original || '...';
                          if (lyric.isAppend) {
                              let prevIdx = currentLyricIndex - 1;
                              while (prevIdx >= 0) {
                                  const nextLyric = activeTrack.lyrics[prevIdx + 1];
                                  if (typeof nextLyric === 'string' || !nextLyric?.isAppend) break;
                                  const prev = activeTrack.lyrics[prevIdx];
                                  if (typeof prev !== 'string') {
                                      text = (prev.translation || prev.original) + " " + text;
                                      if (!prev.isAppend) break;
                                  }
                                  prevIdx--;
                              }
                          }
                          return text;
                        })()}
                      </h2>
                   </div>
                </div>
             ) : (
               <p className="text-white/60 font-mono uppercase tracking-widest">Нет текста песни</p>
             )}
          </div>
        </main>

        {/* Bottom Controls */}
        <div className={`mt-auto space-y-6 transition-all duration-500 ${immersiveMode ? 'opacity-60' : ''} pb-[calc(env(safe-area-inset-bottom,0px)+12px)]`}>

          {/* Song Title & Artist */}
          <div className={`space-y-1 transition-all duration-300 ${immersiveMode ? 'opacity-0 h-0 overflow-hidden' : ''}`}>
            <h1 className="text-2xl font-serif font-medium tracking-wide text-white leading-tight line-clamp-1">
              {activeTrack.title}
            </h1>
            <p className="text-lg text-gray-400 font-light">{activeTrack.artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2 group">
            <div
              ref={progressBarRef}
              className={`relative w-full bg-[#222] rounded-full overflow-hidden cursor-pointer transition-all ${immersiveMode ? 'h-0.5' : 'h-1'}`}
              onClick={(e) => onScrub(e.clientX)}
              onTouchStart={(e) => {
                if (e.touches[0]) onScrub(e.touches[0].clientX);
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) onScrub(e.touches[0].clientX);
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-linear"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className={`flex justify-between text-[10px] font-mono text-gray-600 tracking-wider transition-all duration-300 ${immersiveMode ? 'opacity-0 h-0' : ''}`}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className={`flex items-center justify-center pb-4 transition-all duration-300 ${immersiveMode ? 'gap-0' : 'gap-8'}`}>
             {/* Skip Back */}
             <button
               onClick={() => onSkip(-10)}
               className={`text-gray-400 hover:text-white transition-all duration-300 active:scale-95 ${immersiveMode ? 'opacity-0 w-0 overflow-hidden pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'}`}
             >
               <SkipBack className="w-8 h-8" />
             </button>

             {/* Play/Pause */}
             <button
              onClick={onTogglePlay}
              className={`bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-110 transition-transform duration-150
                ${immersiveMode ? 'w-14 h-14' : 'w-16 h-16'}`}
             >
               {isPlaying ? (
                 <Pause className="w-6 h-6 text-black" />
               ) : (
                 <Play className="w-6 h-6 ml-1 text-black" />
               )}
             </button>

             {/* Skip Forward */}
             <button
               onClick={() => onSkip(10)}
               className={`text-gray-400 hover:text-white transition-all duration-300 active:scale-95 ${immersiveMode ? 'opacity-0 w-0 overflow-hidden pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'}`}
             >
               <SkipForward className="w-8 h-8" />
             </button>
          </div>

          {/* Device Selection */}
          <div className={`flex justify-center pb-2 transition-all duration-300 ${immersiveMode ? 'opacity-0 h-0 overflow-hidden' : ''}`}>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] rounded-full border border-white/5 cursor-pointer hover:bg-[#222] transition-colors">
               <span className="w-2 h-2 rounded-full bg-green-500" />
               <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">iPhone</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
