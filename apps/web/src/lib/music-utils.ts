import type { Song } from "./music-schema";

/**
 * Форматировать время для отображения (MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Найти активную строку текста на основе текущего времени воспроизведения
 */
export function getActiveLyricIndex(lyrics: Song["lyrics"], currentTime: number): number {
  const currentMs = currentTime * 1000;

  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentMs >= lyrics[i].startTime) {
      return i;
    }
  }

  return -1; // до первой строки
}
