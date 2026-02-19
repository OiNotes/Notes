"use client";

import React from 'react';
import Image from 'next/image';
import type { Track, ColorTheme } from '../../types/music';

// --- BENTO ITEM COMPONENT ---
const BentoItemInner = ({
  track,
  size = 'small',
  onClick,
  isActive,
  isPlaying,
  getColorTheme
}: {
  track: Track;
  size?: 'small' | 'medium' | 'large';
  onClick: () => void;
  isActive?: boolean;
  isPlaying?: boolean;
  getColorTheme: (color: string) => ColorTheme;
}) => {
  const theme = getColorTheme(track.color);

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[1.5rem] cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border border-white/5
        col-span-1 row-span-1
        ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
        ${size === 'medium' ? 'md:row-span-2' : ''}
        ${isActive ? 'ring-2 ring-amber-500/50' : ''}`}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={`${track.title} — обложка`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full transition-transform duration-700 group-hover:scale-110"
            style={{ background: theme.gradient }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Play Button */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/30 ${isActive && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="w-12 h-12 rounded-full bg-white/80 text-black backdrop-blur-md flex items-center justify-center shadow-lg shadow-black/30">
          {isActive && isPlaying ? (
            <div className="flex gap-0.5 items-end h-4">
              <div className="w-1 bg-white animate-[music-bar_0.6s_ease-in-out_infinite] h-full" />
              <div className="w-1 bg-white animate-[music-bar_0.6s_ease-in-out_infinite_0.2s] h-2/3" />
              <div className="w-1 bg-white animate-[music-bar_0.6s_ease-in-out_infinite_0.4s] h-full" />
            </div>
          ) : (
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className={`text-white font-semibold leading-tight line-clamp-2 transition-colors
          ${size === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}
          ${isActive ? 'text-amber-400' : ''}`}>{track.title}</h3>
        <p className="text-white/80 text-sm line-clamp-1">{track.artist}</p>
      </div>
    </div>
  );
};

/** React.memo with custom comparator checking only (track.id, isActive, isPlaying) */
export const BentoItem = React.memo(BentoItemInner, (prevProps, nextProps) => {
  return (
    prevProps.track.id === nextProps.track.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.size === nextProps.size
  );
});

BentoItem.displayName = 'BentoItem';
