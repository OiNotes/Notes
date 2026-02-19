"use client";

import { useRef, useCallback, useSyncExternalStore } from 'react';

/**
 * useAudioEngine — manages audio playback with ref-based currentTime.
 *
 * currentTime is stored in a ref and exposed via useSyncExternalStore,
 * so only components that subscribe to it will re-render.
 */

type AudioEngineState = {
  currentTime: number;
  duration: number;
};

export function useAudioEngine() {
  const mainAudioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // --- Ref-based currentTime ---
  const stateRef = useRef<AudioEngineState>({ currentTime: 0, duration: 0 });
  const listenersRef = useRef<Set<() => void>>(new Set());

  const emitChange = useCallback(() => {
    listenersRef.current.forEach(listener => listener());
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => stateRef.current, []);

  // Subscribe to the audio state via useSyncExternalStore
  const audioState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  /** Update state from audio element — call this in a setInterval or timeupdate handler */
  const updateTimeFromAudio = useCallback(() => {
    if (!mainAudioRef.current) return;
    const ct = mainAudioRef.current.currentTime;
    const dur = mainAudioRef.current.duration || 0;
    // Only emit if values changed meaningfully (avoid micro-updates)
    if (
      Math.abs(ct - stateRef.current.currentTime) > 0.016 ||
      Math.abs(dur - stateRef.current.duration) > 0.1
    ) {
      stateRef.current = { currentTime: ct, duration: dur };
      emitChange();
    }
  }, [emitChange]);

  /** Seek to a position based on click clientX relative to progressBarRef */
  const handleScrub = useCallback((clientX: number) => {
    if (!mainAudioRef.current || !progressBarRef.current) return;
    const dur = mainAudioRef.current.duration;
    if (!dur || dur <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const newTime = percent * dur;
    mainAudioRef.current.currentTime = newTime;
    stateRef.current = { ...stateRef.current, currentTime: newTime };
    emitChange();
  }, [emitChange]);

  /** Seek to an absolute time */
  const seekTo = useCallback((time: number) => {
    if (mainAudioRef.current) {
      mainAudioRef.current.currentTime = time;
      stateRef.current = { ...stateRef.current, currentTime: time };
      emitChange();
    }
  }, [emitChange]);

  /** Get raw currentTime without triggering re-render (for intervals) */
  const getCurrentTimeRaw = useCallback(() => {
    return mainAudioRef.current?.currentTime ?? 0;
  }, []);

  /** Get raw duration without triggering re-render */
  const getDurationRaw = useCallback(() => {
    return mainAudioRef.current?.duration ?? 0;
  }, []);

  return {
    mainAudioRef,
    progressBarRef,
    currentTime: audioState.currentTime,
    duration: audioState.duration,
    updateTimeFromAudio,
    handleScrub,
    seekTo,
    getCurrentTimeRaw,
    getDurationRaw,
  };
}
