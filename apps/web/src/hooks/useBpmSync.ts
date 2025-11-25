'use client';

import { useState, useEffect, useRef, RefObject, useCallback } from 'react';
import { analyze } from 'web-audio-beat-detector';

interface BpmSyncState {
  bpm: number;
  isOnBeat: boolean;
  beatCount: number;
  confidence: number;
  isAnalyzing: boolean;
}

interface BpmSyncOptions {
  onBeat?: () => void;
  beatDuration?: number; // How long "isOnBeat" stays true (ms)
  analyzeInterval?: number; // How often to re-analyze BPM (ms)
}

/**
 * useBpmSync - Real-time BPM detection and beat synchronization hook
 *
 * Uses web-audio-beat-detector for tempo analysis and provides
 * beat-synced state for visual effects.
 *
 * @param audioRef - Reference to the HTMLAudioElement
 * @param options - Configuration options
 */
export function useBpmSync(
  audioRef: RefObject<HTMLAudioElement | null>,
  options: BpmSyncOptions = {}
): BpmSyncState {
  const {
    onBeat,
    beatDuration = 100,
    analyzeInterval = 5000
  } = options;

  const [state, setState] = useState<BpmSyncState>({
    bpm: 0,
    isOnBeat: false,
    beatCount: 0,
    confidence: 0,
    isAnalyzing: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyzeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastBeatTimeRef = useRef<number>(0);

  // Trigger beat pulse
  const triggerBeat = useCallback(() => {
    const now = Date.now();
    // Prevent double-triggers
    if (now - lastBeatTimeRef.current < 50) return;
    lastBeatTimeRef.current = now;

    setState(prev => ({
      ...prev,
      isOnBeat: true,
      beatCount: prev.beatCount + 1,
    }));

    onBeat?.();

    // Reset isOnBeat after duration
    setTimeout(() => {
      setState(prev => ({ ...prev, isOnBeat: false }));
    }, beatDuration);
  }, [onBeat, beatDuration]);

  // Start beat loop based on BPM
  const startBeatLoop = useCallback((bpm: number) => {
    if (beatIntervalRef.current) {
      clearInterval(beatIntervalRef.current);
    }

    if (bpm <= 0) return;

    const beatMs = 60000 / bpm; // Milliseconds per beat

    beatIntervalRef.current = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        triggerBeat();
      }
    }, beatMs);
  }, [audioRef, triggerBeat]);

  // Analyze audio for BPM
  const analyzeAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src || audio.paused) return;

    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      // Create AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      // Connect source if not already connected
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContext.createMediaElementSource(audio);
        sourceNodeRef.current.connect(audioContext.destination);
      }

      // Fetch audio data for analysis
      const response = await fetch(audio.src);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Analyze tempo - returns tempo as number directly
      const tempo = await analyze(audioBuffer);

      setState(prev => ({
        ...prev,
        bpm: Math.round(tempo as number),
        confidence: 0.9, // web-audio-beat-detector is generally reliable
        isAnalyzing: false,
      }));

      // Start beat synchronization
      startBeatLoop(tempo as number);

    } catch (error) {
      console.warn('[useBpmSync] Analysis failed:', error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        confidence: 0
      }));
    }
  }, [audioRef, startBeatLoop]);

  // Effect: Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      // Initial analysis when audio starts
      analyzeAudio();

      // Periodic re-analysis for accuracy
      analyzeIntervalRef.current = setInterval(() => {
        analyzeAudio();
      }, analyzeInterval);
    };

    const handlePause = () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
        beatIntervalRef.current = null;
      }
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
        analyzeIntervalRef.current = null;
      }
    };

    const handleEnded = () => {
      handlePause();
      setState(prev => ({ ...prev, beatCount: 0 }));
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      handlePause();
    };
  }, [audioRef, analyzeAudio, analyzeInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
      if (analyzeIntervalRef.current) clearInterval(analyzeIntervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return state;
}

export default useBpmSync;
