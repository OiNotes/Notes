"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { log } from '@/lib/logger';
import { getColorTheme } from '../../../lib/color-themes';
import { VisualizerErrorBoundary } from '../../../components/music/visualizer-error-boundary';

const PlaceboVisualizer = dynamic(
  () => import('../../../components/placebo-visualizer').then(m => ({ default: m.PlaceboVisualizer })),
  { ssr: false }
);
import type { Track, CategoryFilter } from '../../../types/music';
import { useAudioEngine } from '../../../hooks/useAudioEngine';
import { useTrackManager } from '../../../hooks/useTrackManager';
import { useLyricsSync } from '../../../hooks/useLyricsSync';

import {
  Dock,
  MiniPlayer,
  StudioModal,
  PinModal,
  FullPlayer,
  TrackGrid,
  Toast,
} from '../../../components/music';

const AmbientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#050505] pointer-events-none">
    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-900/20 rounded-full blur-[120px] animate-blob" />
    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-amber-900/15 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '-7s' }} />
    <div className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-rose-900/10 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '-14s' }} />
  </div>
);

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  className?: string;
  disabled?: boolean;
}) => {
  const base = "px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed justify-center";
  const v: Record<string, string> = {
    primary: "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
    outline: "border-2 border-white/20 text-white hover:border-white hover:bg-white/5"
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${v[variant]} ${className}`}>{children}</button>;
};

export default function MusicApp() {
  // --- HOOKS ---
  const { tracks, setTracks, isLoading, loadTracks, loadError, handlePublish, handleEditTrack, handleDeleteTrack } = useTrackManager();
  const { mainAudioRef, progressBarRef, currentTime, duration, updateTimeFromAudio, handleScrub, seekTo, getCurrentTimeRaw, getDurationRaw } = useAudioEngine();

  // --- LOCAL STATE ---
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isTonearmMoving, setIsTonearmMoving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerShowFlash, setPlayerShowFlash] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('visual');
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  // Audio analysis state
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Cinematic values (clean mode - effects disabled)
  const cinematicResetRef = useRef({ chromatic: 0, contrast: 1, scale: 1, translateX: 0, translateY: 0, invert: 0, skew: 0, rotate: 0 });

  // Admin state
  const [clicks, setClicks] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Edit mode state
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'error' | 'info' | 'success'; action?: { label: string; onClick: () => void } } | null>(null);

  // Store trigger element for focus return on modal close
  const modalTriggerRef = useRef<HTMLElement | null>(null);

  // Lyrics sync hook
  const { currentLyricIndex, setCurrentLyricIndex, isLyricAnimating, updateLyricIndex } = useLyricsSync(
    activeTrack,
    getCurrentTimeRaw,
    getDurationRaw,
    isPlaying
  );

  const filteredTracks = useMemo(() => {
    if (activeCategory === 'visual') {
      return tracks.filter(t => t.category === 'visual');
    }
    if (activeCategory === 'all') {
      return tracks.filter(t => t.category === 'yours');
    }
    return tracks.filter(t => t.category !== 'yours' && t.category !== 'visual');
  }, [tracks, activeCategory]);

  useEffect(() => {
    if (loadError) {
      setToastMessage({
        text: loadError,
        type: 'error',
        action: { label: 'Повторить', onClick: () => { setToastMessage(null); loadTracks(); } },
      });
    }
  }, [loadError, loadTracks]);

  // --- AUDIO ANALYZER INIT ---
  const initAudioAnalyzer = useCallback(() => {
    if (!mainAudioRef.current || audioContextRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
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
  }, [mainAudioRef]);

  // --- EFFECTS ---

  // Load tracks on mount
  useEffect(() => {
    log('[MusicApp] Mounted. Loading tracks from database...');
    loadTracks();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [loadTracks]);

  // Clean up AudioContext when track changes
  useEffect(() => {
    if (audioContextRef.current) {
      log('[MusicApp] Closing old AudioContext');
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      dataArrayRef.current = null;
    }
  }, [activeTrack]);

  // Viewport listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const listener = (e: MediaQueryListEvent) => setIsMobileViewport(e.matches);
    setIsMobileViewport(mq.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  // Immersive mode delay after play
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => setImmersiveMode(true), 2000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Auto-hide on mobile/visual
  useEffect(() => {
    if (isPlaying && (isMobileViewport || activeCategory === 'visual')) {
      setShowFullPlayer(false);
      setImmersiveMode(false);
    }
  }, [isPlaying, activeCategory, isMobileViewport]);

  useEffect(() => {
    if (isMobileViewport && activeCategory === 'visual') {
      setShowFullPlayer(false);
      setImmersiveMode(false);
    }
  }, [activeCategory, isMobileViewport]);

  // --- PLAYER FLASH ---
  const triggerPlayerFlash = useCallback(() => {
    setPlayerShowFlash(true);
    setTimeout(() => setPlayerShowFlash(false), 150);
  }, []);

  // --- MAIN PLAYBACK LOOP ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && activeTrack) {
      interval = setInterval(() => {
        if (mainAudioRef.current && mainAudioRef.current.duration) {
          updateTimeFromAudio();
          updateLyricIndex();
          // Clean mode - no shake effects
        } else {
          // Fallback simulation
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
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack, progress, currentLyricIndex, mainAudioRef, updateTimeFromAudio, updateLyricIndex]);

  // Strobe markers playback via rAF
  const lastStrobeCheckTime = useRef(0);

  useEffect(() => {
    if (!isPlaying || !activeTrack?.strobeMarkers?.length || !mainAudioRef.current) {
      if (mainAudioRef.current) lastStrobeCheckTime.current = mainAudioRef.current.currentTime;
      return;
    }

    let rafId: number;
    const checkStrobeMarkers = () => {
      const ct = mainAudioRef.current?.currentTime || 0;
      const lastTime = lastStrobeCheckTime.current;
      if (Math.abs(ct - lastTime) > 0.5 || ct < lastTime) {
        lastStrobeCheckTime.current = ct;
      } else {
        const hasMarker = activeTrack.strobeMarkers?.some(marker =>
          marker.time > lastTime && marker.time <= ct
        );
        if (hasMarker) triggerPlayerFlash();
        lastStrobeCheckTime.current = ct;
      }
      rafId = requestAnimationFrame(checkStrobeMarkers);
    };

    rafId = requestAnimationFrame(checkStrobeMarkers);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, activeTrack, triggerPlayerFlash, mainAudioRef]);

  // --- CALLBACKS ---

  const handleHeaderClick = useCallback(() => {
    if (isAdmin) { setShowStudio(true); return; }
    setClicks(prev => {
      const newClicks = prev + 1;
      if (newClicks >= 5) { setShowPinModal(true); return 0; }
      return newClicks;
    });
  }, [isAdmin]);

  const handlePinSuccess = useCallback(() => {
    setIsAdmin(true);
    setShowPinModal(false);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setActiveTrack(null);
    setImmersiveMode(false);
    setShowFullPlayer(false);
    setIsPlaying(false);
    setIsTonearmMoving(false);
    setCurrentLyricIndex(0);
    if (mainAudioRef.current) {
      mainAudioRef.current.pause();
      mainAudioRef.current.currentTime = 0;
    }
  }, [mainAudioRef, setCurrentLyricIndex]);

  const toggleMainPlay = useCallback(async () => {
    if (!audioContextRef.current) initAudioAnalyzer();
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();

    if (isPlaying) { handleClosePlayer(); return; }

    setIsTonearmMoving(true);
    setCurrentLyricIndex(0);
    if (mainAudioRef.current) mainAudioRef.current.currentTime = 0;

    await new Promise(resolve => setTimeout(resolve, 1200));

    if (mainAudioRef.current) {
      try {
        await mainAudioRef.current.play();
        setIsPlaying(true);
        if (isMobileViewport || activeCategory === 'visual') {
          setShowFullPlayer(false);
          setImmersiveMode(false);
        }
      } catch (e) {
        console.error("Playback failed:", e);
        setIsPlaying(false);
      }
    }

    setTimeout(() => setIsTonearmMoving(false), 500);
  }, [isPlaying, handleClosePlayer, initAudioAnalyzer, mainAudioRef, isMobileViewport, activeCategory, setCurrentLyricIndex]);

  const handleSelectTrack = useCallback((track: Track) => {
    log('[MusicApp] Track Selected:', track.title);
    setActiveTrack(track);
    const hideOnMobileVisualizer = isMobileViewport && activeCategory === 'visual';
    setShowFullPlayer(!hideOnMobileVisualizer);
    setIsPlaying(false);
    setIsTonearmMoving(false);
    setImmersiveMode(false);
    setProgress(0);
    setCurrentLyricIndex(0);
  }, [isMobileViewport, activeCategory, setCurrentLyricIndex]);

  const handleSeek = useCallback((time: number) => {
    seekTo(time);
  }, [seekTo]);

  const handleUpdateTrack = useCallback(async () => {
    if (!editingTrack) return;
    try {
      const response = await fetch(`/api/tracks/${editingTrack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artist: editingTrack.artist, title: editingTrack.title })
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
  }, [editingTrack, setTracks]);

  const handleSkip = useCallback((seconds: number) => {
    if (mainAudioRef.current) {
      mainAudioRef.current.currentTime += seconds;
    }
  }, [mainAudioRef]);

  // Global keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'Escape':
          if (showFullPlayer) { handleClosePlayer(); e.preventDefault(); }
          else if (showStudio) { setShowStudio(false); modalTriggerRef.current?.focus(); e.preventDefault(); }
          else if (showPinModal) { setShowPinModal(false); e.preventDefault(); }
          break;
        case 'ArrowRight':
          if (isPlaying && activeTrack) { handleSkip(5); e.preventDefault(); }
          break;
        case 'ArrowLeft':
          if (isPlaying && activeTrack) { handleSkip(-5); e.preventDefault(); }
          break;
        case 'ArrowUp':
          if (mainAudioRef.current && isPlaying) {
            mainAudioRef.current.volume = Math.min(1, mainAudioRef.current.volume + 0.1);
            e.preventDefault();
          }
          break;
        case 'ArrowDown':
          if (mainAudioRef.current && isPlaying) {
            mainAudioRef.current.volume = Math.max(0, mainAudioRef.current.volume - 0.1);
            e.preventDefault();
          }
          break;
        case ' ':
          if (activeTrack) { toggleMainPlay(); e.preventDefault(); }
          break;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showFullPlayer, showStudio, showPinModal, isPlaying, activeTrack, handleClosePlayer, handleSkip, toggleMainPlay, mainAudioRef]);

  // --- RENDER ---
  return (
    <main id="main" className="relative h-full w-full bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black flex flex-col overflow-hidden">
      <style jsx global>{`
        /* Z-index scale */
        :root { --z-base: 10; --z-grid: 10; --z-header: 40; --z-dock: 40; --z-player: 50; --z-modal: 60; --z-visualizer: 60; --z-flash: 70; }
        .font-lyrics { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Rounded", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: -0.02em; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Fraunces', Georgia, serif; }
        .animate-spin-slow { animation: spin var(--dur-vinyl-spin, 6s) linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; } 25% { transform: translate(10%, 5%) scale(1.1); opacity: 0.8; } 50% { transform: translate(5%, 15%) scale(0.95); opacity: 0.5; } 75% { transform: translate(-5%, 10%) scale(1.05); opacity: 0.7; } }
        .animate-blob { animation: blob 20s ease-in-out infinite; }
        @keyframes strobe-flash { 0% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes lyric-crossfade { 0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(12px); } 100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } }
        .animate-lyric-crossfade { animation: lyric-crossfade 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        @keyframes music-bar { 0%, 100% { height: 33%; } 50% { height: 100%; } }
        @keyframes mesh-drift { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(6%,-4%,0) scale(1.06); } 100% { transform: translate3d(0,0,0) scale(1); } }
        @keyframes mesh-pulse { 0% { transform: translate3d(0,0,0) scale(1); opacity: 0.35; } 40% { transform: translate3d(-4%,5%,0) scale(1.08); opacity: 0.5; } 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.35; } }
        @keyframes mesh-glow { 0% { transform: translate3d(0,0,0) scale(1); opacity: 0.22; } 50% { transform: translate3d(3%,-6%,0) scale(1.04); opacity: 0.4; } 100% { transform: translate3d(0,0,0) scale(1); opacity: 0.22; } }
        .mesh-drift { animation: mesh-drift 16s ease-in-out infinite; }
        .mesh-pulse { animation: mesh-pulse 18s ease-in-out infinite; }
        .mesh-glow { animation: mesh-glow 20s ease-in-out infinite; }
      `}</style>

      {/* HIDDEN AUDIO FOR MAIN PLAYER */}
      <audio
        ref={mainAudioRef}
        key={activeTrack?.id}
        src={activeTrack?.audioSrc || undefined}
        crossOrigin="anonymous"
        preload="metadata"
        onLoadedData={() => log("Audio loaded:", activeTrack?.audioSrc)}
        onError={(e) => {
          console.error("Audio error:", e.currentTarget.error);
          setToastMessage({ text: 'Ошибка воспроизведения аудио. Попробуйте другой трек.', type: 'error' });
        }}
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

      {/* TRACKS GRID */}
      <TrackGrid
        activeCategory={activeCategory}
        filteredTracks={filteredTracks}
        activeTrack={activeTrack}
        isPlaying={isPlaying}
        isLoading={isLoading}
        getColorTheme={getColorTheme}
        onSelectTrack={handleSelectTrack}
        onRequestStudio={isAdmin ? () => setShowStudio(true) : undefined}
      />

      {/* DOCK NAVIGATION */}
      <nav aria-label="Category navigation">
        <Dock
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onStudioOpen={() => { modalTriggerRef.current = document.activeElement as HTMLElement; setShowStudio(true); }}
          isAdmin={isAdmin}
        />
      </nav>

      {/* MINI PLAYER */}
      {activeTrack && !immersiveMode && !(isMobileViewport && activeCategory === 'visual') && (
        <MiniPlayer
          track={activeTrack}
          isPlaying={isPlaying}
          onToggle={toggleMainPlay}
          onOpen={() => { setShowFullPlayer(true); setImmersiveMode(true); }}
          getColorTheme={getColorTheme}
        />
      )}

      {/* FULL SCREEN PLAYER */}
      {activeTrack && showFullPlayer && !(isMobileViewport && activeCategory === 'visual') && (
        <FullPlayer
          activeTrack={activeTrack}
          isPlaying={isPlaying}
          immersiveMode={immersiveMode}
          isTonearmMoving={isTonearmMoving}
          currentLyricIndex={currentLyricIndex}
          currentTime={currentTime}
          duration={duration}
          playerShowFlash={playerShowFlash}
          progressBarRef={progressBarRef}
          onClose={handleClosePlayer}
          onTogglePlay={toggleMainPlay}
          onToggleImmersive={() => setImmersiveMode(!immersiveMode)}
          onScrub={handleScrub}
          onSkip={handleSkip}
        />
      )}

      {/* PLACEBO VISUALIZER */}
      {activeTrack && (activeTrack.title === "Without You I'm Nothing" || activeTrack.title.toLowerCase().includes('without you')) && (
        <VisualizerErrorBoundary>
          <Suspense fallback={<div className="fixed inset-0 z-[60] bg-[#050505] flex items-center justify-center"><div className="animate-pulse text-white/40 text-lg">Loading visualizer...</div></div>}>
            <PlaceboVisualizer
              activeTrack={activeTrack}
              currentTime={currentTime}
              isPlaying={isPlaying}
              duration={duration}
              onTogglePlay={toggleMainPlay}
              onSeek={handleSeek}
              onClose={handleClosePlayer}
            />
          </Suspense>
        </VisualizerErrorBoundary>
      )}

      {/* PIN MODAL */}
      {showPinModal && (
        <PinModal onClose={() => setShowPinModal(false)} onSuccess={handlePinSuccess} />
      )}

      {/* STUDIO MODAL */}
      {showStudio && (
        <StudioModal
          onClose={() => { setShowStudio(false); modalTriggerRef.current?.focus(); }}
          onPublish={handlePublish}
          existingTracks={tracks}
          onEditTrack={handleEditTrack}
          onDeleteTrack={async (trackId) => {
            const success = await handleDeleteTrack(trackId);
            if (success && activeTrack?.id === trackId) {
              setActiveTrack(null);
              setIsPlaying(false);
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
                <label className="text-xs uppercase tracking-widest text-white/70">Артист</label>
                <input
                  value={editingTrack?.artist || ''}
                  onChange={e => setEditingTrack(prev => prev ? { ...prev, artist: e.target.value } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/70">Название</label>
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

      {/* Toast notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onDismiss={() => setToastMessage(null)}
          action={toastMessage.action}
        />
      )}
    </main>
  );
}
