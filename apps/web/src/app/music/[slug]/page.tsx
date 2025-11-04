import { notFound } from "next/navigation";
import { getAllSongs, getSongBySlug } from "@/lib/music";
import { MusicPlayer } from "@/components/music-player";
import { Container } from "@/components/container";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const songs = await getAllSongs();
  return songs.map((song) => ({
    slug: song.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) {
    return {
      title: "Песня не найдена — Oi/Notes",
    };
  }

  return {
    title: `${song.title} — ${song.artist} — Oi/Notes`,
    description: song.description || `Перевод песни ${song.title}`,
    openGraph: {
      images: [song.coverImageUrl],
    },
  };
}

export default async function SongPage({ params }: PageProps) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) {
    notFound();
  }

  return (
    <Container as="main" className="song-page">
      <MusicPlayer song={song} />
    </Container>
  );
}
