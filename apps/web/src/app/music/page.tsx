import { getAllSongs } from "@/lib/music";
import { MusicCatalog } from "@/components/music-catalog";
import { Container } from "@/components/container";

export const metadata = {
  title: "Музыка — Oi/Notes",
  description: "Переводы песен с синхронизированными текстами",
};

export default async function MusicPage() {
  const songs = await getAllSongs();

  return (
    <Container as="main" className="music-page">
      <header className="music-page__header">
        <h1 className="music-page__title">Музыка</h1>
        <p className="music-page__subtitle">
          Переводы песен с синхронизированными текстами
        </p>
      </header>

      <MusicCatalog songs={songs} />
    </Container>
  );
}
