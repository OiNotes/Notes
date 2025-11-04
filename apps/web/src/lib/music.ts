import { promises as fs } from "fs";
import path from "path";
import { songSchema, type Song } from "./music-schema";

const MUSIC_CONTENT_DIR = path.join(process.cwd(), "../../content/music");

/**
 * Получить все песни из директории content/music
 */
export async function getAllSongs(): Promise<Song[]> {
  try {
    const files = await fs.readdir(MUSIC_CONTENT_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    const songs = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(MUSIC_CONTENT_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content);
        return songSchema.parse(data);
      })
    );

    // Сортировка по дате публикации (новые первые)
    return songs.sort((a, b) => {
      if (!a.publishedAt || !b.publishedAt) return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  } catch (error) {
    console.error("Error loading songs:", error);
    return [];
  }
}

/**
 * Получить одну песню по slug
 */
export async function getSongBySlug(slug: string): Promise<Song | null> {
  try {
    const filePath = path.join(MUSIC_CONTENT_DIR, `${slug}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return songSchema.parse(data);
  } catch (error) {
    console.error(`Error loading song ${slug}:`, error);
    return null;
  }
}

/**
 * Сохранить песню (для админки)
 */
export async function saveSong(song: Song): Promise<void> {
  const filePath = path.join(MUSIC_CONTENT_DIR, `${song.slug}.json`);
  await fs.writeFile(filePath, JSON.stringify(song, null, 2), "utf-8");
}

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
