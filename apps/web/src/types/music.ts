// --- SHARED MUSIC TYPES ---

export type Track = {
  id: string;
  artist: string;
  title: string;
  color: string;
  coverUrl?: string;
  lyrics: (string | { original: string; translation: string; time?: number; isAppend?: boolean })[];
  audioSrc?: string | null;
  syncedLyrics?: {
    id: number;
    original: string;
    translation: string;
    time: number;
    isSynced: boolean;
    isAppend?: boolean;
  }[];
  strobeMarkers?: { id: number; time: number }[];
  category?: 'yours' | 'all' | 'visual';
};

export type CategoryFilter = 'all' | 'yours' | 'visual';

export type ColorTheme = {
  id: string;
  name: string;
  primary: string;    // RGBA for main blob
  secondary: string;  // RGBA for second blob
  accent: string;     // RGBA for center blob
  gradient: string;   // CSS gradient for vinyl
  tailwind: string;   // For backwards compatibility
};
