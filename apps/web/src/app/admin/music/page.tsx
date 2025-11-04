"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin-guard";
import { TimingLaboratory } from "@/components/timing-laboratory";
import type { Song, LyricLine } from "@/lib/music-schema";

function AdminMusicContent() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "timing">("form");
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    artist: "",
    originalArtist: "",
    audioUrl: "",
    coverImageUrl: "",
    duration: 0,
    description: "",
    accent: "#caa57a",
    tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!formData.slug || !formData.title || !formData.artist || !formData.audioUrl) {
      alert("Заполните обязательные поля!");
      return;
    }

    // Переход к расстановке таймингов
    setStep("timing");
  };

  const handleSaveLyrics = async (lyrics: LyricLine[]) => {
    const song: Song = {
      id: formData.slug,
      slug: formData.slug,
      title: formData.title,
      artist: formData.artist,
      originalArtist: formData.originalArtist || undefined,
      audioUrl: formData.audioUrl,
      coverImageUrl: formData.coverImageUrl || "/music/covers/default.jpg",
      duration: formData.duration,
      lyrics,
      publishedAt: new Date().toISOString(),
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: formData.description || undefined,
      accent: formData.accent || undefined,
    };

    try {
      const response = await fetch("/api/music/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      });

      if (response.ok) {
        alert("Песня сохранена!");
        router.push(`/music/${song.slug}`);
      } else {
        alert("Ошибка сохранения!");
      }
    } catch (error) {
      console.error(error);
      alert("Ошибка сохранения!");
    }
  };

  return (
    <div className="admin-music">
      <div className="admin-music__container">
        <header className="admin-music__header">
          <h1 className="admin-music__title">🎵 Музыкальная студия</h1>
          <p className="admin-music__subtitle">
            {step === "form" ? "Шаг 1: Информация о песне" : "Шаг 2: Расстановка таймингов"}
          </p>
        </header>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="admin-music__form">
            <div className="admin-music__field">
              <label htmlFor="slug">Slug (для URL) *</label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="my-song"
                required
              />
              <small>Латиница, дефисы. Например: bohemian-rhapsody</small>
            </div>

            <div className="admin-music__field">
              <label htmlFor="title">Название песни *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Богемская рапсодия"
                required
              />
            </div>

            <div className="admin-music__field">
              <label htmlFor="artist">Исполнитель *</label>
              <input
                id="artist"
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                placeholder="Queen"
                required
              />
            </div>

            <div className="admin-music__field">
              <label htmlFor="originalArtist">Оригинальный исполнитель (если кавер)</label>
              <input
                id="originalArtist"
                type="text"
                value={formData.originalArtist}
                onChange={(e) => setFormData({ ...formData, originalArtist: e.target.value })}
                placeholder="Оригинальный исполнитель"
              />
            </div>

            <div className="admin-music__field">
              <label htmlFor="audioUrl">Путь к аудио файлу *</label>
              <input
                id="audioUrl"
                type="text"
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                placeholder="/music/songs/my-song.mp3"
                required
              />
              <small>Загрузите MP3 в /public/music/songs/</small>
            </div>

            <div className="admin-music__field">
              <label htmlFor="coverImageUrl">Путь к обложке</label>
              <input
                id="coverImageUrl"
                type="text"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="/music/covers/my-song.jpg"
              />
              <small>Загрузите изображение в /public/music/covers/</small>
            </div>

            <div className="admin-music__field">
              <label htmlFor="duration">Длительность (секунды)</label>
              <input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                placeholder="240"
              />
              <small>Оставьте 0 для автоопределения</small>
            </div>

            <div className="admin-music__field">
              <label htmlFor="description">Описание</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Перевод песни..."
                rows={3}
              />
            </div>

            <div className="admin-music__field">
              <label htmlFor="accent">Акцентный цвет</label>
              <input
                id="accent"
                type="color"
                value={formData.accent}
                onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
              />
            </div>

            <div className="admin-music__field">
              <label htmlFor="tags">Теги (через запятую)</label>
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="рок, классика"
              />
            </div>

            <button type="submit" className="admin-music__submit">
              Далее: Расстановка таймингов →
            </button>
          </form>
        )}

        {step === "timing" && (
          <>
            <button
              onClick={() => setStep("form")}
              className="admin-music__back"
            >
              ← Назад к форме
            </button>
            <TimingLaboratory audioUrl={formData.audioUrl} onSave={handleSaveLyrics} />
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminMusicPage() {
  return (
    <AdminGuard>
      <AdminMusicContent />
    </AdminGuard>
  );
}
