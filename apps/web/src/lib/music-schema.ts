import { z } from "zod";

/**
 * Схема для одной строки текста песни с таймингом
 */
export const lyricLineSchema = z.object({
  id: z.string(),
  text: z.string(),
  startTime: z.number(), // milliseconds
  endTime: z.number().optional(), // optional end time for highlighting
});

/**
 * Схема для песни
 */
export const songSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  artist: z.string(),
  originalArtist: z.string().optional(), // если это кавер
  audioUrl: z.string(), // путь к MP3 файлу
  coverImageUrl: z.string(), // обложка песни
  duration: z.number(), // длительность в секундах
  lyrics: z.array(lyricLineSchema),
  publishedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(), // описание перевода
  accent: z.string().optional(), // акцентный цвет для UI
});

// TypeScript типы
export type LyricLine = z.infer<typeof lyricLineSchema>;
export type Song = z.infer<typeof songSchema>;

/**
 * Схема для черновика песни в админке (до публикации)
 */
export const songDraftSchema = songSchema.extend({
  published: z.boolean().default(false),
});

export type SongDraft = z.infer<typeof songDraftSchema>;
