"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Zap
} from 'lucide-react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { log } from '@/lib/logger';
import type { Track } from '../../types/music';
import { COLOR_THEMES, getColorTheme } from '../../lib/color-themes';

/** A single synced lyric line used during studio editing */
type SyncedLyricLine = {
  id: number;
  original: string;
  translation: string;
  time: number;
  isSynced: boolean;
  isAppend: boolean;
};

// --- Button (local UI component) ---
const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  className?: string;
  disabled?: boolean;
}) => {
  const baseStyle = "px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed justify-center";
  const variants: Record<string, string> = {
    primary: "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    outline: "border-2 border-white/20 text-white hover:border-white hover:bg-white/5"
  };

  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

export const StudioModal = ({ onClose, onPublish, existingTracks, onEditTrack, onDeleteTrack }: {
  onClose: () => void,
  onPublish: (trackData: {
    artist: string;
    title: string;
    color: string;
    audioFile: File | null;
    lyrics: SyncedLyricLine[];
    category: 'yours' | 'all' | 'visual';
    coverFile?: File | null;
    id?: string;
  }) => Promise<void>,
  existingTracks?: Track[],
  onEditTrack?: (track: Track) => Promise<void>,
  onDeleteTrack?: (trackId: string) => Promise<void>
}) => {
  // --- STATE ---
  const [step, setStep] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [rawLyrics, setRawLyrics] = useState("");
  const [parseMode, setParseMode] = useState<'auto' | 'alternating'>('auto');
  const [parsedLyrics, setParsedLyrics] = useState<SyncedLyricLine[]>([]);
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingStrobe, setIsSavingStrobe] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Helper to load existing track for full editing
  const loadTrackForEditing = (track: Track) => {
    setEditingTrackId(track.id);
    setArtistName(track.artist);
    setTrackTitle(track.title);
    setTrackColor(track.color);
    setAudioUrl(track.audioSrc || null);

    const lyrics = track.syncedLyrics || track.lyrics || [];
    setParsedLyrics(lyrics as SyncedLyricLine[]);

    let raw = "";
    let currentOrig = "";
    let currentTrans = "";

    for (let i = 0; i < lyrics.length; i++) {
      const l = lyrics[i] as string | { original: string; translation?: string; time?: number; isAppend?: boolean };
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

    setHasJsonLoaded(true);
    setTrackCategory(track.category || 'yours');
    if (track.coverUrl) setCoverPreview(track.coverUrl);

    setStep(3);
  };

  // --- LOGIC: STEP 1 (UPLOAD) ---
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
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

    let pairs: SyncedLyricLine[] = [];
    const lines = rawLyrics.split('\n').filter(line => line.trim() !== '');

    if (parseMode === 'alternating') {
      for (let i = 0; i < lines.length; i += 2) {
        const rawOriginal = lines[i]?.trim() || "...";
        const rawTranslation = lines[i + 1]?.trim() || "";

        const originalParts = rawOriginal.split('/');
        const transParts = rawTranslation.includes('/') ? rawTranslation.split('/') : [rawTranslation];

        originalParts.forEach((part, idx) => {
          let trans = "";
          if (rawTranslation.includes('/')) {
            trans = transParts[idx]?.trim() || "";
          } else {
            trans = idx === 0 ? rawTranslation.trim() : "";
          }

          pairs.push({
            id: Date.now() + i + idx * 100,
            original: part.trim(),
            translation: trans,
            time: 0,
            isSynced: false,
            isAppend: idx > 0
          });
        });
      }
    } else {
      let groupedPairs: {original: string, translation: string}[] = [];
      let currentGroup: { original: string; translation: string } | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const isCyrillic = /[а-яёА-ЯЁ]/.test(line);

        if (isCyrillic) {
          if (currentGroup) {
            currentGroup.translation = line;
            groupedPairs.push(currentGroup);
            currentGroup = null;
          } else {
            groupedPairs.push({ original: "...", translation: line });
          }
        } else {
          if (currentGroup) groupedPairs.push(currentGroup);
          currentGroup = { original: line, translation: "" };
        }
      }
      if (currentGroup) groupedPairs.push(currentGroup);

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

  // --- LOGIC: STEP 2 (SYNC ENHANCED) ---
  const handleSyncKeys = useCallback((e: KeyboardEvent) => {
    if (step !== 2) return;

    if (e.code === 'Space') {
      e.preventDefault();

      if (!isPlaying) {
        audioRef.current?.play();
        return;
      }

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

        const nextIndex = Math.min(parsedLyrics.length - 1, activeLineIndex + 1);
        setActiveLineIndex(nextIndex);

        const element = document.getElementById(`lyric-row-${nextIndex}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    if (e.code === 'Backspace') {
      e.preventDefault();
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

      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 2);
      }

      const element = document.getElementById(`lyric-row-${targetIndex}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

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

  useEffect(() => {
    window.addEventListener('keydown', handleSyncKeys);
    return () => window.removeEventListener('keydown', handleSyncKeys);
  }, [handleSyncKeys]);

  const handleStrobeKey = useCallback((e: KeyboardEvent) => {
    if ((step !== 2 && step !== 4) || !strobeMode) return;

    if ((e.code === 'KeyW' || e.key === 'w' || e.key === 'W') && audioRef.current) {
      e.preventDefault();
      const currentTime = audioRef.current.currentTime;

      log('[Strobe] Marker added at', currentTime);

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
    if (editingTrackId) {
      setIsPublishing(true);
      try {
        await onPublish({
          artist: artistName,
          title: trackTitle,
          color: trackColor,
          audioFile: audioFile,
          lyrics: parsedLyrics,
          category: trackCategory,
          coverFile: coverFile,
          id: editingTrackId
        });
        onClose();
      } finally {
        setIsPublishing(false);
      }
      return;
    }

    if (!audioFile) {
      alert("Сначала загрузите аудиофайл");
      return;
    }

    setIsPublishing(true);
    try {
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
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col text-white font-sans selection:bg-amber-500 selection:text-black animate-slide-up">
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
          style={{ animation: 'strobe-flash var(--dur-strobe-flash, 140ms) ease-out forwards' }}
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
        <button onClick={onClose} className="text-white/50 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"><X size={24} /></button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">

        {/* STEP 0: TRACK LIST */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Мои треки</h1>
                <p className="text-white/70 text-sm">Управление опубликованными треками</p>
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
                            className="bg-white/5 border border-white/20 rounded p-3 sm:px-2 sm:py-1 text-sm w-32 outline-none focus:border-amber-500"
                            placeholder="Артист"
                          />
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-white/5 border border-white/20 rounded p-3 sm:px-2 sm:py-1 text-sm flex-1 outline-none focus:border-amber-500"
                            placeholder="Название"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-white truncate">{track.title}</h3>
                          <p className="text-sm text-white/70 truncate">{track.artist}</p>
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
                              setEditingStrobeTrack(track);
                              setStrobeMarkers(track.strobeMarkers || []);
                              setAudioUrl(track.audioSrc || null);
                              setStrobeMode(true);
                              setStep(4);
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
                <div className="text-center py-16 text-white/60">
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
              <p className="text-white/70">Создайте трек или загрузите сохранение</p>
            </div>

            {/* Track Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="text-sm text-white/70 mb-3 block">Обложка</label>
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
                <div className="text-sm text-white/60">
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
                  <p className="text-sm text-white/70 mb-4">{audioFile ? audioFile.name : "MP3, WAV, FLAC"}</p>
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
                  <p className="text-sm text-white/70 mb-4">{hasJsonLoaded ? `${parsedLyrics.length} строк разобрано` : "Импортируйте файл .json"}</p>
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
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${parseMode === 'auto' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
                  >
                    Авто
                  </button>
                  <button
                    onClick={() => setParseMode('alternating')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${parseMode === 'alternating' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
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
              <button onClick={clearProject} className="text-white/60 hover:text-red-500 flex items-center gap-2 text-sm transition-colors">
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
                <span className="text-white/70 text-sm uppercase tracking-widest">Режим</span>
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
              <div className="space-y-4 pb-[50dvh] pt-[20dvh]">
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
                                     className="text-white/40 hover:text-red-500 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                                 >
                                     <X size={14} />
                                 </button>
                             )}
                         </div>
                      </div>
                      <div className={`text-sm font-sans ${isActive ? 'text-amber-500' : 'text-white/60'}`}>
                          {line.translation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-between items-center text-sm text-white/60 font-mono">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full max-w-6xl mx-auto relative">
              {/* Publishing overlay */}
              {isPublishing && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3">
                  <svg className="w-8 h-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
                  <span className="text-white/70 text-sm">Загрузка и публикация...</span>
                </div>
              )}
              <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
                <div className="bg-[#111] p-4 rounded-xl border border-white/10 flex items-center justify-between shrink-0">
                  <h3 className="font-bold">Тайминги</h3>
                  <div className="text-sm text-white/60">Точная настройка (сек)</div>
                </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {parsedLyrics.map((line, index) => (
                  <div key={line.id} className={`p-3 rounded-lg border transition-colors cursor-pointer ${index === activeLineIndex ? 'bg-white/10 border-amber-500' : 'bg-[#111] border-white/5 hover:border-white/20'}`}
                    onClick={() => { if (audioRef.current) { audioRef.current.currentTime = line.time || 0; setActiveLineIndex(index); } }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-white/60">#{index + 1}</span>
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
                                let text = current.translation || current.original;
                                let prevIdx = activeLineIndex - 1;
                                while (prevIdx >= 0 && parsedLyrics[prevIdx + 1].isAppend) {
                                   const prev = parsedLyrics[prevIdx];
                                   text = (prev.translation || prev.original) + " " + text;
                                   if (!parsedLyrics[prevIdx].isAppend) break;
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
                <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">Стиль винила</label>
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
                <label className="block text-xs uppercase tracking-widest text-white/70 mb-2">Категория</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" onClick={() => setStep(2)} className="justify-center"><Mic size={18} /> Синхронизация</Button>
                <Button variant="secondary" onClick={exportDesign} className="justify-center"><Download size={18} /> Сохранить JSON</Button>
                <Button onClick={handleFinalPublish} disabled={isPublishing} className="justify-center">
                  {isPublishing ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg> Публикация...</>
                  ) : (
                    <><Share size={18} /> Опубликовать</>
                  )}
                </Button>
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
                <span className="text-white/70 text-sm uppercase tracking-widest">Редактор стробов</span>
                <div className="font-bold text-white">{editingStrobeTrack.title} - {editingStrobeTrack.artist}</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-white/60 text-sm">Нажмите &apos;W&apos;, чтобы добавить строб</span>
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
                {strobeMarkers.map((marker) => (
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
                {strobeMarkers.sort((a, b) => a.time - b.time).map((marker) => (
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
                  disabled={isSavingStrobe}
                  onClick={async () => {
                    setIsSavingStrobe(true);
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
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Error saving strobe markers:', error);
                    } finally {
                      setIsSavingStrobe(false);
                    }
                  }}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  {isSavingStrobe ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg> Saving...</>
                  ) : (
                    <><Save size={18} /> Save Strobes</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
