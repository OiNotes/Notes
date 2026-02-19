"use client";

import { useState, useCallback } from 'react';
import { log } from '@/lib/logger';
import type { Track } from '../types/music';

/**
 * useTrackManager — manages track CRUD operations (fetch, create, update, delete).
 */
export function useTrackManager() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  /** Load all tracks from database */
  const loadTracks = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/tracks');
      if (response.ok) {
        const data = await response.json();
        const tracksData = data.tracks || data; // Support both new { tracks, nextCursor } and legacy array format
        setTracks(tracksData);
        log('Loaded tracks:', tracksData);
      } else {
        setLoadError('Не удалось загрузить треки. Попробуйте снова.');
        console.error('Failed to load tracks');
      }
    } catch (error) {
      setLoadError('Ошибка сети. Проверьте подключение.');
      console.error('Error loading tracks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Publish (create or update) a track */
  const handlePublish = useCallback(async (trackData: {
    artist: string;
    title: string;
    color: string;
    audioFile: File | null;
    lyrics: Track['lyrics'];
    category: 'yours' | 'all' | 'visual';
    coverFile?: File | null;
    id?: string;
  }) => {
    try {
      log("Publishing/Updating track...", trackData);

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

      const payload: {
        artist: string;
        title: string;
        color: string;
        lyrics: Track['lyrics'];
        category: 'yours' | 'all' | 'visual';
        audioPath?: string;
        coverUrl?: string;
      } = {
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
        payload.audioPath = audioPath;
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
    } catch (error) {
      console.error('Error publishing track:', error);
      alert('Failed to save track');
    }
  }, []);

  /** Update a track (inline edit from studio) */
  const handleEditTrack = useCallback(async (track: Track) => {
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
  }, []);

  /** Delete a track */
  const handleDeleteTrack = useCallback(async (trackId: string) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setTracks(prev => prev.filter(t => t.id !== trackId));
      return true; // Signal success so caller can clean up active track
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Ошибка при удалении');
      return false;
    }
  }, []);

  /** Load full track details (including lyrics and strobeMarkers) */
  const loadFullTrack = useCallback(async (trackId: string): Promise<Track | null> => {
    try {
      const response = await fetch(`/api/tracks/${trackId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error loading full track:', error);
      return null;
    }
  }, []);

  return {
    tracks,
    setTracks,
    isLoading,
    loadTracks,
    loadFullTrack,
    loadError,
    handlePublish,
    handleEditTrack,
    handleDeleteTrack,
  };
}
