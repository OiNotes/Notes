"use client";

import React from 'react';
import Image from 'next/image';
import type { Track } from '../../types/music';

export const VisualizationPoster = ({
  track,
  onClick,
  isActive,
  isPlaying
}: {
  track: Track;
  onClick: () => void;
  isActive?: boolean;
  isPlaying?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative w-full aspect-[3/4] sm:aspect-[2/3] md:aspect-video max-h-[75dvh] overflow-hidden rounded-3xl cursor-pointer transition-all duration-700 hover:scale-[1.01] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
    >
      {/* Full Cover Background */}
      <div className="absolute inset-0">
        {track.coverUrl ? (
          <Image
            src={track.coverUrl}
            alt={`${track.title} — афиша`}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-red-900" />
        )}
        {/* Cinematic Gradient Overlay — simplified single layer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      </div>

      {/* Play Button - Center */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isActive && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
          {isActive && isPlaying ? (
            <div className="flex gap-1 items-end h-8">
              <div className="w-1.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite] h-full rounded-full" />
              <div className="w-1.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite_0.2s] h-2/3 rounded-full" />
              <div className="w-1.5 bg-white animate-[music-bar_0.6s_ease-in-out_infinite_0.4s] h-full rounded-full" />
            </div>
          ) : (
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Track Info - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/50 text-xs sm:text-sm uppercase tracking-widest mb-2">Визуализация</p>
            <h2 className={`text-white text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-2 transition-colors ${isActive ? 'text-amber-400' : ''}`}>
              {track.title}
            </h2>
            <p className="text-white/70 text-base sm:text-xl">{track.artist}</p>
          </div>
          {isActive && isPlaying && (
            <div className="hidden sm:flex items-center gap-2 text-white/50 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Воспроизводится
            </div>
          )}
        </div>
      </div>

      {/* Decorative Corner Accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-white/20 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-white/20 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-white/20 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-white/20 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
