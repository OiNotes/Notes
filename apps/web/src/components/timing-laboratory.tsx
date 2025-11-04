"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/music-utils";
import type { LyricLine } from "@/lib/music-schema";

type TimingLaboratoryProps = {
  audioUrl: string;
  onSave: (lyrics: LyricLine[]) => void;
};

export function TimingLaboratory({ audioUrl, onSave }: TimingLaboratoryProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [lyricsText, setLyricsText] = useState("");
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<"edit" | "timing" | "preview">("edit");

  // Парсинг текста в строки
  useEffect(() => {
    const lines = lyricsText
      .split("\n")
      .map((text, index) => text.trim())
      .filter(Boolean)
      .map((text, index) => ({
        id: `line-${index}`,
        text,
        startTime: 0,
      }));
    setLyrics(lines);
    setCurrentLineIndex(0);
  }, [lyricsText]);

  // Обновление времени
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (mode === "timing") {
        setMode("preview");
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [mode]);

  // Обработка ПРОБЕЛА для отметки тайминга
  useEffect(() => {
    if (mode !== "timing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        markTiming();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, currentLineIndex, currentTime]);

  const handlePlay = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  const startTiming = () => {
    if (lyrics.length === 0) {
      alert("Сначала введите текст!");
      return;
    }
    setMode("timing");
    setCurrentLineIndex(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    handlePlay();
  };

  const markTiming = () => {
    if (currentLineIndex >= lyrics.length) return;

    const updatedLyrics = [...lyrics];
    updatedLyrics[currentLineIndex].startTime = currentTime * 1000; // в миллисекундах

    setLyrics(updatedLyrics);
    setCurrentLineIndex(currentLineIndex + 1);

    // Если это была последняя строка
    if (currentLineIndex + 1 >= lyrics.length) {
      handlePause();
      setMode("preview");
    }
  };

  const handleSave = () => {
    // Проверка что все строки имеют тайминги
    const hasUntimed = lyrics.some((line) => line.startTime === 0);
    if (hasUntimed) {
      if (
        !confirm(
          "Не все строки имеют тайминги. Сохранить всё равно?"
        )
      ) {
        return;
      }
    }
    onSave(lyrics);
  };

  const resetTimings = () => {
    if (confirm("Сбросить все тайминги и начать заново?")) {
      const resetLyrics = lyrics.map((line) => ({ ...line, startTime: 0 }));
      setLyrics(resetLyrics);
      setCurrentLineIndex(0);
      setMode("edit");
      handlePause();
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Найти активную строку в режиме preview
  const getPreviewActiveIndex = () => {
    const currentMs = currentTime * 1000;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentMs >= lyrics[i].startTime) {
        return i;
      }
    }
    return -1;
  };

  const previewActiveIndex = mode === "preview" ? getPreviewActiveIndex() : -1;

  return (
    <div className="timing-lab">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="timing-lab__container">
        {/* Панель управления */}
        <div className="timing-lab__controls">
          <div className="timing-lab__playback">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="timing-lab__play-btn"
            >
              {isPlaying ? "Пауза" : "Играть"}
            </button>

            <div className="timing-lab__time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <input
              type="range"
              className="timing-lab__seek"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
            />
          </div>

          <div className="timing-lab__mode-indicator">
            {mode === "edit" && "📝 Режим редактирования"}
            {mode === "timing" && (
              <>
                ⏱️ Расстановка таймингов — Строка {currentLineIndex + 1} / {lyrics.length}
                <br />
                <strong>Нажми ПРОБЕЛ когда должна появиться строка!</strong>
              </>
            )}
            {mode === "preview" && "👁️ Режим предпросмотра"}
          </div>

          <div className="timing-lab__actions">
            {mode === "edit" && (
              <button onClick={startTiming} className="timing-lab__btn timing-lab__btn--primary">
                Начать расстановку
              </button>
            )}
            {mode === "timing" && (
              <>
                <button onClick={markTiming} className="timing-lab__btn timing-lab__btn--mark">
                  Отметить (ПРОБЕЛ)
                </button>
                <button onClick={handlePause} className="timing-lab__btn">
                  Приостановить
                </button>
              </>
            )}
            {mode === "preview" && (
              <>
                <button onClick={() => setMode("edit")} className="timing-lab__btn">
                  Вернуться к редактированию
                </button>
                <button onClick={resetTimings} className="timing-lab__btn">
                  Сбросить тайминги
                </button>
                <button onClick={handleSave} className="timing-lab__btn timing-lab__btn--success">
                  Сохранить
                </button>
              </>
            )}
          </div>
        </div>

        {/* Редактор текста / Список строк */}
        <div className="timing-lab__content">
          {mode === "edit" && (
            <div className="timing-lab__editor">
              <label htmlFor="lyrics-input" className="timing-lab__label">
                Введите текст песни (построчно):
              </label>
              <textarea
                id="lyrics-input"
                ref={textareaRef}
                className="timing-lab__textarea"
                placeholder="Строка 1&#10;Строка 2&#10;Строка 3&#10;..."
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                rows={20}
              />
              <p className="timing-lab__hint">
                {lyrics.length} {lyrics.length === 1 ? "строка" : "строк"}
              </p>
            </div>
          )}

          {(mode === "timing" || mode === "preview") && (
            <div className="timing-lab__lyrics">
              {lyrics.map((line, index) => (
                <div
                  key={line.id}
                  className={`timing-lab__lyric-line ${
                    mode === "timing" && index === currentLineIndex ? "is-current" : ""
                  } ${mode === "preview" && index === previewActiveIndex ? "is-active" : ""} ${
                    line.startTime > 0 ? "has-timing" : ""
                  }`}
                >
                  <span className="timing-lab__lyric-number">{index + 1}</span>
                  <span className="timing-lab__lyric-text">{line.text}</span>
                  <span className="timing-lab__lyric-time">
                    {line.startTime > 0 ? formatTime(line.startTime / 1000) : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
