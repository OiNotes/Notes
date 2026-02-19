import type { ColorTheme } from '../types/music';

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'rose-fire',
    name: 'Sunset',
    primary: 'rgba(244, 63, 94, 0.65)',
    secondary: 'rgba(249, 115, 22, 0.55)',
    accent: 'rgba(239, 68, 68, 0.4)',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #ef4444 50%, #f97316 100%)',
    tailwind: 'from-rose-500 via-red-500 to-orange-500',
  },
  {
    id: 'ocean-depth',
    name: 'Ocean',
    primary: 'rgba(37, 99, 235, 0.65)',
    secondary: 'rgba(168, 85, 247, 0.55)',
    accent: 'rgba(99, 102, 241, 0.4)',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #a855f7 100%)',
    tailwind: 'from-blue-600 via-indigo-500 to-purple-500',
  },
  {
    id: 'emerald-forest',
    name: 'Forest',
    primary: 'rgba(16, 185, 129, 0.65)',
    secondary: 'rgba(6, 182, 212, 0.55)',
    accent: 'rgba(20, 184, 166, 0.4)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
    tailwind: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'golden-hour',
    name: 'Golden',
    primary: 'rgba(245, 158, 11, 0.65)',
    secondary: 'rgba(234, 179, 8, 0.55)',
    accent: 'rgba(249, 115, 22, 0.4)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #eab308 100%)',
    tailwind: 'from-amber-500 via-orange-500 to-yellow-500',
  },
  {
    id: 'neon-pink',
    name: 'Neon',
    primary: 'rgba(236, 72, 153, 0.65)',
    secondary: 'rgba(168, 85, 247, 0.55)',
    accent: 'rgba(217, 70, 239, 0.4)',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #d946ef 50%, #a855f7 100%)',
    tailwind: 'from-pink-500 via-fuchsia-500 to-purple-600',
  },
  {
    id: 'violet-haze',
    name: 'Cosmic',
    primary: 'rgba(124, 58, 237, 0.65)',
    secondary: 'rgba(99, 102, 241, 0.55)',
    accent: 'rgba(139, 92, 246, 0.4)',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)',
    tailwind: 'from-violet-600 via-purple-500 to-indigo-500',
  },
  {
    id: 'arctic-aurora',
    name: 'Arctic',
    primary: 'rgba(6, 182, 212, 0.65)',
    secondary: 'rgba(99, 102, 241, 0.55)',
    accent: 'rgba(59, 130, 246, 0.4)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
    tailwind: 'from-cyan-500 via-blue-500 to-indigo-500',
  },
];

/** Helper to get theme by id or tailwind class (backwards compatible) */
export const getColorTheme = (colorValue: string): ColorTheme => {
  // First search by id
  const byId = COLOR_THEMES.find(t => t.id === colorValue);
  if (byId) return byId;

  // Then by tailwind class (backwards compatibility)
  const byTailwind = COLOR_THEMES.find(t => t.tailwind === colorValue);
  if (byTailwind) return byTailwind;

  // Default
  return COLOR_THEMES[0];
};
