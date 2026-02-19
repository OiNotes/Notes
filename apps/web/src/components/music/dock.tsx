"use client";

import React from 'react';
import type { Track, ColorTheme, CategoryFilter } from '../../types/music';

// --- DOCK COMPONENT ---
export const Dock = ({
  activeCategory,
  setActiveCategory,
  onStudioOpen,
  isAdmin
}: {
  activeCategory: string;
  setActiveCategory: (cat: CategoryFilter) => void;
  onStudioOpen: () => void;
  isAdmin: boolean;
}) => (
  <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto pb-[env(safe-area-inset-bottom)]">
    <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      <button
        onClick={() => setActiveCategory('visual')}
        className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
          activeCategory === 'visual'
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        Визуализация
      </button>
      <button
        onClick={() => setActiveCategory('all')}
        className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
          activeCategory === 'all'
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        Ваши
      </button>
      <button
        onClick={() => setActiveCategory('yours')}
        className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
          activeCategory === 'yours'
            ? 'bg-white/20 text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        Мои
      </button>
      {isAdmin && (
        <button
          onClick={onStudioOpen}
          className="p-3 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

// --- MINI PLAYER COMPONENT ---
export const MiniPlayer = ({
  track,
  isPlaying,
  onToggle,
  onOpen,
  getColorTheme
}: {
  track: Track;
  isPlaying: boolean;
  onToggle: () => void;
  onOpen: () => void;
  getColorTheme: (color: string) => ColorTheme;
}) => {
  const theme = getColorTheme(track.color);

  return (
    <div
      onClick={onOpen}
      className="fixed left-4 right-4 sm:left-auto sm:right-8 sm:w-[22rem] sm:max-w-[24rem] z-30 bg-[#121212]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl cursor-pointer hover:bg-[#1a1a1a]/90 transition-colors shadow-2xl animate-fade-in-up"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 4.75rem)' }}
    >
      <div className="flex items-center gap-3">
        {/* Cover */}
        <div
          className="w-12 h-12 rounded-xl flex-shrink-0"
          style={{ background: theme.gradient }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{track.title}</p>
          <p className="text-white/50 text-xs truncate">{track.artist}</p>
        </div>

        {/* Play/Pause */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 hover:scale-105 active:scale-110 transition-transform duration-150"
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
