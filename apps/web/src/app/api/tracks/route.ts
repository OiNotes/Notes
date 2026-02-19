import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TrackCreateSchema } from '@/lib/validators';
import { log } from '@/lib/logger';
import crypto from 'crypto';

// GET /api/tracks - получить все треки (без lyrics, с пагинацией)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 100);

    log('[API] Fetching tracks, cursor:', cursor, 'limit:', limit);

    // Build cursor-based pagination query
    const tracks = await prisma.track.findMany({
      take: limit + 1, // fetch one extra to determine if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        artist: true,
        title: true,
        color: true,
        audioPath: true,
        coverUrl: true,
        category: true,
        updatedAt: true,
        _count: {
          select: { lyrics: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Determine next cursor
    let nextCursor: string | null = null;
    if (tracks.length > limit) {
      const nextItem = tracks.pop();
      nextCursor = nextItem!.id;
    }

    log('[API] Found tracks:', tracks.length);

    // Compute ETag from the most recent updatedAt + count
    const mostRecentUpdatedAt = tracks.length > 0
      ? tracks.reduce((latest, t) => t.updatedAt > latest ? t.updatedAt : latest, tracks[0].updatedAt)
      : new Date(0);
    const etagSource = `${mostRecentUpdatedAt.toISOString()}-${tracks.length}-${cursor || 'start'}`;
    const etag = `"${crypto.createHash('md5').update(etagSource).digest('hex')}"`;

    // Check If-None-Match
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { ETag: etag }
      });
    }

    // Format response — no lyrics, add lyricsCount
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      artist: track.artist,
      title: track.title,
      color: track.color,
      audioSrc: track.audioPath,
      coverUrl: track.coverUrl,
      category: track.category,
      lyricsCount: track._count.lyrics
    }));

    const response = NextResponse.json({ tracks: formattedTracks, nextCursor });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    response.headers.set('ETag', etag);
    return response;
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
  log('[API] POST /api/tracks request received');
  try {
    const body = await request.json();
    const parsed = TrackCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { artist, title, color, audioPath, coverUrl, lyrics, strobeMarkers, category } = parsed.data;

    // Создаем трек с текстами в одной транзакции
    const track = await prisma.track.create({
      data: {
        artist,
        title,
        color,
        audioPath,
        coverUrl: coverUrl || null,
        category: category || 'yours',
        lyrics: {
          create: lyrics?.map((lyric, index: number) => ({
            original: lyric.original || '',
            translation: lyric.translation || '',
            time: lyric.time || 0,
            isSynced: lyric.isSynced || false,
            isAppend: lyric.isAppend || false,
            order: index
          })) || []
        },
        strobeMarkers: {
          create: strobeMarkers?.map((marker) => ({
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
      coverUrl: track.coverUrl,
      category: track.category,
      lyrics: track.lyrics.map(lyric => ({
        id: lyric.id,
        original: lyric.original,
        translation: lyric.translation,
        time: lyric.time,
        isSynced: lyric.isSynced,
        isAppend: lyric.isAppend
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
      {
        error: 'Failed to create track',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
