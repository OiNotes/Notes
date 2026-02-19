"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Track } from '../types/music';

/**
 * useLyricsSync — tracks which lyric line is active based on currentTime.
 */
export function useLyricsSync(
  activeTrack: Track | null,
  getCurrentTime: () => number,
  getDuration: () => number,
  isPlaying: boolean
) {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [isLyricAnimating, setIsLyricAnimating] = useState(false);

  // Update lyrics index based on currentTime
  const updateLyricIndex = useCallback(() => {
    if (!activeTrack) return;

    const current = getCurrentTime();
    const dur = getDuration();

    const hasTiming = activeTrack.lyrics.length > 0 &&
      typeof activeTrack.lyrics[0] !== 'string' &&
      'time' in (activeTrack.lyrics[0] as any);

    if (activeTrack.syncedLyrics || hasTiming) {
      const lyricsSource = activeTrack.syncedLyrics || activeTrack.lyrics;
      let index = -1;
      for (let i = 0; i < lyricsSource.length; i++) {
        const line = lyricsSource[i];
        const lineTime = typeof line === 'string' ? 0 : ('time' in line ? (line.time ?? 0) : 0);
        if (current >= lineTime) {
          index = i;
        } else {
          break;
        }
      }
      if (index !== -1) {
        setCurrentLyricIndex(prev => {
          if (prev !== index) return index;
          return prev;
        });
      }
    } else {
      // Fallback for demo tracks
      const totalLyrics = activeTrack.lyrics.length;
      if (totalLyrics > 0 && dur > 0) {
        const lyricsPerPercent = 100 / totalLyrics;
        const newIndex = Math.floor(((current / dur) * 100) / lyricsPerPercent);
        setCurrentLyricIndex(Math.min(newIndex, totalLyrics - 1));
      }
    }
  }, [activeTrack, getCurrentTime, getDuration]);

  // Smooth lyrics transition — fade out, change text, fade in
  useEffect(() => {
    setIsLyricAnimating(true);
    const timer = setTimeout(() => setIsLyricAnimating(false), 250);
    return () => clearTimeout(timer);
  }, [currentLyricIndex]);

  // Reset on track change
  useEffect(() => {
    setCurrentLyricIndex(0);
  }, [activeTrack?.id]);

  return {
    currentLyricIndex,
    setCurrentLyricIndex,
    isLyricAnimating,
    updateLyricIndex,
  };
}
