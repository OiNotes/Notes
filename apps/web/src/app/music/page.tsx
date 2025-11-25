"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Mic,
  Trash2,
  Edit2,
  Save,
  MoreVertical
} from 'lucide-react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Zap } from 'lucide-react';

// --- TYPES ---
type Track = {
  id: string;
  artist: string;
  title: string;
  color: string;
  lyrics: (string | { original: string; translation: string; time?: number })[];
  audioSrc?: string | null;
  syncedLyrics?: {
    id: number;
    original: string;
    translation: string;
    time: number;
    isSynced: boolean;
  }[];
  strobeMarkers?: { id: number; time: number }[];
};

// --- INITIAL DATA ---
const INITIAL_TRACKS: Track[] = [];

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
    audioFile: File;
    lyrics: any[];
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
  const [artistName, setArtistName] = useState("Unknown Artist");
  const [trackTitle, setTrackTitle] = useState("Untitled Track");
  const [trackColor, setTrackColor] = useState(COLOR_THEMES[0].tailwind);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editArtist, setEditArtist] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [strobeMarkers, setStrobeMarkers] = useState<{id: number; time: number}[]>([]);
  const [strobeMode, setStrobeMode] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [editingStrobeTrack, setEditingStrobeTrack] = useState<Track | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

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

  const handleLyricsParse = () => {
    if (!rawLyrics.trim()) return;

    let pairs: any[] = [];
    const lines = rawLyrics.split('\n').filter(line => line.trim() !== '');

    if (parseMode === 'alternating') {
      // Alternating Mode (Original / Translation)
      for (let i = 0; i < lines.length; i += 2) {
        pairs.push({
          id: Date.now() + i,
          original: lines[i]?.trim() || "...",
          translation: lines[i + 1]?.trim() || "",
          time: 0,
          isSynced: false
        });
      }
    } else {
      // Auto-Detect Mode (Cyrillic = Translation)
      let currentPair: any = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const isCyrillic = /[а-яёА-ЯЁ]/.test(line);

        if (isCyrillic) {
          // It's a translation
          if (currentPair) {
            currentPair.translation = line;
            pairs.push(currentPair);
            currentPair = null;
          } else {
            // Orphaned translation (shouldn't happen ideally, but handle it)
            pairs.push({
              id: Date.now() + i,
              original: "...",
              translation: line,
              time: 0,
              isSynced: false
            });
          }
        } else {
          // It's an original line
          if (currentPair) {
            // Push previous pair if it had no translation
            pairs.push(currentPair);
          }
          currentPair = {
            id: Date.now() + i,
            original: line,
            translation: "", // Waiting for translation
            time: 0,
            isSynced: false
          };
        }
      }
      // Push last pair if exists
      if (currentPair) {
        pairs.push(currentPair);
      }
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
          else alert("Design Loaded! Now please upload Audio.");
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        alert("Error: Invalid JSON format.");
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
    setStep(1);
  };

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
  }, []);

  // --- LOGIC: STEP 2 (SYNC) ---
  const handleSpacebar = useCallback((e: KeyboardEvent) => {
    if (step !== 2) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (!isPlaying) {
        audioRef.current?.play();
        return;
      }
      setParsedLyrics(prev => {
        const nextIndex = prev.findIndex(l => !l.isSynced);
        if (nextIndex !== -1) {
          const newLyrics = [...prev];
          newLyrics[nextIndex] = {
            ...newLyrics[nextIndex],
            time: audioRef.current ? audioRef.current.currentTime : 0,
            isSynced: true
          };
          setActiveLineIndex(nextIndex);
          if (lyricsContainerRef.current) {
            const element = document.getElementById(`lyric-row-${nextIndex}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return newLyrics;
        }
        return prev;
      });
    }
  }, [step, isPlaying]);

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
    window.addEventListener('keydown', handleSpacebar);
    return () => window.removeEventListener('keydown', handleSpacebar);
  }, [handleSpacebar]);

  useEffect(() => {
    window.addEventListener('keydown', handleStrobeKey);
    return () => window.removeEventListener('keydown', handleStrobeKey);
  }, [handleStrobeKey]);

  // --- AUDIO CONTROL ---
  const togglePlay = () => {
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
    if (!audioFile) {
      alert("Please upload an audio file first");
      return;
    }

    await onPublish({
      artist: artistName,
      title: trackTitle,
      color: trackColor,
      audioFile: audioFile,
      lyrics: parsedLyrics,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#080808] flex flex-col text-white font-sans selection:bg-amber-500 selection:text-black">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Flash Overlay */}
      {showFlash && (
        <div
          className="fixed inset-0 z-[200] bg-white pointer-events-none"
          style={{ animation: 'strobe-flash 0.15s ease-out forwards' }}
        />
      )}

      {/* HEADER */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-2 text-amber-500 font-bold tracking-wider cursor-pointer" onClick={() => setStep(0)}>
          <Edit3 size={20} />
          <span>THE WORKSHOP</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono text-white/50">
          <span className={step === 0 ? "text-white font-bold" : ""}>Tracks</span>
          <ChevronRight size={14} />
          <span className={step === 1 ? "text-white font-bold" : ""}>01. Setup</span>
          <ChevronRight size={14} />
          <span className={step === 2 ? "text-white font-bold" : ""}>02. Sync</span>
          <ChevronRight size={14} />
          <span className={step === 3 ? "text-white font-bold" : ""}>03. Studio</span>
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
                    {/* Vinyl Preview */}
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg"
                      style={{ background: getColorTheme(track.color).gradient }}
                    >
                      <div className="w-4 h-4 rounded-full bg-black/80" />
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
                            onClick={() => {
                              // Загрузить трек для редактирования стробоскопов
                              setEditingStrobeTrack(track);
                              setStrobeMarkers(track.strobeMarkers || []);
                              setAudioUrl(track.audioSrc || null);
                              setStrobeMode(true); // Автоматически включаем strobe режим
                              setStep(4); // Новый step для редактирования стробоскопов
                            }}
                            className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                            title="Edit Strobe"
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
              <h1 className="text-4xl font-bold mb-2">New Project</h1>
              <p className="text-white/40">Create a new track or load a save</p>
            </div>

            {/* Track Meta */}
            <div className="grid grid-cols-2 gap-4">
              <input
                value={artistName} onChange={e => setArtistName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 transition-colors"
                placeholder="Artist Name"
              />
              <input
                value={trackTitle} onChange={e => setTrackTitle(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 transition-colors"
                placeholder="Track Title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Audio Upload */}
              <div className={`bg-[#111] border rounded-xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-colors border-dashed relative ${audioFile ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-amber-500/50'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${audioFile ? 'bg-green-500 text-black' : 'bg-white/5 text-amber-500'}`}>
                  <FileAudio size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{audioFile ? "Audio Loaded" : "Upload Audio"}</h3>
                  <p className="text-sm text-white/40 mb-4">{audioFile ? audioFile.name : "MP3, WAV, FLAC"}</p>
                  <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors inline-block">
                    {audioFile ? "Change File" : "Browse Files"}
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
                  <h3 className="text-lg font-medium">{hasJsonLoaded ? "Design Loaded" : "Load JSON Design"}</h3>
                  <p className="text-sm text-white/40 mb-4">{hasJsonLoaded ? `${parsedLyrics.length} lines parsed` : "Load .json save file"}</p>
                  <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors inline-block">
                    Import JSON
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
                    <h3 className="font-medium">Lyrics Input</h3>
                  </div>
                  <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                    <button
                      onClick={() => setParseMode('auto')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${parseMode === 'auto' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                      Auto-Detect
                    </button>
                    <button
                      onClick={() => setParseMode('alternating')}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${parseMode === 'alternating' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                      Alternating
                    </button>
                  </div>
                </div>
                <textarea
                  className="w-full h-64 bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-white/80 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  placeholder={`Original Line 1\nTranslation Line 1\n\nOriginal Line 2\nTranslation Line 2`}
                  value={rawLyrics}
                  onChange={(e) => setRawLyrics(e.target.value)}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <button onClick={clearProject} className="text-white/30 hover:text-red-500 flex items-center gap-2 text-sm transition-colors">
                <Trash2 size={16} /> Clear
              </button>
              <div className="flex gap-4">
                {hasJsonLoaded ? (
                  <Button onClick={() => setStep(3)} disabled={!audioFile}>Open Studio <Edit3 size={18} /></Button>
                ) : (
                  <Button onClick={handleLyricsParse} disabled={!audioFile || !rawLyrics}>Start Syncing <ChevronRight size={18} /></Button>
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
                <span className="text-white/40 text-sm uppercase tracking-widest">Mode</span>
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white">LIVE RECORDING (SPACEBAR)</div>
                  <button
                    onClick={() => setStrobeMode(!strobeMode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      strobeMode
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-white/50 hover:bg-white/20'
                    }`}
                  >
                    STROBE {strobeMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={togglePlay} className="w-12 px-0 justify-center">
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
              <div className="space-y-8 pb-[50vh] pt-[20vh]">
                {parsedLyrics.map((line, index) => {
                  const isActive = index === activeLineIndex;
                  return (
                    <div key={line.id} id={`lyric-row-${index}`} className={`transition-all duration-300 flex flex-col gap-1 pl-4 border-l-4 ${isActive ? 'border-amber-500 opacity-100' : 'border-transparent opacity-40'}`}>
                      <div className={`font-lyrics text-3xl md:text-4xl ${isActive ? 'text-white' : 'text-white/60'}`}>{line.original}</div>
                      <div className={`text-sm font-sans ${isActive ? 'text-amber-500' : 'text-white/40'}`}>{line.translation}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Finish & Edit <Check size={18} /></Button>
            </div>
          </div>
        )}

        {/* STEP 3: STUDIO EDITOR */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full max-w-6xl mx-auto">
            <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
              <div className="bg-[#111] p-4 rounded-xl border border-white/10 flex items-center justify-between shrink-0">
                <h3 className="font-bold">Timing Editor</h3>
                <div className="text-xs text-white/40">Fine-tune (s)</div>
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
                      <div className="text-3xl md:text-5xl font-lyrics italic text-white animate-in fade-in slide-in-from-bottom-2 duration-300">{parsedLyrics[activeLineIndex].translation}</div>
                      <div className="text-xl text-white/50 font-serif mt-2 animate-in fade-in duration-500">{parsedLyrics[activeLineIndex].original}</div>
                    </>
                  ) : <div className="text-white/20">Preview Area</div>}
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
                    <button onClick={togglePlay} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
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
                <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Vinyl Style</label>
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

              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="justify-center"><Mic size={18} /> Re-Sync</Button>
                <Button variant="secondary" onClick={exportDesign} className="justify-center"><Download size={18} /> Save JSON</Button>
                <Button onClick={handleFinalPublish} className="justify-center"><Share size={18} /> Publish</Button>
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
                <span className="text-white/40 text-sm uppercase tracking-widest">Strobe Editor</span>
                <div className="font-bold text-white">{editingStrobeTrack.title} - {editingStrobeTrack.artist}</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-white/40 text-xs">Press 'W' to add strobe</span>
                <button
                  onClick={() => setStrobeMode(!strobeMode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    strobeMode
                      ? 'bg-yellow-500 text-black'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  STROBE {strobeMode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <audio
              ref={audioRef}
              src={audioUrl || editingStrobeTrack.audioSrc || ''}
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
                <span className="text-yellow-500 font-bold">{strobeMarkers.length}</span> strobe markers
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
                <button onClick={togglePlay} className="w-12 h-12 bg-yellow-500 text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
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
    <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Edit3 className="text-amber-500" size={28} />
          </div>
          <h2 className="text-2xl font-lyrics italic text-white mb-2">Workshop Access</h2>
          <p className="text-white/50 text-sm">Enter 4-digit PIN code</p>
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

export default function MusicApp() {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
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
    audioFile: File;
    lyrics: any[];
  }) => {
    try {
      console.log("Publishing track...", {
        artist: trackData.artist,
        title: trackData.title,
        color: trackData.color,
        audioFileName: trackData.audioFile?.name,
        audioFileSize: trackData.audioFile?.size,
        audioFileType: trackData.audioFile?.type,
        lyricsCount: trackData.lyrics?.length
      });

      // 1. Check file size (Vercel serverless limit ~4MB)
      const MAX_SIZE = 4 * 1024 * 1024; // 4MB
      if (trackData.audioFile.size > MAX_SIZE) {
        const sizeMB = (trackData.audioFile.size / 1024 / 1024).toFixed(1);
        throw new Error(`Файл слишком большой (${sizeMB}MB). Максимум 4MB. Сожми аудио перед загрузкой.`);
      }

      // 2. Upload audio file via server
      console.log("Step 1: Uploading audio file...");
      const formData = new FormData();
      formData.append('audio', trackData.audioFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.details || 'Failed to upload audio');
      }

      const { audioPath } = await uploadRes.json();
      console.log("Upload success:", audioPath);

      // 2. Create track in database
      console.log("Step 2: Creating track in database...");
      const trackPayload = {
        artist: trackData.artist,
        title: trackData.title,
        color: trackData.color,
        audioPath,
        lyrics: trackData.lyrics,
      };
      console.log("Track payload:", trackPayload);

      const createRes = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackPayload),
      });

      console.log("Create track response status:", createRes.status);

      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error("Create track failed:", errorText);
        throw new Error(`Failed to create track: ${errorText}`);
      }

      const createdTrack = await createRes.json();
      console.log("Track created successfully:", createdTrack);

      // 3. Update local state
      setTracks(prev => [...prev, createdTrack]);
      setShowStudio(false); // Close studio after success
      console.log("Publishing complete!");
    } catch (error) {
      console.error('Error publishing track:', error);
      alert('Failed to publish track');
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

  const togglePlay = async () => {
    console.log('[MusicApp] Toggle Play');
    
    // Initialize Audio Engine on first user interaction (browser policy)
    if (!audioContextRef.current) {
        initAudioAnalyzer();
    }
    if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }

    if (isPlaying || isTonearmMoving) {
      // STOP SEQUENCE
      setIsPlaying(false);
      setIsTonearmMoving(false);
      setImmersiveMode(false);
      setCurrentLyricIndex(0); // Reset lyrics

      // Stop audio if playing
      if (mainAudioRef.current) {
        mainAudioRef.current.pause();
        mainAudioRef.current.currentTime = 0; // Reset audio
      }
    } else {
      // START SEQUENCE
      // Reset state before starting
      setCurrentLyricIndex(0);
      if (mainAudioRef.current) mainAudioRef.current.currentTime = 0;

      // 1. Tonearm moves (2s)
      setIsTonearmMoving(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Vinyl starts spinning
      setIsPlaying(true);

      // 3. Fade to immersive mode (1s)
      setImmersiveMode(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Start real audio
      if (mainAudioRef.current) {
        mainAudioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
    }
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
          const duration = mainAudioRef.current.duration;
          const currentTime = mainAudioRef.current.currentTime;

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
              if (currentTime >= lyricsSource[i].time) {
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

  return (
    <div className="fixed inset-0 z-[999] bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black overflow-y-auto" style={{ backgroundColor: '#050505' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        /* Apple System Font Stack - Adjusted for Lyrics */
        .font-lyrics { 
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-weight: 800; /* Heavy weight like Apple Music */
          letter-spacing: -0.02em; /* Tighter tracking */
        }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .animate-spin-slow { animation: spin 6s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @keyframes strobe-flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* VISCERAL SURGE - The "Feeling" Effect */
        @keyframes visceral-surge {
          0% { 
            transform: scale(1); 
            color: white; 
            filter: brightness(1);
          }
          20% { 
            transform: scale(1.05); 
            color: #fff1f2; 
          }
          50% { 
            transform: scale(1.35); /* Magnifying Glass Effect */
            color: #e11d48; /* Pure Red */
            filter: drop-shadow(0 0 15px rgba(225, 29, 72, 0.6));
          }
          100% { 
            transform: scale(1.1); /* Linger slightly larger */
            color: #be123c; /* Deep Blood Red */
            filter: drop-shadow(0 0 5px rgba(190, 18, 60, 0.4));
          }
        }

        .animate-visceral-surge {
           animation-name: visceral-surge;
           animation-timing-function: cubic-bezier(0.25, 0.4, 0.25, 1);
        }

        /* SCRATCH MODE CHAOS */
        @keyframes scratch-spin {
           0% { transform: rotate(0deg) scale(1); }
           10% { transform: rotate(-25deg) scale(1.05); } 
           20% { transform: rotate(15deg) scale(0.95); } 
           30% { transform: rotate(-45deg) scale(1.1); } 
           40% { transform: rotate(5deg) scale(1); }
           50% { transform: rotate(-10deg) scale(1.02); }
           60% { transform: rotate(360deg) scale(1); } 
           70% { transform: rotate(-20deg) scale(1.05); }
           100% { transform: rotate(0deg) scale(1); }
        }

        @keyframes reality-warp {
           0% { transform: perspective(1000px) rotateX(0) rotateY(0) scale(1); filter: hue-rotate(0deg); }
           25% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) scale(1.02); filter: hue-rotate(45deg) contrast(1.2); }
           50% { transform: perspective(1000px) rotateX(-2deg) rotateY(2deg) scale(0.98); filter: hue-rotate(-45deg) contrast(1.1); }
           75% { transform: perspective(1000px) rotateX(1deg) rotateY(-1deg) scale(1.05); filter: hue-rotate(90deg); }
           100% { transform: perspective(1000px) rotateX(0) rotateY(0) scale(1); filter: hue-rotate(0deg); }
        }

        .animate-scratch-spin {
           animation: scratch-spin 0.8s linear infinite;
        }
        
        .animate-reality-warp {
           animation: reality-warp 4s ease-in-out infinite;
           will-change: transform, filter;
        }

        /* Deep Glow for surge */
        .animate-deep-glow {
           animation: visceral-surge 4s cubic-bezier(0.25, 0.4, 0.25, 1);
        }

        /* Apple Music Style Mesh Gradient Animations - GPU Accelerated */
        @keyframes meshFloat1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(5%, 8%, 0) scale(1.05); }
          66% { transform: translate3d(-3%, 4%, 0) scale(0.98); }
        }

        @keyframes meshFloat2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-6%, -4%, 0) scale(1.08); }
        }

        @keyframes meshFloat3 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33% { transform: translate3d(8%, -6%, 0) scale(1.1); }
          66% { transform: translate3d(-4%, 10%, 0) scale(0.95); }
        }

        /* Vertical Slide Animations for Lyrics - Refined */
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

        @keyframes fade-in-delayed {
          0% { opacity: 0; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }

        .animate-slide-current {
          animation: slide-current 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out forwards;
        }

        /* CLIMAX SHAKE - The "Drrr-Drrr" Drum Roll Effect - INTENSIFIED */
        @keyframes climax-shake {
           0% { transform: translate(0, 0) scale(1.3) rotate(0deg); filter: hue-rotate(0deg) blur(0px) contrast(1.5); }
           15% { transform: translate(20px, -20px) scale(1.6) rotate(5deg); filter: hue-rotate(60deg) blur(3px) invert(1) saturate(3); }
           30% { transform: translate(-25px, 15px) scale(1.2) rotate(-8deg); filter: hue-rotate(120deg) blur(0px) invert(0) contrast(2); }
           45% { transform: translate(15px, 25px) scale(1.7) rotate(10deg); filter: hue-rotate(180deg) blur(5px) invert(1) brightness(1.5); }
           60% { transform: translate(-20px, -20px) scale(1.1) rotate(-5deg); filter: hue-rotate(240deg) blur(0px) invert(0) saturate(4); }
           75% { transform: translate(25px, 10px) scale(1.8) rotate(8deg); filter: hue-rotate(300deg) blur(4px) invert(1) contrast(2.5); }
           90% { transform: translate(-10px, -15px) scale(1.4) rotate(-3deg); filter: hue-rotate(350deg) blur(2px) invert(0); }
           100% { transform: translate(0, 0) scale(1.3) rotate(0deg); filter: hue-rotate(0deg) blur(0px) contrast(1.5); }
        }

        .animate-climax-shake {
           animation: climax-shake 0.06s linear infinite; /* Even faster - terrifying */
        }

        /* VISCERAL SURGE - ARTISTIC "SOUL" EFFECT (NO SCALE) */
        @keyframes visceral-surge {
          0%, 100% { 
            color: #ffffff; 
            text-shadow: 0 0 0 transparent;
          }
          50% { 
            color: #ef4444; /* Pure Red */
            text-shadow: 0 0 30px rgba(225, 29, 72, 0.8); /* Strong Glow */
          }
        }

        .animate-visceral-surge {
           animation: visceral-surge 3s ease-in-out infinite;
        }

        /* SCRATCH MODE - CHAOS SPIRAL (INTENSE & VARIED) */
        @keyframes chaos-spiral {
           0% { transform: scale(1) rotate(0deg) translate3d(0,0,0); filter: hue-rotate(0deg) contrast(1); }
           10% { transform: scale(1.1) rotate(-10deg) skewX(20deg); filter: hue-rotate(45deg) contrast(1.5) invert(0); }
           20% { transform: scale(0.9) rotate(15deg) translate3d(-50px, 50px, 100px); filter: hue-rotate(90deg) blur(2px); }
           30% { transform: scale(1.3) rotate(-180deg) skewY(-10deg); filter: invert(1) hue-rotate(180deg); }
           45% { transform: scale(0.8) rotate(90deg) perspective(500px) rotateX(45deg); filter: sepia(1) saturate(5); }
           60% { transform: scale(1.4) rotate(360deg) translate3d(50px, -50px, 0); filter: hue-rotate(270deg) blur(0px) contrast(2); }
           75% { transform: scale(0.9) rotate(-45deg) skewX(-20deg); filter: invert(0) hue-rotate(320deg); }
           90% { transform: scale(1.1) rotate(10deg) perspective(1000px) rotateY(180deg); filter: hue-rotate(0deg) blur(4px); }
           100% { transform: scale(1) rotate(0deg) translate3d(0,0,0); filter: none; }
        }

        @keyframes scratch-shake {
           0%, 100% { transform: translate(0,0) rotate(0deg); }
           25% { transform: translate(-5px, 5px) rotate(-5deg); }
           50% { transform: translate(5px, -5px) rotate(5deg); }
           75% { transform: translate(-5px, -5px) rotate(-5deg); }
        }

        .animate-scratch-spin {
           animation: scratch-shake 0.1s linear infinite; /* Violet shaking */
        }
        
        .animate-reality-warp {
           animation: chaos-spiral 3s ease-in-out infinite;
           will-change: transform, filter;
        }
      `}</style>

      {/* HIDDEN AUDIO FOR MAIN PLAYER */}
      <audio
        ref={mainAudioRef}
        key={activeTrack?.id} // Force remount on track change
        src={activeTrack?.audioSrc || undefined}
        onTimeUpdate={handleMainTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setIsTonearmMoving(false);
          setImmersiveMode(false);
        }}
      />

      {/* HEADER */}
      <header className="relative w-full pt-20 pb-12 flex flex-col items-center justify-center z-10">
        <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-8 duration-1000">
           <div className="text-center space-y-2 group cursor-pointer" onClick={handleHeaderClick}>
              <h1 className="text-3xl md:text-5xl font-serif font-medium text-white tracking-[0.3em] uppercase transition-opacity duration-500 hover:opacity-80">
                Тексты & Переводы
              </h1>
           </div>
        </div>

        {isAdmin && (
          <div className="absolute right-8 top-8 flex gap-4 animate-in fade-in duration-500">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-105 ${editMode ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => setShowStudio(true)}
              className="p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all hover:scale-105"
            >
              <Upload size={18} />
            </button>
          </div>
        )}
      </header>

      {/* TRACKS GRID */}
      <div className="w-full pb-32 px-4 md:px-12">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 md:gap-y-20">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className="group cursor-pointer relative flex flex-col sm:flex-row items-center sm:items-center p-4 rounded-3xl hover:bg-white/[0.02] transition-colors min-h-[200px] sm:h-64 overflow-hidden"
              >
                {/* 1. Конверт (Cover Art Container) */}
                <div className="relative z-20 w-40 h-40 sm:w-44 md:w-48 sm:h-44 md:h-48 bg-[#0f0f0f] shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-sm flex flex-col justify-between p-4 md:p-5 border border-white/5 sm:group-hover:-translate-x-4 transition-transform duration-700 ease-out shrink-0">
                  <div className="w-full h-full opacity-20 absolute inset-0 blur-xl" style={{ background: getColorTheme(track.color).gradient }} />
                  <div className="relative z-10 text-[10px] text-gray-500 font-mono uppercase tracking-widest">Stereo</div>
                  <div className="relative z-10 font-lyrics text-2xl text-gray-200 leading-none truncate">{track.artist}</div>
                </div>

                {/* 2. Пластинка (Vinyl Record) - hidden on mobile, visible on sm+ */}
                <div className="hidden sm:block absolute left-20 md:left-24 z-10 w-36 md:w-44 h-36 md:h-44 transition-transform duration-700 ease-out group-hover:translate-x-20 md:group-hover:translate-x-24 group-hover:rotate-12 shrink-0">
                  <VinylRecord track={track} isPlaying={false} />
                </div>

                {/* 3. Название (Title) */}
                <div className="mt-4 sm:mt-0 sm:ml-44 md:ml-48 sm:pl-8 md:pl-12 flex flex-col justify-center sm:border-l border-white/5 sm:h-32 group-hover:border-amber-500/30 transition-colors w-full sm:w-auto">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-lyrics italic text-gray-400 group-hover:text-white transition-colors duration-300 text-center sm:text-left">
                    {track.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

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
                body: JSON.stringify({ artist: track.artist, title: track.title })
              });
              if (!response.ok) throw new Error('Failed to update');
              const updatedTrack = await response.json();
              setTracks(prev => prev.map(t => t.id === updatedTrack.id ? { ...t, artist: updatedTrack.artist, title: updatedTrack.title } : t));
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
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
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

      {/* --- ПРОИГРЫВАТЕЛЬ --- */}
      {activeTrack && (
        <div className="fixed inset-0 z-[100] overflow-hidden bg-[#0a0a0a]">
          {/* Strobe Flash Overlay */}
          {playerShowFlash && (
            <div
              className="fixed inset-0 z-[150] bg-white pointer-events-none"
              style={{ animation: 'strobe-flash 0.15s ease-out forwards' }}
            />
          )}

          {/* APPLE MUSIC STYLE DYNAMIC BACKGROUND */}
          {(() => {
            const theme = getColorTheme(activeTrack.color);
            return (
              <div className="absolute inset-0 overflow-hidden">
                {/* Base Dark Layer */}
                <div className="absolute inset-0 bg-[#0a0a0a]" />

                {/* Primary Color Blob - Top Left */}
                <div
                  className="absolute -top-[30%] -left-[20%] w-[80%] h-[80%] rounded-full"
                  style={{
                    background: `radial-gradient(circle at 40% 40%, ${theme.primary}, transparent 70%)`,
                    filter: 'blur(100px)',
                    animation: 'meshFloat1 18s ease-in-out infinite',
                    willChange: 'transform',
                    transform: 'translate3d(0,0,0)',
                  }}
                />

                {/* Secondary Color Blob - Bottom Right */}
                <div
                  className="absolute -bottom-[25%] -right-[15%] w-[70%] h-[70%] rounded-full"
                  style={{
                    background: `radial-gradient(circle at 60% 60%, ${theme.secondary}, transparent 70%)`,
                    filter: 'blur(80px)',
                    animation: 'meshFloat2 22s ease-in-out infinite',
                    animationDelay: '-5s',
                    willChange: 'transform',
                    transform: 'translate3d(0,0,0)',
                  }}
                />

                {/* Tertiary Accent - Center */}
                <div
                  className="absolute top-[15%] left-[25%] w-[55%] h-[55%] rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${theme.accent}, transparent 60%)`,
                    filter: 'blur(60px)',
                    animation: 'meshFloat3 25s ease-in-out infinite',
                    animationDelay: '-10s',
                    willChange: 'transform',
                    transform: 'translate3d(0,0,0)',
                  }}
                />

                {/* Smooth Dark Vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%)',
                  }}
                />
              </div>
            );
          })()}

          {/* CLOSE BUTTON */}
          <button
            onClick={handleClosePlayer}
            className={`absolute top-4 right-4 sm:top-8 sm:right-8 z-50 p-3 min-h-[44px] min-w-[44px] rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-500 hover:scale-105 flex items-center justify-center
              ${immersiveMode ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}
          >
            <X size={20} />
          </button>

          {/* BACK BUTTON (Top Left - Immersive) */}
          <button
            onClick={() => { setImmersiveMode(false); }}
            className={`absolute top-4 left-4 sm:top-8 sm:left-8 z-50 px-4 py-2 min-h-[44px] rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-500 flex items-center gap-2 hover:scale-105
              ${immersiveMode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
          >
            <ChevronRight className="rotate-180" size={18} />
            <span className="text-xs font-medium tracking-widest uppercase">Vinyl</span>
          </button>


          {/* MAIN CONTENT AREA */}
          <div className="relative w-full h-full flex items-center justify-center px-4">

            {/* --- VINYL VIEW (DEFAULT) --- */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-8 transition-all duration-[1500ms] cubic-bezier(0.2, 0.8, 0.2, 1)
               ${immersiveMode ? 'opacity-0 scale-110 blur-xl pointer-events-none translate-y-10' : 'opacity-100 scale-100 blur-0 translate-y-0'}`}>

              {/* Tap on vinyl to toggle play/pause */}
              <div
                onClick={togglePlay}
                className="cursor-pointer active:scale-[0.98] transition-transform duration-150 w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px]"
                role="button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <Turntable track={activeTrack} isPlaying={isPlaying} isTonearmMoving={isTonearmMoving} />
              </div>

              <div className="mt-8 sm:mt-12 md:mt-16 text-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 flex flex-col items-center px-4">
                <div className="space-y-2">
                   <h2 className="text-3xl sm:text-4xl md:text-6xl font-lyrics italic text-white tracking-tight drop-shadow-2xl">{activeTrack.title}</h2>
                   <p className="text-white/40 uppercase tracking-[0.3em] text-xs md:text-sm font-medium">{activeTrack.artist}</p>
                </div>

                {/* Initial Play Controls */}
                <div className="flex items-center justify-center gap-8 pt-2 sm:pt-4">
                   <button
                     onClick={togglePlay}
                     className="group relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md transition-all duration-500 hover:scale-110 hover:bg-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                   >
                      <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Play fill="white" className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1 relative z-10" />
                   </button>
                </div>
              </div>
            </div>


            {/* --- LYRICS / IMMERSIVE VIEW --- */}
            <div
               className={`relative w-full h-full flex flex-col items-center justify-center transition-all ease-linear overflow-hidden
                  ${immersiveMode ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}
                  ${swipeOffset !== 0 ? 'duration-0' : 'duration-75'}
               `}
               style={{
                   // DIGITAL STORM STYLES
                   textShadow: cinematicValues.chromatic > 0
                     ? `${cinematicValues.chromatic}px 0 red, -${cinematicValues.chromatic}px 0 blue`
                     : 'none',

                   // Transform: Sharp X/Y Jitters + ROTATE + SKEW + SWIPE OFFSET
                   transform: `translate3d(${cinematicValues.translateX + swipeOffset}px, ${cinematicValues.translateY}px, 0) rotate(${cinematicValues.rotate}deg) skewX(${cinematicValues.skew}deg) scale(${cinematicValues.scale})`,

                   // Lighting: Invert Flash + High Contrast + Swipe Opacity
                   filter: `invert(${cinematicValues.invert}) contrast(${cinematicValues.contrast}) brightness(${cinematicValues.contrast})`,
                   opacity: swipeOffset !== 0 ? 1 - Math.abs(swipeOffset) / 200 : undefined,

                   willChange: 'transform, filter, text-shadow, opacity',
                   transition: swipeOffset === 0 ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out' : 'none'
               }}
               // Touch Gesture Handlers
               onTouchStart={handleTouchStart}
               onTouchMove={handleTouchMove}
               onTouchEnd={(e) => {
                 handleTouchEnd();
                 handleDoubleTap(e);
               }}
            >
              {/* Swipe Direction Indicators */}
              {swipeDirection && (
                <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-between px-8">
                  <div className={`flex items-center gap-2 text-white/60 transition-opacity duration-150 ${swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'}`}>
                    <SkipBack className="w-8 h-8" />
                    <span className="text-sm font-medium">-10s</span>
                  </div>
                  <div className={`flex items-center gap-2 text-white/60 transition-opacity duration-150 ${swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-sm font-medium">+10s</span>
                    <SkipForward className="w-8 h-8" />
                  </div>
                </div>
              )}
              
              {/* REMOVED CLUB LIGHTS - PURE DIGITAL CHAOS */}

              {/* GHOST VINYL OVERLAY (Scratch Mode) */}
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 z-0 overflow-hidden ${isScratching ? 'opacity-40' : 'opacity-0'}`}>
                 <div className="w-full h-full max-w-[100vw] md:w-[80%] md:h-[80%] animate-scratch-spin opacity-50 blur-sm mix-blend-overlay">
                    <VinylRecord track={activeTrack} isPlaying={false} />
                 </div>
              </div>

              {/* ATMOSPHERE: Film Grain Overlay */}
              <div className="w-full h-full flex flex-col items-center justify-center text-center relative overflow-hidden px-8">
                {activeTrack.lyrics.length > 0 ? (() => {
                  const getLyricText = (line: any) => {
                    if (!line) return '';
                    return typeof line === 'string' ? line : line.translation || line.original || '';
                  };

                  // STRICT FILTER: Only highlight "чувство" and its variations
                  const SPECIAL_ROOT = 'чувств';

                  const renderLyricLine = (text: string) => {
                    // Split text while preserving spaces
                    const tokens = text.split(/(\s+)/);
                    return tokens.map((token, i) => {
                      const lower = token.toLowerCase();
                      const isSpecial = lower.includes(SPECIAL_ROOT);
                      
                      // VISCERAL GLOW EFFECT (No Scaling)
                      const specialStyle = {
                         color: '#ef4444', // Red-500
                         textShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)', // Deep Glow
                         display: 'inline-block',
                         animation: 'visceral-surge 4s infinite', // Just the color/glow pulse
                         willChange: 'text-shadow, color'
                      };
                      
                      return (
                        <span
                          key={i}
                          className={isSpecial ? 'relative z-50' : 'text-white'}
                          style={isSpecial ? specialStyle : undefined}
                        >
                          {token}
                        </span>
                      );
                    });
                  };

                  const currentText = getLyricText(activeTrack.lyrics[currentLyricIndex]);
                  const nextText = currentLyricIndex + 1 < activeTrack.lyrics.length 
                    ? getLyricText(activeTrack.lyrics[currentLyricIndex + 1]) 
                    : '';

                  return (
                    <div className="relative flex flex-col items-center justify-center h-full w-full max-w-6xl">
                       {/* CURRENT LINE - Center */}
                       <div 
                         key={currentLyricIndex} 
                         className="absolute flex flex-col items-center w-full transition-all duration-1000 ease-out animate-slide-current"
                       >
                          <h2
                            className="font-lyrics font-bold italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight drop-shadow-2xl text-center max-w-5xl relative z-40"
                            style={{ textShadow: 'inherit' }} // Inherit the chromatic aberration
                          >
                            {renderLyricLine(currentText)}
                          </h2>
                       </div>

                       {/* NEXT LINE (Preview) - Lower & Static */}
                       {nextText && (
                         <div 
                           key={currentLyricIndex + '-next'}
                           className="absolute bottom-[15%] flex flex-col items-center w-full opacity-0 animate-fade-in-delayed"
                         >
                            <p className="font-lyrics font-medium text-2xl md:text-3xl text-white/30 leading-tight text-center max-w-4xl blur-[1px]">
                              {nextText}
                            </p>
                         </div>
                       )}
                    </div>
                  );
                })() : (
                  <div className="text-white/40 font-lyrics text-2xl italic">No lyrics</div>
                )}
              </div>

              {/* CONTROLS BAR - Always visible on touch, hover on desktop */}
              <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-center pb-6 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:hover:opacity-100 transition-opacity duration-500 z-50 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="w-full max-w-md mx-4 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <button onClick={() => { if(mainAudioRef.current) mainAudioRef.current.currentTime -= 10; }} className="text-white/40 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                         <SkipBack className="w-6 h-6" />
                      </button>

                      <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center">
                         {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                      </button>

                      <button onClick={() => { if(mainAudioRef.current) mainAudioRef.current.currentTime += 10; }} className="text-white/40 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                         <SkipForward className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
