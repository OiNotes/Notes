import Link from "next/link";
import type { Song } from "@/lib/music-schema";

type MusicCatalogProps = {
  songs: Song[];
};

export function MusicCatalog({ songs }: MusicCatalogProps) {
  if (songs.length === 0) {
    return (
      <div className="music-catalog__empty">
        <p>Пока нет ни одной песни...</p>
      </div>
    );
  }

  return (
    <div className="music-catalog">
      <div className="music-catalog__grid">
        {songs.map((song) => (
          <Link
            key={song.id}
            href={`/music/${song.slug}`}
            className="music-catalog__card"
            style={
              {
                "--card-accent": song.accent || "var(--color-accent-start)",
              } as React.CSSProperties
            }
          >
            {/* Обложка */}
            <div className="music-catalog__card-cover">
              <img src={song.coverImageUrl} alt="" />
              <div className="music-catalog__card-overlay">
                <svg
                  className="music-catalog__play-icon"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="12" fill="currentColor" fillOpacity="0.95" />
                  <path d="M10 8.14v7.72L16 12L10 8.14z" fill="#06070c" />
                </svg>
              </div>
            </div>

            {/* Инфо */}
            <div className="music-catalog__card-info">
              <h3 className="music-catalog__card-title">{song.title}</h3>
              <p className="music-catalog__card-artist">{song.artist}</p>
              {song.description && (
                <p className="music-catalog__card-desc">{song.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
