import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tracks - получить все треки с текстами
export async function GET() {
  try {
    console.log('[API] Fetching tracks from database...');
    const tracks = await prisma.track.findMany({
      include: {
        lyrics: {
          orderBy: {
            order: 'asc'
          }
        },
        strobeMarkers: {
          orderBy: {
            time: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('[API] Found tracks:', tracks.length);

    // Преобразуем audioPath в audioSrc для фронтенда
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      artist: track.artist,
      title: track.title,
      color: track.color,
      audioSrc: track.audioPath,
      lyrics: track.lyrics.map(lyric => ({
        id: lyric.id,
        original: lyric.original,
        translation: lyric.translation,
        time: lyric.time,
        isSynced: lyric.isSynced
      })),
      strobeMarkers: track.strobeMarkers.map(marker => ({
        id: marker.id,
        time: marker.time
      }))
    }));

    return NextResponse.json(formattedTracks);
  } catch (error) {
    console.error('[API] Error fetching tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/tracks - создать новый трек
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { artist, title, color, audioPath, lyrics, strobeMarkers } = body;

    // Валидация
    if (!artist || !title || !color || !audioPath) {
      return NextResponse.json(
        { error: 'Missing required fields: artist, title, color, audioPath' },
        { status: 400 }
      );
    }

    // Создаем трек с текстами в одной транзакции
    const track = await prisma.track.create({
      data: {
        artist,
        title,
        color,
        audioPath,
        lyrics: {
          create: lyrics?.map((lyric: any, index: number) => ({
            original: lyric.original || '',
            translation: lyric.translation || '',
            time: lyric.time || 0,
            isSynced: lyric.isSynced || false,
            order: index
          })) || []
        },
        strobeMarkers: {
          create: strobeMarkers?.map((marker: any) => ({
            time: marker.time || 0
          })) || []
        }
      },
      include: {
        lyrics: {
          orderBy: {
            order: 'asc'
          }
        },
        strobeMarkers: {
          orderBy: {
            time: 'asc'
          }
        }
      }
    });

    // Форматируем ответ
    const formattedTrack = {
      id: track.id,
      artist: track.artist,
      title: track.title,
      color: track.color,
      audioSrc: track.audioPath,
      lyrics: track.lyrics.map(lyric => ({
        id: lyric.id,
        original: lyric.original,
        translation: lyric.translation,
        time: lyric.time,
        isSynced: lyric.isSynced
      })),
      strobeMarkers: track.strobeMarkers.map(marker => ({
        id: marker.id,
        time: marker.time
      }))
    };

    return NextResponse.json(formattedTrack, { status: 201 });
  } catch (error) {
    console.error('Error creating track:', error);
    return NextResponse.json(
      { error: 'Failed to create track' },
      { status: 500 }
    );
  }
}
