"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type VideoCardProps = {
  source: string;
  poster: string;
  title: string;
  caption?: string;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${secs}`;
};

export function VideoCard({ source, poster, title, caption }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("mediaSession" in navigator) || typeof window.MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title,
      artist: "Oi/Notes",
      album: "Видео заметки",
    });
  }, [title]);

  // Блокировка скролла
  const scrollPosition = useRef(0);

  const lockScroll = () => {
    scrollPosition.current = window.pageYOffset;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition.current}px`;
    document.body.style.width = '100%';
  };

  const unlockScroll = () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition.current);
  };

  // Управление контролами
  const resetHideControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    setShowControls(true);

    // Скрывать контролы через 3 секунды если воспроизводится
    const video = videoRef.current;
    if (!video || video.paused) return;

    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // Обработка активности пользователя
  const onUserActivity = () => {
    resetHideControlsTimer();
  };

  // Показать контролы при hover
  const handleMouseEnter = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
  };

  // Скрыть контролы при уходе курсора (с задержкой)
  const handleMouseLeave = () => {
    const video = videoRef.current;
    if (!video) return;

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    // Задержка 500ms перед скрытием
    hideControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 500);
  };

  // Управление режимом кинотеатра
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isTheaterMode) {
      document.body.classList.add("theater-mode-active");
      resetHideControlsTimer();

      // Плавно центрировать видео в viewport
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      document.body.classList.remove("theater-mode-active");
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    }

    return () => {
      document.body.classList.remove("theater-mode-active");
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, [isTheaterMode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      setDuration(video.duration);
      setIsMuted(video.muted || video.volume === 0);
      // НЕ запускаем видео автоматически
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setIsTheaterMode(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsTheaterMode(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setIsTheaterMode(false);
    };
    const handleTime = () => setCurrentTime(video.currentTime);
    const handleVolume = () => setIsMuted(video.muted || video.volume === 0);

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTime);
    video.addEventListener("volumechange", handleVolume);

    if (video.readyState >= 1) {
      handleLoaded();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTime);
      video.removeEventListener("volumechange", handleVolume);
    };
  }, []);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return (currentTime / duration) * 1000;
  }, [currentTime, duration]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const value = Number(event.currentTarget.value);
    video.currentTime = (value / 1000) * duration;
  };

  const exitTheaterMode = () => {
    const video = videoRef.current;
    if (video && !video.paused) {
      video.pause();
    }
  };

  return (
    <>
      {isTheaterMode && typeof document !== "undefined" && createPortal(
        <div
          className="video-card__backdrop"
          onClick={exitTheaterMode}
          aria-label="Выйти из режима кинотеатра"
        />,
        document.body
      )}
      <figure ref={containerRef} className={`video-card ${isTheaterMode ? "video-card--theater" : ""}`} data-theater-mode={isTheaterMode}>
        <div
          className="video-card__frame"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={onUserActivity}
        onTouchStart={onUserActivity}
        onClick={onUserActivity}
      >
        <video
          ref={videoRef}
          className="video-card__video"
          src={source}
          muted
          playsInline
          preload="metadata"
        />
        {/* Custom poster overlay to hide native browser placeholder */}
        {!isPlaying && <div className="video-card__poster" />}
        {!isPlaying && (
          <button
            type="button"
            className="video-card__play-btn"
            onClick={togglePlay}
            aria-label="Воспроизвести видео"
          >
            <PlayIcon />
          </button>
        )}
        <div
          className="video-card__controls"
          role="group"
          aria-label="Видео контролы"
          data-visible={showControls && isPlaying}
        >
          <button
            type="button"
            className="video-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className="video-time" aria-live="off">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            value={progress}
            step={1}
            className="video-seek"
            onChange={handleSeek}
            aria-label="Позиция воспроизведения"
          />
          <span className="video-time">{formatTime(duration)}</span>
          <button
            type="button"
            className="video-btn"
            onClick={toggleMute}
            aria-label={isMuted ? "Включить звук" : "Отключить звук"}
          >
            {isMuted ? <MuteIcon /> : <VolumeIcon />}
          </button>
        </div>
      </div>
      {caption ? <figcaption className="video-card__caption">{caption}</figcaption> : null}
      </figure>
    </>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M5 9v6h4l5 4V5l-5 4H5z" />
      <path d="M16 12c0-1.77.77-3.35 2-4.44v8.88A5.98 5.98 0 0 1 16 12z" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M5 9v6h4l5 4V5l-5 4H5z" />
      <path d="m18.3 8.41-1.41 1.41L19.08 12l-2.19 2.18 1.41 1.41L20.5 13.4l2.2 2.19 1.41-1.41L21.92 12l2.19-2.18-1.41-1.41-2.2 2.19-2.2-2.19z" />
    </svg>
  );
}
