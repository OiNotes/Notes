"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Upload,
  FileAudio,
  FileText,
  Check,
  Download,
  Share,
  Edit3,
  ChevronRight,
  ChevronDown,
  Mic,
  Trash2,
  Edit2,
  Save,
  MoreVertical
} from 'lucide-react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Zap, MoreHorizontal } from 'lucide-react';

import { PlaceboVisualizer } from '../../../components/placebo-visualizer';

// --- TYPES ---
type Track = {
  id: string;
  artist: string;
  title: string;
  color: string;
  coverUrl?: string;
  lyrics: (string | { original: string; translation: string; time?: number })[];
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

// No initial tracks - all data loaded from database

// --- BENTO ITEM COMPONENT ---
const BentoItem = ({ 
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
  getColorTheme: (color: string) => { gradient: string };
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
          <img
            src={track.coverUrl}
            alt={`${track.title} — обложка`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
        <p className="text-white/70 text-xs sm:text-sm line-clamp-1">{track.artist}</p>
      </div>
    </div>
  );
};

// --- DOCK COMPONENT ---
const Dock = ({ 
  activeCategory, 
  setActiveCategory, 
  onStudioOpen,
  isAdmin 
}: { 
  activeCategory: string; 
  setActiveCategory: (cat: any) => void;
  onStudioOpen: () => void;
  isAdmin: boolean;
}) => (
  <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-auto pb-[env(safe-area-inset-bottom)] mb-4">
    <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      <button 
        onClick={() => setActiveCategory('visual')}
        className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
          activeCategory === 'visual' 
            ? 'bg-white/20 text-white' 
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        Визуализация
      </button>
      <button 
        onClick={() => setActiveCategory('all')}
        className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
          activeCategory === 'all' 
            ? 'bg-white/20 text-white' 
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        Ваши
      </button>
      <button 
        onClick={() => setActiveCategory('yours')}
        className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
          activeCategory === 'yours' 
            ? 'bg-white/20 text-white' 
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        Мои
      </button>
      {isAdmin && (
        <button 
          onClick={onStudioOpen}
          className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

// --- MINI PLAYER COMPONENT ---
const MiniPlayer = ({ 
  track, 
  isPlaying, 
  onToggle, 
  onOpen,
  getColorTheme 
}: { 
  track: Track; 
  isPlaying: boolean;
  onToggle: () => void;
  onOpen: () => void;
  getColorTheme: (color: string) => { gradient: string };
}) => {
  const theme = getColorTheme(track.color);
  
  return (
    <div 
      onClick={onOpen}
      className="fixed left-4 right-4 sm:left-auto sm:right-8 sm:w-[22rem] sm:max-w-[24rem] z-30 bg-[#121212]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl cursor-pointer hover:bg-[#1a1a1a]/90 transition-colors shadow-2xl animate-fade-in-up"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 4.75rem)' }}
    >
      <div className="flex items-center gap-3">
        {/* Cover */}
        <div 
          className="w-12 h-12 rounded-xl flex-shrink-0"
          style={{ background: theme.gradient }}
        />
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{track.title}</p>
          <p className="text-white/50 text-xs truncate">{track.artist}</p>
        </div>
        
        {/* Play/Pause */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// --- AMBIENT BACKGROUND COMPONENT ---
const AmbientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505] pointer-events-none">
    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-900/20 rounded-full blur-[120px] animate-blob" />
    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-amber-900/15 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '-7s' }} />
    <div className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-rose-900/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '-14s' }} />
  </div>
);

// --- COLOR THEMES (Apple Music Style) ---
type ColorTheme = {
  id: string;
  name: string;
  primary: string;    // RGBA для основного блоба
  secondary: string;  // RGBA для второго блоба
  accent: string;     // RGBA для центрального блоба
  gradient: string;   // CSS градиент для винила
  tailwind: string;   // Для обратной совместимости
};

const COLOR_THEMES: ColorTheme[] = [
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

// Хелпер для получения темы (поддержка старых Tailwind классов из БД)
const getColorTheme = (colorValue: string): ColorTheme => {
  // Сначала ищем по id
  const byId = COLOR_THEMES.find(t => t.id === colorValue);
  if (byId) return byId;

  // Затем по tailwind классу (обратная совместимость)
  const byTailwind = COLOR_THEMES.find(t => t.tailwind === colorValue);
  if (byTailwind) return byTailwind;

  // Дефолт
  return COLOR_THEMES[0];
};

// --- UI COMPONENTS ---
const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: any) => {
  const baseStyle = "px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed justify-center";
  const variants = {
    primary: "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    outline: "border-2 border-white/20 text-white hover:border-white hover:bg-white/5"
  };

  // @ts-ignore
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

// --- CATEGORY TABS ---
type CategoryFilter = 'all' | 'yours' | 'visual';

const CategoryTabs = ({
  active,
  onChange
}: {
  active: CategoryFilter;
  onChange: (cat: CategoryFilter) => void;
}) => {
  const tabs: { id: CategoryFilter; label: string }[] = [
    { id: 'visual', label: 'Визуализация' },
    { id: 'all', label: 'Ваши песни' },
    { id: 'yours', label: 'Мои песни' }
  ];

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 sm:px-0">
      <div className="relative flex items-center bg-white/10 p-1 rounded-xl h-[36px]">
        {/* Sliding Indicator */}
        <div
          className={`absolute top-1 bottom-1 rounded-lg bg-white/20 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
            ${active === 'visual' ? 'left-1 w-[calc(33.33%-4px)]' : 
              active === 'all' ? 'left-[33.33%] w-[calc(33.33%-4px)]' : 
              'left-[66.66%] w-[calc(33.33%-4px)]'}
          `}
        />
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 relative z-10 text-[13px] font-medium text-center transition-all duration-200
              ${active === tab.id ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- VINYL COMPONENTS ---
const Tonearm = ({ isActive }: { isActive: boolean }) => {
  const rotation = isActive ? 32 : 0;
  return (
    <div
      className="absolute top-[5%] right-[5%] w-[25%] h-[65%] z-30 pointer-events-none transition-transform duration-[2000ms] cubic-bezier(0.4, 0, 0.2, 1) origin-[50%_15%]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Base/Pivot */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] aspect-square rounded-full bg-gradient-to-b from-[#444] to-[#111] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center border border-white/10">
        <div className="w-[70%] h-[70%] rounded-full bg-[#1a1a1a] shadow-[inset_0_2px_5px_rgba(0,0,0,0.8)] border border-black flex items-center justify-center">
          <div className="w-[40%] h-[40%] rounded-full bg-gradient-to-br from-gray-300 to-gray-600 shadow-md" />
        </div>
      </div>
      
      {/* Arm Structure */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[18%] bg-[#222] rounded-sm shadow-lg border-t border-white/5" />
      
      {/* Main Tube */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[10%] h-[72%] bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 shadow-2xl rounded-full" />
      
      {/* Headshell */}
      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[32%] h-[16%] bg-[#111] rounded-sm border border-white/10 shadow-xl transform -rotate-12 origin-top flex flex-col items-center">
         <div className="w-full h-full bg-gradient-to-b from-[#222] to-[#0a0a0a] rounded-sm relative">
            {/* Finger lift */}
            <div className="absolute -right-[30%] top-[20%] w-[60%] h-[8%] bg-gray-400 rounded-full rotate-12" />
            {/* Cartridge */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-amber-500/80 rounded-b-sm shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
         </div>
      </div>
      
      {/* Counterweight */}
       <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[45%] h-[12%] bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-800 rounded-sm shadow-lg border border-black/50" />
    </div>
  );
};

const VinylRecord = ({ track, isPlaying }: { track: Track, isPlaying: boolean }) => {
  return (
    <div className={`relative w-full h-full rounded-full shadow-2xl flex items-center justify-center transition-all duration-1000 ${isPlaying ? 'shadow-[0_0_50px_rgba(0,0,0,0.6)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`}>
      {/* Outer Rim / Base */}
      <div className="absolute inset-0 rounded-full bg-[#0a0a0a] border border-[#1a1a1a]" />

      {/* Grooves Texture - Realistic */}
      <div className={`absolute inset-[2%] rounded-full overflow-hidden opacity-90 ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '1.8s' }}>
         <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#111_0deg,#1c1c1c_45deg,#0f0f0f_90deg,#1c1c1c_135deg,#111_180deg,#1c1c1c_225deg,#0f0f0f_270deg,#1c1c1c_315deg,#111_360deg)]" />
         <div className="absolute inset-0 rounded-full opacity-40" style={{ background: 'repeating-radial-gradient(#000 0, #000 2px, #222 3px, #222 4px)' }} />
      </div>
      
      {/* Light Reflection (Sheen) */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent rotate-45 pointer-events-none mix-blend-overlay ${isPlaying ? 'animate-pulse' : ''}`} />

      {/* Label */}
      <div className={`absolute z-10 w-[38%] h-[38%] rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center border-[3px] border-[#0a0a0a] overflow-hidden ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '4s' }}>
        <div className="absolute inset-0" style={{ background: getColorTheme(track.color).gradient }} />
        
        {/* Label Details */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center scale-75">
           <div className="w-12 h-px bg-black/20 mb-1" />
           <span className="text-[6px] font-mono uppercase tracking-widest text-black/60 font-bold">Stereo</span>
           <div className="w-12 h-px bg-black/20 mt-1" />
        </div>

        {/* Center Hole */}
        <div className="absolute w-3 h-3 bg-[#050505] rounded-full border border-gray-800 shadow-inner z-20" />
      </div>
    </div>
  );
};

const Turntable = ({ track, isPlaying, isTonearmMoving }: { track: Track, isPlaying: boolean, isTonearmMoving: boolean }) => {
  return (
    <div className="relative w-full aspect-square rounded-[2.5rem] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.8)] flex items-center justify-center shrink-0 transform transition-transform duration-1000 bg-[#111]">
       {/* Chassis Texture - Brushed Metal/Dark Matte */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-[#121212] overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      </div>

      {/* Power Light */}
      <div className="absolute bottom-8 left-8 w-14 h-14 rounded-full bg-[#080808] shadow-[inset_0_2px_5px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center border border-white/5">
        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isPlaying ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'bg-gray-800'}`} />
      </div>

      {/* Pitch Slider - Cosmetic */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 items-center">
        <div className="w-1.5 h-10 bg-[#050505] rounded-full relative overflow-hidden shadow-inner border border-white/5">
          <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-t from-amber-900 to-amber-600 opacity-50" />
          <div className="absolute top-[40%] w-full h-[20%] bg-gray-600 rounded-sm shadow-sm" />
        </div>
      </div>

      {/* Platter */}
      <div className="relative w-[86%] h-[86%] rounded-full bg-[#050505] shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-[#1a1a1a] flex items-center justify-center">
        {/* Platter Ring */}
        <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />
        
        <div className="w-[94%] h-[94%] transition-transform duration-[2000ms]">
          <VinylRecord track={track} isPlaying={isPlaying} />
        </div>
      </div>
      
      <Tonearm isActive={isTonearmMoving} />
    </div>
  );
};

const StudioModal = ({ onClose, onPublish, existingTracks, onEditTrack, onDeleteTrack }: {
  onClose: () => void,
  onPublish: (trackData: {
    artist: string;
    title: string;
    color: string;
    audioFile: File | null;
    lyrics: any[];
    category: 'yours' | 'all' | 'visual';
    coverFile?: File | null;
    id?: string;
  }) => Promise<void>,
  existingTracks?: Track[],
  onEditTrack?: (track: Track) => Promise<void>,
  onDeleteTrack?: (trackId: string) => Promise<void>
}) => {
  // --- STATE ---
  const [step, setStep] = useState(0); // 0: Track List, 1: Upload, 2: Sync, 3: Edit/Preview
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [rawLyrics, setRawLyrics] = useState("");
  const [parseMode, setParseMode] = useState<'auto' | 'alternating'>('auto');
  const [parsedLyrics, setParsedLyrics] = useState<any[]>([]);
  const [hasJsonLoaded, setHasJsonLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [artistName, setArtistName] = useState("Неизвестный артист");
  const [trackTitle, setTrackTitle] = useState("Без названия");
  const [trackColor, setTrackColor] = useState(COLOR_THEMES[0].tailwind);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editArtist, setEditArtist] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [strobeMarkers, setStrobeMarkers] = useState<{id: number; time: number}[]>([]);
  const [strobeMode, setStrobeMode] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [editingStrobeTrack, setEditingStrobeTrack] = useState<Track | null>(null);
  const [trackCategory, setTrackCategory] = useState<'yours' | 'all' | 'visual'>('yours');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Helper to load existing track for full editing (Design)
  const loadTrackForEditing = (track: Track) => {
      setEditingTrackId(track.id);
      setArtistName(track.artist);
      setTrackTitle(track.title);
      setTrackColor(track.color);
      setAudioUrl(track.audioSrc || null);
      
      const lyrics = track.syncedLyrics || track.lyrics || [];
      setParsedLyrics(lyrics);

      // Reconstruct raw lyrics
      let raw = "";
      let currentOrig = "";
      let currentTrans = "";
      
      // @ts-ignore
      for(let i=0; i<lyrics.length; i++) {
          const l: any = lyrics[i];
          if (typeof l === 'string') {
              raw += l + "\n\n"; 
              continue;
          }
          
          if (l.isAppend) {
              currentOrig += " / " + l.original;
              if (l.translation) currentTrans += " / " + l.translation;
          } else {
              if (currentOrig) {
                  raw += currentOrig + "\n" + currentTrans + "\n\n";
              }
              currentOrig = l.original;
              currentTrans = l.translation || "";
          }
      }
      if (currentOrig) {
          raw += currentOrig + "\n" + currentTrans;
      }
      setRawLyrics(raw.trim());

      setHasJsonLoaded(true); // Treat as if design is loaded
      setTrackCategory(track.category || 'yours');
      if (track.coverUrl) setCoverPreview(track.coverUrl);
      
      // Skip upload, go to studio
      setStep(3);
  };

  // --- LOGIC: STEP 1 (UPLOAD) ---
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      // Force reset audio element source
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleLyricsParse = () => {
    if (!rawLyrics.trim()) return;

    let pairs: any[] = [];
    const lines = rawLyrics.split('\n').filter(line => line.trim() !== '');

    if (parseMode === 'alternating') {
      // Alternating Mode (Original / Translation)
      for (let i = 0; i < lines.length; i += 2) {
        const rawOriginal = lines[i]?.trim() || "...";
        const rawTranslation = lines[i + 1]?.trim() || "";

        // Handle Chaining (/) in Original line
        const originalParts = rawOriginal.split('/');
        // Handle Chaining (/) in Translation line if present
        // If translation has NO slashes, we attach it ONLY to the first part.
        // If translation HAS slashes, we try to match parts.
        const transParts = rawTranslation.includes('/') ? rawTranslation.split('/') : [rawTranslation];

        originalParts.forEach((part, idx) => {
           // If translation parts are fewer than original parts, subsequent parts get empty string
           // If translation was NOT split (single string), only idx 0 gets it.
           let trans = "";
           if (rawTranslation.includes('/')) {
               trans = transParts[idx]?.trim() || "";
           } else {
               trans = idx === 0 ? rawTranslation.trim() : "";
           }

           pairs.push({
              id: Date.now() + i + idx * 100, // Unique ID
              original: part.trim(),
              translation: trans,
              time: 0,
              isSynced: false,
              isAppend: idx > 0 // Mark as append if it's a subsequent part
           });
        });
      }
    } else {
      // Auto-Detect Mode
      let groupedPairs: {original: string, translation: string}[] = [];
      let currentGroup: any = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const isCyrillic = /[а-яёА-ЯЁ]/.test(line);

        if (isCyrillic) {
          // Translation
          if (currentGroup) {
            currentGroup.translation = line;
            groupedPairs.push(currentGroup);
            currentGroup = null;
          } else {
            groupedPairs.push({ original: "...", translation: line });
          }
        } else {
          // Original
          if (currentGroup) groupedPairs.push(currentGroup);
          currentGroup = { original: line, translation: "" };
        }
      }
      if (currentGroup) groupedPairs.push(currentGroup);

      // Now process groupedPairs and handle splitting
      groupedPairs.forEach((pair, i) => {
          const rawOriginal = pair.original;
          const rawTranslation = pair.translation;
          
          const origParts = rawOriginal.split('/');
          const transParts = rawTranslation.includes('/') ? rawTranslation.split('/') : [rawTranslation];
          
          origParts.forEach((part, idx) => {
              let trans = "";
              if (rawTranslation.includes('/')) {
                   trans = transParts[idx]?.trim() || "";
              } else {
                   trans = idx === 0 ? rawTranslation.trim() : "";
              }

              pairs.push({
                  id: Date.now() + i * 100 + idx,
                  original: part.trim(),
                  translation: trans,
                  time: 0,
                  isSynced: false,
                  isAppend: idx > 0
              });
          });
      });
    }

    setParsedLyrics(pairs);
    setStep(2);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setParsedLyrics(data);
          setHasJsonLoaded(true);
          if (audioFile) setStep(3);
          else alert("Дизайн загружен! Теперь загрузите аудио.");
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        alert("Ошибка: неверный формат JSON.");
      }
    };
    reader.readAsText(file);
  };

  const clearProject = () => {
    setAudioFile(null);
    setAudioUrl(null);
    setRawLyrics("");
    setParsedLyrics([]);
    setHasJsonLoaded(false);
    setCoverFile(null);
    setCoverPreview('');
    setStep(1);
  };

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
  }, []);

  // --- LOGIC: STEP 2 (SYNC) ---
  // --- LOGIC: STEP 2 (SYNC ENHANCED) ---
  const handleSyncKeys = useCallback((e: KeyboardEvent) => {
    if (step !== 2) return;

    // 1. SYNC (Space)
    if (e.code === 'Space') {
      e.preventDefault();
      
      // Auto-start if paused
      if (!isPlaying) {
        audioRef.current?.play();
        return;
      }

      // Sync CURRENT selected line
      if (activeLineIndex !== -1 && activeLineIndex < parsedLyrics.length) {
         const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
         
         setParsedLyrics(prev => {
             const newLyrics = [...prev];
             newLyrics[activeLineIndex] = {
                 ...newLyrics[activeLineIndex],
                 time: currentTime,
                 isSynced: true
             };
             return newLyrics;
         });

         // Move to next
         const nextIndex = Math.min(parsedLyrics.length - 1, activeLineIndex + 1);
         setActiveLineIndex(nextIndex);
         
         // Scroll
         const element = document.getElementById(`lyric-row-${nextIndex}`);
         if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // 2. UNDO / BACK (Backspace)
    if (e.code === 'Backspace') {
        e.preventDefault();
        // Go back to prev line and clear it
        const targetIndex = activeLineIndex > 0 ? activeLineIndex - 1 : 0;
        
        setParsedLyrics(prev => {
            const newLyrics = [...prev];
            newLyrics[targetIndex] = {
                ...newLyrics[targetIndex],
                isSynced: false,
                time: 0
            };
            return newLyrics;
        });
        
        setActiveLineIndex(targetIndex);
        
        // Rewind audio a bit (2s) to help catch up
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 2);
        }

        const element = document.getElementById(`lyric-row-${targetIndex}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 3. NAVIGATION (Arrows)
    if (e.code === 'ArrowUp') {
        e.preventDefault();
        const newIndex = Math.max(0, activeLineIndex - 1);
        setActiveLineIndex(newIndex);
        const element = document.getElementById(`lyric-row-${newIndex}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (e.code === 'ArrowDown') {
        e.preventDefault();
        const newIndex = Math.min(parsedLyrics.length - 1, activeLineIndex + 1);
        setActiveLineIndex(newIndex);
        const element = document.getElementById(`lyric-row-${newIndex}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skip(-5);
    }
    
    if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip(5);
    }

  }, [step, isPlaying, activeLineIndex, parsedLyrics.length]);

  // Attach Key Listeners
  useEffect(() => {
    window.addEventListener('keydown', handleSyncKeys);
    return () => window.removeEventListener('keydown', handleSyncKeys);
  }, [handleSyncKeys]);

  const handleStrobeKey = useCallback((e: KeyboardEvent) => {
    // Work in Step 2 (Sync) or Step 4 (Strobe Editor)
    if ((step !== 2 && step !== 4) || !strobeMode) return;

    // console.log('Key pressed:', e.code, e.key); // Debug

    // Use 'W' key for strobe
    if ((e.code === 'KeyW' || e.key === 'w' || e.key === 'W') && audioRef.current) {
      e.preventDefault();
      const currentTime = audioRef.current.currentTime;
      
      console.log('[Strobe] Marker added at', currentTime);
      
      setStrobeMarkers(prev => [...prev, {
        id: Date.now(),
        time: currentTime,
      }]);
      triggerFlash();
    }
  }, [step, strobeMode, triggerFlash]);



  useEffect(() => {
    window.addEventListener('keydown', handleStrobeKey);
    return () => window.removeEventListener('keydown', handleStrobeKey);
  }, [handleStrobeKey]);

  // --- AUDIO CONTROL (Workshop) ---
  const toggleWorkshopPlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    // Sync step progress
    if (step === 2) {
      // No auto-scroll here, handled by Spacebar
    }

    // Preview step progress
    if (step === 3 && parsedLyrics.length > 0) {
      let index = -1;
      for (let i = parsedLyrics.length - 1; i >= 0; i--) {
        if (time >= (parsedLyrics[i].time || 0)) {
          index = i;
          break;
        }
      }
      setActiveLineIndex(index);
    }
  };

  const resetTrack = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    if (step === 2) setActiveLineIndex(-1);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const exportDesign = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsedLyrics, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "track_design.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFinalPublish = async () => {
    // Update existing track
    if (editingTrackId) {
         await onPublish({
             artist: artistName,
             title: trackTitle,
             color: trackColor,
             audioFile: audioFile, // Can be null
             lyrics: parsedLyrics,
             category: trackCategory,
             coverFile: coverFile,
             id: editingTrackId
         });
         onClose();
         return;
    }

    if (!audioFile) {
      alert("Сначала загрузите аудиофайл");
      return;
    }

    await onPublish({
      artist: artistName,
      title: trackTitle,
      color: trackColor,
      audioFile: audioFile,
      lyrics: parsedLyrics,
      category: trackCategory,
      coverFile: coverFile,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col text-white font-sans selection:bg-amber-500 selection:text-black">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Flash Overlay */}
      {showFlash && (
        <div
          className="fixed inset-0 z-50 bg-white pointer-events-none"
          style={{ animation: 'strobe-flash 0.15s ease-out forwards' }}
        />
      )}

      {/* HEADER */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-2 text-amber-500 font-bold tracking-wider cursor-pointer" onClick={() => setStep(0)}>
          <Edit3 size={20} />
          <span>СТУДИЯ</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono text-white/50">
          <span className={step === 0 ? "text-white font-bold" : ""}>Треки</span>
          <ChevronRight size={14} />
          <span className={step === 1 ? "text-white font-bold" : ""}>01. Загрузка</span>
          <ChevronRight size={14} />
          <span className={step === 2 ? "text-white font-bold" : ""}>02. Синхро</span>
          <ChevronRight size={14} />
          <span className={step === 3 ? "text-white font-bold" : ""}>03. Студия</span>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white"><X size={24} /></button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">

        {/* STEP 0: TRACK LIST */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Мои треки</h1>
                <p className="text-white/40 text-sm">Управление опубликованными треками</p>
              </div>
              <Button onClick={() => setStep(1)}>
                <Upload size={18} /> Новый трек
              </Button>
            </div>

            {/* Track List */}
            <div className="space-y-3">
              {existingTracks && existingTracks.length > 0 ? (
                existingTracks.map((track) => (
                  <div
                    key={track.id}
                    className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-colors group"
                  >
                    {/* Cover/Vinyl Preview with Upload */}
                    <div className="relative group/cover shrink-0">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-14 h-14 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ background: getColorTheme(track.color).gradient }}
                        >
                          <div className="w-4 h-4 rounded-full bg-black/80" />
                        </div>
                      )}
                      {/* Cover Upload Overlay */}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover/cover:opacity-100 cursor-pointer transition-opacity">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('upload_preset', 'Oi notes');
                              const response = await fetch(
                                'https://api.cloudinary.com/v1_1/djtbtkddr/image/upload',
                                { method: 'POST', body: formData }
                              );
                              if (response.ok) {
                                const data = await response.json();
                                if (onEditTrack) {
                                  await onEditTrack({ ...track, coverUrl: data.secure_url });
                                }
                              }
                            } catch (error) {
                              console.error('Cover upload error:', error);
                            }
                          }}
                        />
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </label>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      {editingTrackId === track.id ? (
                        <div className="flex gap-2">
                          <input
                            value={editArtist}
                            onChange={(e) => setEditArtist(e.target.value)}
                            className="bg-white/5 border border-white/20 rounded px-2 py-1 text-sm w-32 outline-none focus:border-amber-500"
                            placeholder="Артист"
                          />
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-white/5 border border-white/20 rounded px-2 py-1 text-sm flex-1 outline-none focus:border-amber-500"
                            placeholder="Название"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-white truncate">{track.title}</h3>
                          <p className="text-sm text-white/40 truncate">{track.artist}</p>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingTrackId === track.id ? (
                        <>
                          <button
                            onClick={async () => {
                              if (onEditTrack) {
                                await onEditTrack({ ...track, artist: editArtist, title: editTitle });
                              }
                              setEditingTrackId(null);
                            }}
                            className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => setEditingTrackId(null)}
                            className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => loadTrackForEditing(track)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                            title="Редактировать дизайн"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              // Загрузить трек для редактирования стробоскопов
                              setEditingStrobeTrack(track);
                              setStrobeMarkers(track.strobeMarkers || []);
                              setAudioUrl(track.audioSrc || null);
                              setStrobeMode(true); // Автоматически включаем strobe режим
                              setStep(4); // Новый step для редактирования стробоскопов
                            }}
                            className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                            title="Редактировать строб"
                          >
                            <Zap size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTrackId(track.id);
                              setEditArtist(track.artist);
                              setEditTitle(track.title);
                            }}
                            className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Удалить трек?') && onDeleteTrack) {
                                onDeleteTrack(track.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-white/30">
                  <FileAudio size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет опубликованных треков</p>
                  <p className="text-sm mt-1">Нажмите "Новый трек" чтобы начать</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: SETUP */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold mb-2">Новый проект</h1>
              <p className="text-white/40">Создайте трек или загрузите сохранение</p>
            </div>

            {/* Track Meta */}
            <div className="grid grid-cols-2 gap-4">
              <input
                value={artistName} onChange={e => setArtistName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 transition-colors"
                placeholder="Имя артиста"
              />
              <input
                value={trackTitle} onChange={e => setTrackTitle(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 transition-colors"
                placeholder="Название трека"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-4">
              <label className="text-sm text-white/60 mb-3 block">Обложка</label>
              <div className="flex items-center gap-4">
                {coverPreview ? (
                  <div className="relative">
                    <img 
                      src={coverPreview} 
                      alt="Превью обложки" 
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                )}
                <div className="text-xs text-white/40">
                  JPG или PNG до 5 МБ
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Audio Upload */}
              <div className={`bg-[#111] border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-colors border-dashed relative ${audioFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-amber-500/50'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${audioFile ? 'bg-green-500 text-black' : 'bg-white/5 text-amber-500'}`}>
                  <FileAudio size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{audioFile ? "Аудио загружено" : "Загрузите аудио"}</h3>
                  <p className="text-sm text-white/40 mb-4">{audioFile ? audioFile.name : "MP3, WAV, FLAC"}</p>
                  <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors inline-block">
                    {audioFile ? "Сменить файл" : "Выбрать файл"}
                    <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                  </label>
                </div>
                {audioFile && <Check className="absolute top-4 right-4 text-green-500" size={20} />}
              </div>

              {/* Import JSON */}
              <div className={`bg-[#111] border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-colors border-dashed relative ${hasJsonLoaded ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-amber-500/50'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${hasJsonLoaded ? 'bg-green-500 text-black' : 'bg-white/5 text-blue-400'}`}>
                  {hasJsonLoaded ? <Check size={32} /> : <Upload size={32} />}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{hasJsonLoaded ? "Дизайн загружен" : "Загрузите JSON"}</h3>
                  <p className="text-sm text-white/40 mb-4">{hasJsonLoaded ? `${parsedLyrics.length} строк разобрано` : "Импортируйте файл .json"}</p>
                  <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors inline-block">
                    Импорт JSON
                    <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
                  </label>
                </div>
              </div>
            </div>

            {/* Lyrics Input */}
            {!hasJsonLoaded && (
              <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 text-white/70">
                <div className="flex items-center gap-2">
                  <FileText size={20} />
                  <h3 className="font-medium">Текст песни</h3>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                  <button
                    onClick={() => setParseMode('auto')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${parseMode === 'auto' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    Авто
                  </button>
                  <button
                    onClick={() => setParseMode('alternating')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${parseMode === 'alternating' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                  >
                    Чередование
                  </button>
                </div>
              </div>
              <textarea
                className="w-full h-64 bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-white/80 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  placeholder={`Оригинал строка 1\nПеревод строка 1\n\nОригинал строка 2\nПеревод строка 2`}
                  value={rawLyrics}
                  onChange={(e) => setRawLyrics(e.target.value)}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button onClick={clearProject} className="text-white/30 hover:text-red-500 flex items-center gap-2 text-sm transition-colors">
                <Trash2 size={16} /> Сбросить
              </button>
              <div className="flex gap-4">
                {hasJsonLoaded ? (
                  <Button onClick={() => setStep(3)} disabled={!audioFile}>Открыть студию <Edit3 size={18} /></Button>
                ) : (
                  <Button onClick={handleLyricsParse} disabled={!audioFile || !rawLyrics}>Начать синхронизацию <ChevronRight size={18} /></Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SYNC */}
        {step === 2 && (
          <div className="h-full flex flex-col max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6 bg-[#111] p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
                <div className="font-mono text-xl text-amber-500">
                  {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                </div>
              </div>
              <div className="text-center flex flex-col gap-2">
                <span className="text-white/40 text-sm uppercase tracking-widest">Режим</span>
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white">ЖИВАЯ ЗАПИСЬ (Пробел)</div>
                  <button
                    onClick={() => setStrobeMode(!strobeMode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      strobeMode
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }`}
                  >
                    СТРОБ {strobeMode ? 'ВКЛ' : 'ВЫКЛ'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={toggleWorkshopPlay} className="w-12 px-0 justify-center">
                  {isPlaying ? (
                    <Pause fill="currentColor" className="w-5 h-5" />
                  ) : (
                    <Play fill="currentColor" className="w-5 h-5 ml-0.5" />
                  )}
                </Button>
                <Button variant="secondary" onClick={resetTrack} className="w-12 px-0 justify-center">
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto relative bg-black rounded-xl border border-white/10 p-6 mask-linear" ref={lyricsContainerRef}>
              <div className="space-y-4 pb-[50vh] pt-[20vh]">
                {parsedLyrics.map((line, index) => {
                  const isActive = index === activeLineIndex;
                  return (
                    <div 
                      key={line.id} 
                      id={`lyric-row-${index}`} 
                      onClick={() => {
                          setActiveLineIndex(index);
                          if (line.isSynced && audioRef.current) {
                              audioRef.current.currentTime = line.time;
                          }
                      }}
                      className={`transition-all duration-200 flex flex-col gap-1 p-3 border-l-4 rounded-r-lg cursor-pointer hover:bg-white/5 ${
                          isActive 
                            ? 'border-amber-500 bg-white/5 opacity-100' 
                            : line.isSynced 
                                ? 'border-green-500/50 opacity-60' 
                                : 'border-transparent opacity-30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                         <div className={`font-lyrics text-2xl md:text-3xl ${isActive || line.isSynced ? 'text-white' : 'text-white/60'}`}>
                             {line.original}
                         </div>
                         <div className="flex items-center gap-3">
                             {line.isSynced && (
                                 <span className="font-mono text-xs text-amber-500 bg-black/50 px-2 py-1 rounded">
                                     {line.time.toFixed(2)}s
                                 </span>
                             )}
                             {line.isSynced && (
                                 <button 
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         setParsedLyrics(prev => {
                                             const n = [...prev];
                                             n[index] = { ...n[index], isSynced: false, time: 0 };
                                             return n;
                                         });
                                     }}
                                     className="text-white/20 hover:text-red-500 transition-colors p-1"
                                 >
                                     <X size={14} />
                                 </button>
                             )}
                         </div>
                      </div>
                      <div className={`text-sm font-sans ${isActive ? 'text-amber-500' : 'text-white/40'}`}>
                          {line.translation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center text-xs text-white/30 font-mono">
              <div className="flex gap-4">
                  <span>[SPACE] Запись</span>
                  <span>[BACKSPACE] Отмена</span>
                  <span>[ARROWS] Навигация</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Назад</Button>
                <Button onClick={() => setStep(3)}>Finish & Edit <Check size={18} /></Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: STUDIO EDITOR */}
        {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full max-w-6xl mx-auto">
              <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
                <div className="bg-[#111] p-4 rounded-xl border border-white/10 flex items-center justify-between shrink-0">
                  <h3 className="font-bold">Тайминги</h3>
                  <div className="text-xs text-white/40">Точная настройка (сек)</div>
                </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {parsedLyrics.map((line, index) => (
                  <div key={line.id} className={`p-3 rounded-lg border transition-colors cursor-pointer ${index === activeLineIndex ? 'bg-white/10 border-amber-500' : 'bg-[#111] border-white/5 hover:border-white/20'}`}
                    onClick={() => { if (audioRef.current) { audioRef.current.currentTime = line.time || 0; setActiveLineIndex(index); } }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-white/30">#{index + 1}</span>
                      <input type="number" step="0.1" className="w-20 bg-black border border-white/20 rounded px-2 py-1 text-right font-mono text-xs text-amber-500 focus:border-amber-500 outline-none"
                        value={line.time || 0}
                        onChange={(e) => {
                          const newTime = parseFloat(e.target.value);
                          const newLyrics = [...parsedLyrics];
                          newLyrics[index].time = newTime;
                          setParsedLyrics(newLyrics);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="text-sm text-white/90 truncate font-lyrics">{line.original}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex-1 bg-[#050505] rounded-2xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[400px]">
                {/* Visual Preview */}
                <div className={`relative w-40 h-40 rounded-full bg-black border-2 border-[#222] flex items-center justify-center shadow-2xl mb-8 ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '4s' }}>
                  <div className="w-1/3 h-1/3 rounded-full" style={{ background: getColorTheme(trackColor).gradient }} />
                </div>
                <div className="text-center relative z-10 max-w-xl h-32 flex flex-col justify-center">
                  {activeLineIndex !== -1 && parsedLyrics[activeLineIndex] ? (
                    <>
                      <div className="text-3xl md:text-5xl font-lyrics italic text-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {(() => {
                            const current = parsedLyrics[activeLineIndex];
                            if (current.isAppend) {
                                // Find previous non-append line to show context?
                                // Actually, user wants "Text / Append" to show together.
                                // If current is append, we should show "Prev ... Current".
                                // But we need to find how many appends back.
                                let text = current.translation || current.original;
                                let prevIdx = activeLineIndex - 1;
                                while (prevIdx >= 0 && parsedLyrics[prevIdx + 1].isAppend) { // If CURRENT (prevIdx+1) is append, grab prev
                                   // Wait, logic:
                                   // If current line is #2 (Append), we want #1 + #2.
                                   // We iterate backwards.
                                   const prev = parsedLyrics[prevIdx];
                                   text = (prev.translation || prev.original) + " " + text;
                                   if (!parsedLyrics[prevIdx].isAppend) break; // Stop if we hit a start line (not append)
                                   // Wait, if #1 is NOT append, we stop AFTER adding it. Correct.
                                   // But if #1 was also append (to #0), we continue.
                                   prevIdx--;
                                }
                                return text;
                            }
                            return current.translation || current.original;
                        })()}
                      </div>
                      <div className="text-xl text-white/50 font-serif mt-2 animate-in fade-in duration-500">
                         {(() => {
                            const current = parsedLyrics[activeLineIndex];
                            if (current.isAppend) {
                                let text = current.original;
                                let prevIdx = activeLineIndex - 1;
                                while (prevIdx >= 0 && parsedLyrics[prevIdx + 1].isAppend) {
                                   const prev = parsedLyrics[prevIdx];
                                   text = prev.original + " " + text;
                                   if (!parsedLyrics[prevIdx].isAppend) break;
                                   prevIdx--;
                                }
                                return text;
                            }
                            return current.original;
                        })()}
                      </div>
                    </>
                  ) : <div className="text-white/20">Предпросмотр</div>}
                </div>
                {/* Controls */}
                <div className="w-full mt-auto relative z-10 bg-[#111]/80 backdrop-blur rounded-xl p-4 border border-white/5">
                  <div className="w-full bg-white/10 h-1 rounded-full mb-4 cursor-pointer" onClick={(e) => {
                    if (!duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    if (audioRef.current) audioRef.current.currentTime = percent * duration;
                  }}>
                    <div className="bg-amber-500 h-full rounded-full relative" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-center gap-8 text-white/50 mt-6">
                    <button onClick={() => skip(-5)} className="hover:text-white">
                      <SkipBack className="w-6 h-6" fill="currentColor" />
                    </button>
                    <button onClick={toggleWorkshopPlay} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                      {isPlaying ? (
                        <Pause fill="currentColor" className="w-5 h-5" />
                      ) : (
                        <Play fill="currentColor" className="w-5 h-5 ml-1" />
                      )}
                    </button>
                    <button onClick={() => skip(5)} className="hover:text-white">
                      <SkipForward className="w-6 h-6" fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Picker */}
              <div className="bg-[#111] p-4 rounded-xl border border-white/10">
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Стиль винила</label>
                <div className="flex gap-2">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setTrackColor(theme.tailwind)}
                      title={theme.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        trackColor === theme.tailwind ? 'border-white shadow-lg' : 'border-transparent'
                      }`}
                      style={{ background: theme.gradient }}
                    />
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Категория</label>
                <div className="flex gap-2">
                  {(['yours', 'all'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setTrackCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        trackCategory === cat
                          ? 'bg-amber-500 text-black'
                          : 'bg-white/10 text-white/60 hover:bg-white/15 border border-white/10'
                      }`}
                    >
                      {cat === 'yours' ? 'Ваши песни' : 'Все песни'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="justify-center"><Mic size={18} /> Синхронизация</Button>
                <Button variant="secondary" onClick={exportDesign} className="justify-center"><Download size={18} /> Сохранить JSON</Button>
                <Button onClick={handleFinalPublish} className="justify-center"><Share size={18} /> Опубликовать</Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: STROBE EDITOR FOR EXISTING TRACKS */}
        {step === 4 && editingStrobeTrack && (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 bg-[#111] p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-yellow-500 animate-pulse' : 'bg-gray-600'}`} />
                <div className="font-mono text-xl text-yellow-500">
                  {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                </div>
              </div>
              <div className="text-center">
                <span className="text-white/40 text-sm uppercase tracking-widest">Редактор стробов</span>
                <div className="font-bold text-white">{editingStrobeTrack.title} - {editingStrobeTrack.artist}</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-white/40 text-xs">Нажмите 'W', чтобы добавить строб</span>
                <button
                  onClick={() => setStrobeMode(!strobeMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    strobeMode
                      ? 'bg-yellow-500 text-black'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  СТРОБ {strobeMode ? 'ВКЛ' : 'ВЫКЛ'}
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <audio
              ref={audioRef}
              src={audioUrl || editingStrobeTrack.audioSrc || ''}
              crossOrigin="anonymous"
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
            />

            {/* Waveform / Timeline */}
            <div className="flex-1 bg-[#111] rounded-xl border border-white/10 p-6 mb-6 overflow-auto">
              <div className="relative w-full h-20 bg-black/50 rounded-lg mb-4">
                {/* Progress line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
                {/* Strobe markers */}
                {strobeMarkers.map((marker, idx) => (
                  <div
                    key={marker.id}
                    className="absolute top-0 bottom-0 w-1 bg-yellow-500/60 hover:bg-yellow-500 cursor-pointer group"
                    style={{ left: `${(marker.time / duration) * 100}%` }}
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = marker.time;
                    }}
                  >
                    <button
                      className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStrobeMarkers(prev => prev.filter(m => m.id !== marker.id));
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {/* Clickable area */}
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    if (audioRef.current) audioRef.current.currentTime = percent * duration;
                  }}
                />
              </div>

              {/* Markers List */}
              <div className="text-sm text-white/60 mb-4">
                <span className="text-yellow-500 font-bold">{strobeMarkers.length}</span> строб-маркеров
              </div>
              <div className="flex flex-wrap gap-2">
                {strobeMarkers.sort((a, b) => a.time - b.time).map((marker, idx) => (
                  <div
                    key={marker.id}
                    className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-500 text-sm flex items-center gap-2 cursor-pointer hover:bg-yellow-500/20"
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = marker.time;
                    }}
                  >
                    <Zap size={12} />
                    {marker.time.toFixed(2)}s
                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStrobeMarkers(prev => prev.filter(m => m.id !== marker.id));
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between bg-[#111] p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => skip(-5)} className="text-white/40 hover:text-white">
                  <SkipBack className="w-6 h-6" fill="currentColor" />
                </button>
                <button onClick={toggleWorkshopPlay} className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                  {isPlaying ? (
                    <Pause fill="currentColor" className="w-5 h-5" />
                  ) : (
                    <Play fill="currentColor" className="w-5 h-5 ml-1" />
                  )}
                </button>
                <button onClick={() => skip(5)} className="text-white/40 hover:text-white">
                  <SkipForward className="w-6 h-6" fill="currentColor" />
                </button>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingStrobeTrack(null);
                    setStrobeMarkers([]);
                    setStep(0);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    // Save strobe markers to API
                    try {
                      const response = await fetch(`/api/tracks/${editingStrobeTrack.id}/strobe`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ strobeMarkers }),
                      });
                      if (response.ok) {
                        alert('Strobe markers saved!');
                        setEditingStrobeTrack(null);
                        setStep(0);
                        // Refresh tracks
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Error saving strobe markers:', error);
                    }
                  }}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  <Save size={18} /> Save Strobes
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- PIN MODAL COMPONENT ---
const PinModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      const fullPin = [...newPin].join('');
      if (fullPin === '1234') {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin(['', '', '', '']);
          setError(false);
          inputRefs[0].current?.focus();
        }, 800);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Edit3 className="text-amber-500" size={28} />
          </div>
          <h2 className="text-2xl font-lyrics italic text-white mb-2">Доступ в студию</h2>
          <p className="text-white/50 text-sm">Введите 4-значный PIN</p>
        </div>

        <div className="flex gap-4 justify-center mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-16 text-center text-2xl font-bold bg-white/5 border-2 rounded-xl outline-none transition-all ${error
                ? 'border-red-500 bg-red-500/10 animate-shake'
                : digit
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-white/20 focus:border-amber-500/50'
                } text-white`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm animate-in fade-in duration-200">
            Invalid PIN. Try again.
          </p>
        )}

        <style jsx>{`
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        25% { transform: translateX(-10px); }
                        75% { transform: translateX(10px); }
                    }
                    .animate-shake {
                        animation: shake 0.4s ease-in-out;
                    }
                `}</style>
      </div>
    </div>
  );
};

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function MusicApp() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isTonearmMoving, setIsTonearmMoving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLyricAnimating, setIsLyricAnimating] = useState(false);
  const [playerShowFlash, setPlayerShowFlash] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [isClimax, setIsClimax] = useState(false); // New State for "Drrr-drrr" ending
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('visual');
  
  // --- AUDIO ANALYSIS STATE ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  
  // Smooth Chaos State (Cinematic)
  const [cinematicValues, setCinematicValues] = useState({ 
      chromatic: 0,
      contrast: 1,
      scale: 1,
      translateX: 0, // Digital Jitter X
      translateY: 0, // Digital Jitter Y
      invert: 0,      // Negative Flash
      skew: 0,       // Restore Skew
      rotate: 0      // Restore Rotate
  });

  // Admin State
  const [clicks, setClicks] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Touch Gestures State
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filtered tracks based on category
  // "Ваши песни" (all) = category === 'yours' (от разработчика)
  // "Мои песни" (yours) = category !== 'yours' (пользовательские)
  const filteredTracks = useMemo(() => {
    if (activeCategory === 'visual') {
      return tracks.filter(t => t.category === 'visual');
    }
    if (activeCategory === 'all') {
      return tracks.filter(t => t.category === 'yours');
    }
    // 'yours' usually means user uploads, exclude visual and official 'yours' if that was the logic
    return tracks.filter(t => t.category !== 'yours' && t.category !== 'visual');
  }, [tracks, activeCategory]);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Touch Gesture Handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setSwipeOffset(0);
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Only horizontal swipe (ignore if mostly vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      // Limit swipe offset for visual feedback
      const maxOffset = 80;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX * 0.5));
      setSwipeOffset(clampedOffset);
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;

    const minSwipeDistance = 60;
    const maxSwipeTime = 300; // ms
    const swipeDuration = Date.now() - touchStartRef.current.time;

    // Fast swipe detection
    if (Math.abs(swipeOffset) > minSwipeDistance / 2 && swipeDuration < maxSwipeTime) {
      if (swipeOffset > 0) {
        // Swipe right = skip back 10s
        if (mainAudioRef.current) {
          mainAudioRef.current.currentTime = Math.max(0, mainAudioRef.current.currentTime - 10);
        }
      } else {
        // Swipe left = skip forward 10s
        if (mainAudioRef.current) {
          mainAudioRef.current.currentTime = Math.min(
            mainAudioRef.current.duration || 0,
            mainAudioRef.current.currentTime + 10
          );
        }
      }
    }

    // Reset state with spring animation
    setSwipeOffset(0);
    setSwipeDirection(null);
    touchStartRef.current = null;
  }, [swipeOffset]);

  // Double Tap Handler (separate from swipe)
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }

      // Determine which half of screen was tapped
      const touch = e.changedTouches[0];
      const screenWidth = window.innerWidth;

      if (touch.clientX < screenWidth / 2) {
        // Left side = rewind 10s
        if (mainAudioRef.current) {
          mainAudioRef.current.currentTime = Math.max(0, mainAudioRef.current.currentTime - 10);
        }
      } else {
        // Right side = forward 10s
        if (mainAudioRef.current) {
          mainAudioRef.current.currentTime = Math.min(
            mainAudioRef.current.duration || 0,
            mainAudioRef.current.currentTime + 10
          );
        }
      }

      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;

      // Single tap with delay for play/pause (on vinyl area only, handled elsewhere)
      tapTimeoutRef.current = setTimeout(() => {
        tapTimeoutRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  }, []);

  // Initialize Audio Context
  const initAudioAnalyzer = () => {
      if (!mainAudioRef.current || audioContextRef.current) return;

      try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256; // Balance performance/detail
          
          const source = ctx.createMediaElementSource(mainAudioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioContextRef.current = ctx;
          analyserRef.current = analyser;
          sourceRef.current = source;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
          console.error("Audio API Error:", e);
      }
  };

  useEffect(() => {
    console.log('[MusicApp] Mounted. Loading tracks from database...');

    // Load tracks from database
    const loadTracks = async () => {
      try {
        const response = await fetch('/api/tracks');
        if (response.ok) {
          const tracksData = await response.json();
          setTracks(tracksData);
          console.log('Loaded tracks:', tracksData);
        } else {
          console.error('Failed to load tracks');
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    };

    loadTracks();
    
    return () => {
        // Cleanup Audio Context
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, []);

  // Clean up AudioContext when track changes to ensure new source connection
  useEffect(() => {
      if (audioContextRef.current) {
          console.log('[MusicApp] Closing old AudioContext');
          audioContextRef.current.close();
          audioContextRef.current = null;
          analyserRef.current = null;
          sourceRef.current = null;
          dataArrayRef.current = null;
      }
  }, [activeTrack]);

  // --- LOGIC ---

  const triggerPlayerFlash = useCallback(() => {
    setPlayerShowFlash(true);
    setTimeout(() => setPlayerShowFlash(false), 150);
  }, []);

  const handleHeaderClick = () => {
    console.log("Header clicked. Admin:", isAdmin, "Clicks:", clicks + 1);
    if (isAdmin) {
      setShowStudio(true);
      return;
    }
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 5) {
      console.log("Triggering Pin Modal");
      setShowPinModal(true);
      setClicks(0);
    }
  };

  const handlePinSuccess = () => {
    setIsAdmin(true);
    setShowPinModal(false);
    // Don't open studio automatically, just enable admin features
    // setShowStudio(true); 
  };

  const handlePublish = async (trackData: {
    artist: string;
    title: string;
    color: string;
    audioFile: File | null;
    lyrics: any[];
    category: 'yours' | 'all' | 'visual';
    coverFile?: File | null;
    id?: string; // Added optional ID
  }) => {
    try {
      console.log("Publishing/Updating track...", trackData);

      let audioPath = '';
      let coverUrl = '';

      // 1. Cover Upload
      if (trackData.coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', trackData.coverFile);
        coverFormData.append('upload_preset', 'Oi notes');
        const coverRes = await fetch('https://api.cloudinary.com/v1_1/djtbtkddr/image/upload', { method: 'POST', body: coverFormData });
        if (coverRes.ok) {
           const d = await coverRes.json();
           coverUrl = d.secure_url;
        }
      }

      // 2. Audio Upload (only if file provided)
      if (trackData.audioFile) {
          const cloudinaryFormData = new FormData();
          cloudinaryFormData.append('file', trackData.audioFile);
          cloudinaryFormData.append('upload_preset', 'Oi notes');
          cloudinaryFormData.append('resource_type', 'video');
          const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/djtbtkddr/video/upload', { method: 'POST', body: cloudinaryFormData });
          if (cloudinaryRes.ok) {
              const d = await cloudinaryRes.json();
              audioPath = d.secure_url;
          }
      }

      const payload: any = {
        artist: trackData.artist,
        title: trackData.title,
        color: trackData.color,
        lyrics: trackData.lyrics,
        category: trackData.category,
      };
      if (audioPath) payload.audioPath = audioPath;
      if (coverUrl) payload.coverUrl = coverUrl;

      let res;
      if (trackData.id) {
          // UPDATE
          res = await fetch(`/api/tracks/${trackData.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
      } else {
          // CREATE
          if (!audioPath) throw new Error("Audio file required for new tracks");
          payload.audioPath = audioPath; // Ensure it's set
          res = await fetch('/api/tracks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
      }

      if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Save Error Details:", errorData);
          throw new Error("Failed to save track: " + (errorData.details || errorData.error || "Unknown error"));
      }
      
      const savedTrack = await res.json();
      
      setTracks(prev => {
          if (trackData.id) {
              return prev.map(t => t.id === trackData.id ? savedTrack : t);
          }
          return [...prev, savedTrack];
      });

      setShowStudio(false);
    } catch (error) {
      console.error('Error publishing track:', error);
      alert('Failed to save track');
    }
  };

  const handleUpdateTrack = async () => {
    if (!editingTrack) return;

    try {
      const response = await fetch(`/api/tracks/${editingTrack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: editingTrack.artist,
          title: editingTrack.title
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      const updatedTrack = await response.json();

      setTracks(prev => prev.map(t => t.id === updatedTrack.id ? { ...t, artist: updatedTrack.artist, title: updatedTrack.title } : t));
      setIsEditModalOpen(false);
      setEditingTrack(null);
    } catch (error) {
      console.error('Error updating track:', error);
      alert('Ошибка при обновлении трека');
    }
  };

  const openEditModal = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTrack(track);
    setIsEditModalOpen(true);
  };

  const handleDeleteTrack = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent track selection

    if (!confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete track');
      }

      // Remove from local state
      setTracks(prev => prev.filter(t => t.id !== trackId));

      // Clear active track if it was deleted
      if (activeTrack?.id === trackId) {
        setActiveTrack(null);
        setIsPlaying(false);
        setIsTonearmMoving(false);
      }

      console.log('Track deleted successfully');
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Failed to delete track. Please try again.');
    }
  };

  const toggleMainPlay = async () => {
    console.log('[MusicApp] Toggle Main Play');

    // Ensure audio engine is ready
    if (!audioContextRef.current) {
      initAudioAnalyzer();
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // If playing -> stop and exit player
    if (isPlaying) {
      handleClosePlayer();
      return;
    }

    // Start sequence with tonearm pause
    setIsTonearmMoving(true);
    setImmersiveMode(true);
    setCurrentLyricIndex(0);
    if (mainAudioRef.current) {
      mainAudioRef.current.currentTime = 0;
    }

    await new Promise(resolve => setTimeout(resolve, 1200));

    if (mainAudioRef.current) {
      try {
        await mainAudioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Playback failed:", e);
        setIsPlaying(false);
      }
    }

    setTimeout(() => setIsTonearmMoving(false), 500);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        setImmersiveMode(true);
      }, 2000); // Sync text appearance with audio start (or slightly after)
    }
    return () => clearTimeout(timer);
  }, [isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    // Only start logic loop if playing and activeTrack
    if (isPlaying && activeTrack) {
      interval = setInterval(() => {
        // Use real audio duration if available
        if (mainAudioRef.current && mainAudioRef.current.duration) {
          const current = mainAudioRef.current.currentTime;
          const dur = mainAudioRef.current.duration;
          
          setCurrentTime(current);
          setDuration(dur);

          // Update Lyrics
          // Check if lyrics contain timing data (Workshop tracks)
          const hasTiming = activeTrack.lyrics.length > 0 && typeof activeTrack.lyrics[0] !== 'string' && 'time' in (activeTrack.lyrics[0] as any);

          if (activeTrack.syncedLyrics || hasTiming) {
            const lyricsSource = activeTrack.syncedLyrics || activeTrack.lyrics;
            // Find the active line based on real timestamp
            let index = -1;
            // @ts-ignore
            for (let i = 0; i < lyricsSource.length; i++) {
              // @ts-ignore
              if (current >= lyricsSource[i].time) {
                index = i;
              } else {
                // Since lyrics are sorted by time, we can break early once we pass the current time
                break;
              }
            }
            if (index !== -1 && index !== currentLyricIndex) {
              setCurrentLyricIndex(index);
              // RESET CINEMATIC EFFECTS ON NEW LINE
              setCinematicValues({ chromatic: 0, contrast: 1, skew: 0, scale: 1, translateX: 0, translateY: 0, invert: 0, rotate: 0 });
            }
          } else {
            // Fallback for demo tracks
            const totalLyrics = activeTrack.lyrics.length;
            if (totalLyrics > 0) {
              const lyricsPerPercent = 100 / totalLyrics;
              const newIndex = Math.floor(((currentTime / duration) * 100) / lyricsPerPercent);
              setCurrentLyricIndex(Math.min(newIndex, totalLyrics - 1));
            }
          }
          
          // --- CINEMATIC AUDIO ANALYSIS & BEAT DETECTION ---
          let kickEnergy = 0; // 0.0 - 1.0
          let trebleEnergy = 0; // 0.0 - 1.0
          
          if (analyserRef.current && dataArrayRef.current) {
             analyserRef.current.getByteFrequencyData(dataArrayRef.current);
             // BASS (KICK)
             const bassZone = dataArrayRef.current.slice(0, 5);
             const bassAvg = bassZone.reduce((a, b) => a + b, 0) / bassZone.length;
             kickEnergy = bassAvg / 255;
             
             // TREBLE (NOISE)
             const trebleZone = dataArrayRef.current.slice(100, 180);
             const trebleAvg = trebleZone.reduce((a, b) => a + b, 0) / trebleZone.length;
             trebleEnergy = trebleAvg / 255;
          }

          // --- CLEAN MODE - NO SHAKE EFFECTS ---
          // All cinematic effects disabled for stable playback
          if (isScratching) setIsScratching(false);
          if (isClimax) setIsClimax(false);

        } else {
          // Fallback Simulation (if no audio file)
          setProgress((prev) => {
            if (prev >= 100) {
              setIsPlaying(false);
              setIsTonearmMoving(false);
              setImmersiveMode(false);
              return 0;
            }
            return prev + 0.05;
          });
        }

      }, 30); // 30ms for near-60fps updates
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack, progress, isScratching, isClimax, currentLyricIndex]);

  // Strobe markers playback - Optimized to fire EXACTLY once
  const lastStrobeCheckTime = useRef(0);

  useEffect(() => {
    if (!isPlaying || !activeTrack?.strobeMarkers?.length || !mainAudioRef.current) {
        // Reset check time when stopped or track changes
        if (mainAudioRef.current) lastStrobeCheckTime.current = mainAudioRef.current.currentTime;
        return;
    }

    const checkStrobeMarkers = () => {
      const currentTime = mainAudioRef.current?.currentTime || 0;
      const lastTime = lastStrobeCheckTime.current;

      // Detect Seek or Loop (large jump)
      if (Math.abs(currentTime - lastTime) > 0.5 || currentTime < lastTime) {
         lastStrobeCheckTime.current = currentTime;
         return;
      }

      // Fire if marker exists in the window: (lastTime, currentTime]
      const hasMarker = activeTrack.strobeMarkers?.some(marker => 
         marker.time > lastTime && marker.time <= currentTime
      );

      if (hasMarker) {
        triggerPlayerFlash();
      }

      lastStrobeCheckTime.current = currentTime;
    };

    // Fast interval for precision
    const interval = setInterval(checkStrobeMarkers, 30);
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack, triggerPlayerFlash]);

  // Smooth lyrics transition - fade out, change text, fade in
  useEffect(() => {
    setIsLyricAnimating(true);
    // Wait for fade-out (250ms), then show new text with fade-in
    const timer = setTimeout(() => setIsLyricAnimating(false), 250);
    return () => clearTimeout(timer);
  }, [currentLyricIndex]);

  // Handle Real Audio Playback in Main Player
  // We need a hidden audio element for the main player if `activeTrack.audioSrc` exists
  const mainAudioRef = useRef<HTMLAudioElement>(null);

  // Sync progress with real audio
  const handleMainTimeUpdate = () => {
    // Logic moved to interval for unified update
  };

  // Force reload audio when track changes - REMOVED (React key prop handles this)
  
  const handleSelectTrack = (track: Track) => {
    console.log('[MusicApp] Track Selected:', track.title);
    setActiveTrack(track);
    setIsPlaying(false);
    setIsTonearmMoving(false);
    setImmersiveMode(false);
    setProgress(0);
    setCurrentLyricIndex(0);
  };

  const handleClosePlayer = () => {
    setActiveTrack(null); // Close player by clearing active track
    setImmersiveMode(false);
    setIsPlaying(false);
    setIsTonearmMoving(false);
    setCurrentLyricIndex(0);
    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
      mainAudioRef.current.currentTime = 0;
    }
  };

  const handleScrub = (clientX: number) => {
    if (!mainAudioRef.current || !progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const newTime = percent * (mainAudioRef.current.duration || duration);
    mainAudioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="relative h-full w-full bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col overflow-hidden">
      <style jsx global>{`
        /* Font helpers */
        .font-lyrics {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Fraunces', Georgia, serif; }

        .animate-spin-slow { animation: spin 6s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          25% { transform: translate(10%, 5%) scale(1.1); opacity: 0.8; }
          50% { transform: translate(5%, 15%) scale(0.95); opacity: 0.5; }
          75% { transform: translate(-5%, 10%) scale(1.05); opacity: 0.7; }
        }
        .animate-blob { animation: blob 20s ease-in-out infinite; }

        @keyframes strobe-flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes lyric-crossfade {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .animate-lyric-crossfade {
          animation: lyric-crossfade 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes music-bar {
          0%, 100% { height: 33%; }
          50% { height: 100%; }
        }

        @keyframes visceral-surge {
          0%, 100% {
            color: #ffffff;
            text-shadow: 0 0 0 transparent;
            transform: scale(1);
          }
          50% {
            color: #ef4444;
            text-shadow: 0 0 30px rgba(225, 29, 72, 0.8);
            transform: scale(1.06);
          }
        }
        .animate-visceral-surge {
          animation: visceral-surge 3s ease-in-out infinite;
        }

        @keyframes scratch-spin {
          0% { transform: rotate(0deg) scale(1); }
          20% { transform: rotate(-12deg) scale(1.04); }
          50% { transform: rotate(8deg) scale(0.98); }
          80% { transform: rotate(-6deg) scale(1.02); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .animate-scratch-spin {
          animation: scratch-spin 0.8s linear infinite;
        }

        @keyframes reality-warp {
          0% { transform: perspective(1000px) rotateX(0) rotateY(0) scale(1); filter: hue-rotate(0deg); }
          25% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) scale(1.02); filter: hue-rotate(45deg) contrast(1.2); }
          50% { transform: perspective(1000px) rotateX(-2deg) rotateY(2deg) scale(0.98); filter: hue-rotate(-45deg) contrast(1.1); }
          75% { transform: perspective(1000px) rotateX(1deg) rotateY(-1deg) scale(1.05); filter: hue-rotate(90deg); }
          100% { transform: perspective(1000px) rotateX(0) rotateY(0) scale(1); filter: hue-rotate(0deg); }
        }
        .animate-reality-warp {
          animation: reality-warp 4s ease-in-out infinite;
          will-change: transform, filter;
        }

        @keyframes slide-current {
          0% {
            transform: translateY(30px) scale(0.95);
            opacity: 0;
            filter: blur(4px);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }
        .animate-slide-current {
          animation: slide-current 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes fade-in-delayed {
          0% { opacity: 0; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out forwards;
        }

        /* Meshy ambient drift for player background */
        @keyframes mesh-drift {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(6%, -4%, 0) scale(1.06); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes mesh-pulse {
          0% { transform: translate3d(0,0,0) scale(1); opacity: 0.35; }
          40% { transform: translate3d(-4%, 5%, 0) scale(1.08); opacity: 0.5; }
          100% { transform: translate3d(0,0,0) scale(1); opacity: 0.35; }
        }
        @keyframes mesh-glow {
          0% { transform: translate3d(0,0,0) scale(1); opacity: 0.22; }
          50% { transform: translate3d(3%, -6%, 0) scale(1.04); opacity: 0.4; }
          100% { transform: translate3d(0,0,0) scale(1); opacity: 0.22; }
        }
        .mesh-drift { animation: mesh-drift 16s ease-in-out infinite; }
        .mesh-pulse { animation: mesh-pulse 18s ease-in-out infinite; }
        .mesh-glow { animation: mesh-glow 20s ease-in-out infinite; }
      `}</style>

      {/* HIDDEN AUDIO FOR MAIN PLAYER */}
      <audio
        ref={mainAudioRef}
        key={activeTrack?.id} // Force remount on track change
        src={activeTrack?.audioSrc || undefined}
        crossOrigin="anonymous"
        preload="auto"
        onTimeUpdate={handleMainTimeUpdate}
        onLoadedData={() => console.log("Audio loaded:", activeTrack?.audioSrc)}
        onError={(e) => console.error("Audio error:", e.currentTarget.error)}
        onEnded={() => {
          setIsPlaying(false);
          setIsTonearmMoving(false);
          setImmersiveMode(false);
        }}
      />

      {/* AMBIENT BACKGROUND */}
      <AmbientBackground />

      {/* MINIMAL HEADER */}
      <header className="flex-shrink-0 z-40 w-full pt-12 pb-4 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <h1
            onClick={handleHeaderClick}
            className="text-[32px] font-bold text-white tracking-tight leading-none font-lyrics cursor-pointer select-none"
          >Коллекция</h1>
        </div>
      </header>

      {/* TRACKS BENTO GRID - Scrollable Area */}
      <section
        className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain z-10"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+7rem)]">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(140px,1fr)] sm:auto-rows-[minmax(170px,1fr)] lg:auto-rows-[minmax(200px,1fr)]">
            {filteredTracks.map((track, i) => (
              <BentoItem
                key={track.id}
                track={track}
                size={i === 0 ? 'large' : i < 3 ? 'medium' : 'small'}
                onClick={() => handleSelectTrack(track)}
                isActive={activeTrack?.id === track.id}
                isPlaying={isPlaying}
                getColorTheme={getColorTheme}
              />
            ))}
          </div>
          
          {/* Empty State */}
          {filteredTracks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-white/30">
              <FileAudio size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Нет треков</p>
              <p className="text-sm mt-1">Добавьте первый трек через студию</p>
            </div>
          )}
        </div>
      </section>
      
      {/* DOCK NAVIGATION */}
      <Dock 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory} 
        onStudioOpen={() => setShowStudio(true)}
        isAdmin={isAdmin}
      />
      
      {/* MINI PLAYER */}
      {activeTrack && !immersiveMode && (
        <MiniPlayer 
          track={activeTrack} 
          isPlaying={isPlaying} 
          onToggle={toggleMainPlay} 
          onOpen={() => setImmersiveMode(true)}
          getColorTheme={getColorTheme}
        />
      )}

      {/* --- ПРОИГРЫВАТЕЛЬ (FULL SCREEN PLAYER) --- */}
      {activeTrack && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-hidden safe-area-bottom flex items-stretch justify-center">
          {/* Strobe Flash Overlay */}
          {playerShowFlash && (
             <div className="absolute inset-0 z-50 bg-white pointer-events-none animate-[strobe-flash_0.15s_ease-out_forwards]" />
          )}

          {/* Background Grain + Dynamic Mesh Glow */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            />
            {(() => {
              const theme = getColorTheme(activeTrack.color);
              return (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className={`absolute -top-16 -left-24 w-[70%] h-[70%] rounded-full blur-[130px] mix-blend-screen mesh-drift ${isPlaying ? 'opacity-60' : 'opacity-30'}`}
                    style={{ background: theme.primary }}
                  />
                  <div
                    className={`absolute bottom-[-12%] right-[-8%] w-[60%] h-[60%] rounded-full blur-[120px] mix-blend-screen mesh-pulse ${isPlaying ? 'opacity-55' : 'opacity-25'}`}
                    style={{ background: theme.secondary }}
                  />
                  <div
                    className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[55%] h-[55%] rounded-full blur-[110px] mix-blend-screen mesh-glow ${isPlaying ? 'opacity-45' : 'opacity-20'}`}
                    style={{ background: theme.accent }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Main Layout */}
          <div className="relative z-10 flex flex-col h-full w-full max-w-6xl px-4 sm:px-8 lg:px-12 py-4 sm:py-6 md:py-10">

            {/* Header */}
            <header className="flex justify-between items-center mb-2 sm:mb-4 transition-all duration-500 opacity-80 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
              <button
                onClick={handleClosePlayer}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-300" />
              </button>
              <div className="text-xs font-mono tracking-[0.2em] uppercase text-gray-500">Now Playing</div>
              <button
                onClick={() => setImmersiveMode(!immersiveMode)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-6 h-6 text-gray-300" />
              </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center py-2 sm:py-6 relative min-h-0">
              {/* 1. VINYL VIEW */}
              <div className={`w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] aspect-square transition-all duration-500 ease-out
                 ${immersiveMode ? 'opacity-0 scale-90 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
                 <Turntable track={activeTrack} isPlaying={isPlaying} isTonearmMoving={isTonearmMoving} />
              </div>

              {/* 2. LYRICS VIEW */}
              <div className={`absolute inset-0 flex flex-col items-center justify-center px-4 text-center transition-all duration-500
                 ${immersiveMode ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
                 {activeTrack.lyrics.length > 0 ? (
                    <div className="w-full flex flex-col items-center justify-center min-h-[200px]">
                       <div key={currentLyricIndex} className="animate-lyric-crossfade">
                          <h2
                            className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-lyrics text-white leading-tight uppercase tracking-tight text-balance"
                            style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.3)' }}
                          >
                            {(() => {
                              const lyric = activeTrack.lyrics[currentLyricIndex];
                              if (!lyric) return '...';
                              if (typeof lyric === 'string') return lyric;

                              let text = lyric.translation || lyric.original || '...';
                              // @ts-ignore
                              if (lyric.isAppend) {
                                  let prevIdx = currentLyricIndex - 1;
                                  // @ts-ignore
                                  while (prevIdx >= 0 && activeTrack.lyrics[prevIdx + 1].isAppend) {
                                      const prev = activeTrack.lyrics[prevIdx];
                                      if (typeof prev !== 'string') {
                                          text = (prev.translation || prev.original) + " " + text;
                                          // @ts-ignore
                                          if (!prev.isAppend) break;
                                      }
                                      prevIdx--;
                                  }
                              }
                              return text;
                            })()}
                          </h2>
                       </div>
                    </div>
                 ) : (
                   <p className="text-white/40 font-mono uppercase tracking-widest">Нет текста песни</p>
                 )}
              </div>
            </main>

            {/* Bottom Controls */}
            <div className={`mt-auto space-y-6 transition-all duration-500 ${immersiveMode ? 'opacity-60' : ''} pb-[calc(env(safe-area-inset-bottom,0px)+12px)]`}>

              {/* Song Title & Artist */}
              <div className={`space-y-1 transition-all duration-300 ${immersiveMode ? 'opacity-0 h-0 overflow-hidden' : ''}`}>
                <h1 className="text-2xl font-serif font-medium tracking-wide text-white leading-tight line-clamp-1">
                  {activeTrack.title}
                </h1>
                <p className="text-lg text-gray-500 font-light">{activeTrack.artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-2 group">
                <div
                  ref={progressBarRef}
                  className={`relative w-full bg-[#222] rounded-full overflow-hidden cursor-pointer transition-all ${immersiveMode ? 'h-0.5' : 'h-1'}`}
                  onClick={(e) => handleScrub(e.clientX)}
                  onTouchStart={(e) => {
                    if (e.touches[0]) handleScrub(e.touches[0].clientX);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches[0]) handleScrub(e.touches[0].clientX);
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-linear"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <div className={`flex justify-between text-[10px] font-mono text-gray-600 tracking-wider transition-all duration-300 ${immersiveMode ? 'opacity-0 h-0' : ''}`}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className={`flex items-center justify-center pb-4 ${immersiveMode ? 'gap-0' : 'gap-8'}`}>
                 {/* Skip Back */}
                 <button
                   onClick={() => { if(mainAudioRef.current) mainAudioRef.current.currentTime -= 10; }}
                   className={`text-gray-400 hover:text-white transition-colors active:scale-95 ${immersiveMode ? 'opacity-0 w-0 pointer-events-none' : ''}`}
                 >
                   <SkipBack className="w-8 h-8" />
                 </button>

                 {/* Play/Pause */}
                 <button
                  onClick={toggleMainPlay}
                  className={`bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-300
                    ${immersiveMode ? 'w-14 h-14' : 'w-16 h-16'}`}
                 >
                   {isPlaying ? (
                     <Pause className="w-6 h-6 text-black" />
                   ) : (
                     <Play className="w-6 h-6 ml-1 text-black" />
                   )}
                 </button>

                 {/* Skip Forward */}
                 <button
                   onClick={() => { if(mainAudioRef.current) mainAudioRef.current.currentTime += 10; }}
                   className={`text-gray-400 hover:text-white transition-colors active:scale-95 ${immersiveMode ? 'opacity-0 w-0 pointer-events-none' : ''}`}
                 >
                   <SkipForward className="w-8 h-8" />
                 </button>
              </div>

              {/* Device Selection */}
              <div className={`flex justify-center pb-2 transition-all duration-300 ${immersiveMode ? 'opacity-0 h-0 overflow-hidden' : ''}`}>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] rounded-full border border-white/5 cursor-pointer hover:bg-[#222] transition-colors">
                   <span className="w-2 h-2 rounded-full bg-green-500" />
                   <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">iPhone</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- PLACEBO VISUALIZER --- */}
      {activeTrack && (activeTrack.title === "Without You I'm Nothing" || activeTrack.title.toLowerCase().includes('without you')) && (
        <PlaceboVisualizer 
          activeTrack={activeTrack} 
          currentTime={currentTime} 
          isPlaying={isPlaying} 
          duration={duration}
          onTogglePlay={toggleMainPlay}
          onSeek={(time) => { if(mainAudioRef.current) mainAudioRef.current.currentTime = time; }}
          onClose={handleClosePlayer} 
        />
      )}

      {/* --- PIN MODAL --- */}
      {showPinModal && (
        <PinModal onClose={() => setShowPinModal(false)} onSuccess={handlePinSuccess} />
      )}

      {/* --- STUDIO MODAL --- */}
      {showStudio && (
        <StudioModal
          onClose={() => setShowStudio(false)}
          onPublish={handlePublish}
          existingTracks={tracks}
          onEditTrack={async (track) => {
            try {
              const response = await fetch(`/api/tracks/${track.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artist: track.artist, title: track.title, coverUrl: track.coverUrl })
              });
              if (!response.ok) throw new Error('Failed to update');
              const updatedTrack = await response.json();
              setTracks(prev => prev.map(t => t.id === updatedTrack.id ? { ...t, artist: updatedTrack.artist, title: updatedTrack.title, coverUrl: updatedTrack.coverUrl } : t));
            } catch (error) {
              console.error('Error updating track:', error);
              alert('Ошибка при обновлении');
            }
          }}
          onDeleteTrack={async (trackId) => {
            try {
              const response = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' });
              if (!response.ok) throw new Error('Failed to delete');
              setTracks(prev => prev.filter(t => t.id !== trackId));
              if (activeTrack?.id === trackId) {
                setActiveTrack(null);
                setIsPlaying(false);
              }
            } catch (error) {
              console.error('Error deleting track:', error);
              alert('Ошибка при удалении');
            }
          }}
        />
      )}

      {/* EDIT TRACK MODAL */}
      {isEditModalOpen && editingTrack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Редактировать трек</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Артист</label>
                <input
                  value={editingTrack?.artist || ''}
                  onChange={e => setEditingTrack(prev => prev ? { ...prev, artist: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40">Название</label>
                <input
                  value={editingTrack?.title || ''}
                  onChange={e => setEditingTrack(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Отмена</Button>
              <Button onClick={handleUpdateTrack}>Сохранить</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
