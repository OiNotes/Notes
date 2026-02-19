import { z } from 'zod';

// --- Lyric Schema ---
export const LyricSchema = z.object({
  original: z.string().max(2000).default(''),
  translation: z.string().max(2000).default(''),
  time: z.number().min(0).default(0),
  isSynced: z.boolean().default(false),
  isAppend: z.boolean().default(false),
});

// --- Strobe Marker Schema ---
export const StrobeMarkerSchema = z.object({
  time: z.number().min(0),
});

// --- Track Create Schema (POST) ---
export const TrackCreateSchema = z.object({
  artist: z.string().min(1, 'artist is required').max(200),
  title: z.string().min(1, 'title is required').max(200),
  color: z.string().min(1, 'color is required').max(500),
  audioPath: z.string().min(1, 'audioPath is required').max(500),
  coverUrl: z.string().max(1000).nullable().optional(),
  category: z.enum(['yours', 'all', 'visual']).default('yours'),
  lyrics: z.array(LyricSchema).optional(),
  strobeMarkers: z.array(StrobeMarkerSchema).optional(),
});

// --- Track Update Schema (PUT) ---
export const TrackUpdateSchema = z.object({
  artist: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  category: z.enum(['yours', 'all', 'visual']).optional(),
  coverUrl: z.string().max(1000).nullable().optional(),
  lyrics: z.array(LyricSchema).optional(),
  strobeMarkers: z.array(StrobeMarkerSchema).optional(),
});

export type TrackCreateInput = z.infer<typeof TrackCreateSchema>;
export type TrackUpdateInput = z.infer<typeof TrackUpdateSchema>;
export type LyricInput = z.infer<typeof LyricSchema>;
export type StrobeMarkerInput = z.infer<typeof StrobeMarkerSchema>;
