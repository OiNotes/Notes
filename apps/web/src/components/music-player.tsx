"use client";

import { useEffect, useRef, useState } from "react";
import type { Song } from "@/lib/music-schema";
import { formatTime, getActiveLyricIndex } from "@/lib/music-utils";

type MusicPlayerProps = {
  song: Song;
};

export function MusicPlayer({ song }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song.duration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);

  // Авто-скрытие контролов через 3 секунды
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  // Обновление текущего времени
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setActiveLyricIndex(getActiveLyricIndex(song.lyrics, audio.currentTime));
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveLyricIndex(-1);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [song.lyrics]);

  // Автоматическая прокрутка к активной строке
  useEffect(() => {
    if (activeLyricIndex < 0 || !lyricsContainerRef.current) return;

    const activeElement = lyricsContainerRef.current.querySelector(
      `[data-lyric-index="${activeLyricIndex}"]`
    );

    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLyricIndex]);

  // Media Session API для управления с устройства
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        artwork: [{ src: song.coverImageUrl, sizes: "512x512", type: "image/jpeg" }],
      });

      navigator.mediaSession.setActionHandler("play", () => handlePlay());
      navigator.mediaSession.setActionHandler("pause", () => handlePause());
      navigator.mediaSession.setActionHandler("seekbackward", () => handleSeek(currentTime - 10));
      navigator.mediaSession.setActionHandler("seekforward", () => handleSeek(currentTime + 10));
    }
  }, [song, currentTime]);

  const handlePlay = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSeek(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioRef.current.muted = newMuted;
  };

  const handleLyricClick = (startTime: number) => {
    handleSeek(startTime / 1000);
    if (!isPlaying) {
      handlePlay();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="music-player"
      onMouseMove={handleMouseMove}
      style={
        {
          "--accent-color": song.accent || "var(--color-accent-start)",
        } as React.CSSProperties
      }
    >
      {/* Скрытый аудио элемент */}
      <audio ref={audioRef} src={song.audioUrl} preload="metadata" />

      {/* Обложка альбома */}
      <div className="music-player__cover">
        <img src={song.coverImageUrl} alt={`${song.title} — обложка`} />
        <div className="music-player__cover-overlay" />
      </div>

      {/* Информация о песне */}
      <div className="music-player__info">
        <h1 className="music-player__title">{song.title}</h1>
        <p className="music-player__artist">{song.artist}</p>
        {song.description && (
          <p className="music-player__description">{song.description}</p>
        )}
      </div>

      {/* Тексты песен */}
      <div className="music-player__lyrics" ref={lyricsContainerRef}>
        {song.lyrics.map((line, index) => (
          <div
            key={line.id}
            data-lyric-index={index}
            className={`music-player__lyric-line ${
              index === activeLyricIndex ? "is-active" : ""
            } ${index < activeLyricIndex ? "is-past" : ""}`}
            onClick={() => handleLyricClick(line.startTime)}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Контролы */}
      <div
        className="music-player__controls"
        data-visible={showControls}
      >
        <div className="music-player__controls-inner">
          {/* Play/Pause */}
          <button
            className="music-player__play-btn"
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 5.14v13.72L19 12L8 5.14z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Время */}
          <div className="music-player__time">
            <span>{formatTime(currentTime)}</span>
            <span className="music-player__time-separator">/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Прогресс-бар */}
          <div className="music-player__seek-wrapper">
            <input
              type="range"
              className="music-player__seek"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={handleSeekChange}
              style={{ "--progress": `${progressPercent}%` } as React.CSSProperties}
              aria-label="Позиция воспроизведения"
            />
          </div>

          {/* Громкость */}
          <div className="music-player__volume-group">
            <button
              className="music-player__mute-btn"
              onClick={handleMuteToggle}
              aria-label={isMuted ? "Включить звук" : "Выключить звук"}
            >
              {isMuted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z"
                    fill="currentColor"
                  />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 9v6h4l5 5V4l-5 5H7zm7 2.17L11.83 9H9v6h2.83L14 17.17z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
            <input
              type="range"
              className="music-player__volume"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{ "--volume": `${volume * 100}%` } as React.CSSProperties}
              aria-label="Громкость"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
