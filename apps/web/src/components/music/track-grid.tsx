"use client";

import React from 'react';
import { FileAudio } from 'lucide-react';
import type { Track, ColorTheme } from '../../types/music';
import { BentoItem } from './bento-item';
import { VisualizationPoster } from './visualization-poster';
import { TrackSkeletonGrid } from './track-skeleton';

export const TrackGrid = ({
  activeCategory,
  filteredTracks,
  activeTrack,
  isPlaying,
  isLoading,
  getColorTheme,
  onSelectTrack,
  onRequestStudio,
}: {
  activeCategory: string;
  filteredTracks: Track[];
  activeTrack: Track | null;
  isPlaying: boolean;
  isLoading?: boolean;
  getColorTheme: (color: string) => ColorTheme;
  onSelectTrack: (track: Track) => void;
  onRequestStudio?: () => void;
}) => {
  return (
    <section
      aria-label="Track library"
      className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain z-10"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+7rem)]">
        {/* Loading Skeleton */}
        {isLoading && filteredTracks.length === 0 && activeCategory !== 'visual' && (
          <TrackSkeletonGrid />
        )}

        {/* Visual Category - Show Poster */}
        {activeCategory === 'visual' && filteredTracks.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredTracks.map((track) => (
              <VisualizationPoster
                key={track.id}
                track={track}
                onClick={() => onSelectTrack(track)}
                isActive={activeTrack?.id === track.id}
                isPlaying={isPlaying}
              />
            ))}
          </div>
        ) : (
          /* Other Categories - Show Bento Grid */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(180px,1fr)] sm:auto-rows-[minmax(200px,1fr)] lg:auto-rows-[minmax(220px,1fr)]">
            {filteredTracks.map((track, i) => {
              const size = i === 0 ? 'large' : i < 3 ? 'medium' : 'small';
              return (
                <div
                  key={track.id}
                  className={`animate-bento-fade-in col-span-1 row-span-1
                    ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                    ${size === 'medium' ? 'md:row-span-2' : ''}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <BentoItem
                    track={track}
                    size={size}
                    onClick={() => onSelectTrack(track)}
                    isActive={activeTrack?.id === track.id}
                    isPlaying={isPlaying}
                    getColorTheme={getColorTheme}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/60">
            <FileAudio size={48} className="mb-4 opacity-70" />
            <p className="text-lg font-medium text-white/70">Нет треков</p>
            <p className="text-sm mt-1 text-white/50">Добавьте первый трек через студию</p>
            {onRequestStudio && (
              <button
                onClick={onRequestStudio}
                className="mt-5 px-6 py-2.5 rounded-lg font-medium bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95"
              >
                Открыть студию
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
