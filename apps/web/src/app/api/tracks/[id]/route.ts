import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TrackUpdateSchema } from '@/lib/validators';
import { log, warn } from '@/lib/logger';
import fs from 'fs/promises';
import path from 'path';

// GET /api/tracks/[id] - получить один трек
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const track = await prisma.track.findUnique({
      where: { id },
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

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    const formattedTrack = {
      id: track.id,
      artist: track.artist,
      title: track.title,
      color: track.color,
      coverUrl: track.coverUrl,
      audioSrc: track.audioPath,
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

    return NextResponse.json(formattedTrack, {
      headers: {
        // Short edge caching to reduce repeated lookups for the same track.
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30'
      }
    });
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    );
  }
}

// PUT /api/tracks/[id] - обновить трек
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = TrackUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { artist, title, category, coverUrl, lyrics, strobeMarkers } = parsed.data;

    // Transaction to update track and replace lyrics/markers
    const track = await prisma.$transaction(async (tx) => {
        // 1. Update core track details
        await tx.track.update({
            where: { id },
            data: {
                artist,
                title,
                ...(category && { category }),
                ...(coverUrl !== undefined && { coverUrl })
            }
        });

        // 2. If lyrics provided, replace them
        if (lyrics) {
            await tx.lyric.deleteMany({ where: { trackId: id } });
            await tx.lyric.createMany({
                data: lyrics.map((l, index: number) => ({
                    trackId: id,
                    original: l.original || '',
                    translation: l.translation || '',
                    time: l.time || 0,
                    isSynced: l.isSynced || false,
                    isAppend: l.isAppend || false,
                    order: index
                }))
            });
        }

        // 3. If strobeMarkers provided, replace them
        if (strobeMarkers) {
            await tx.strobeMarker.deleteMany({ where: { trackId: id } });
            await tx.strobeMarker.createMany({
                data: strobeMarkers.map((m) => ({
                    trackId: id,
                    time: m.time || 0
                }))
            });
        }

        return tx.track.findUnique({
            where: { id },
            include: {
                lyrics: { orderBy: { order: 'asc' } },
                strobeMarkers: { orderBy: { time: 'asc' } }
            }
        });
    });

    if (!track) throw new Error("Track not found after update");

    const formattedTrack = {
      id: track.id,
      artist: track.artist,
      title: track.title,
      color: track.color,
      coverUrl: track.coverUrl,
      audioSrc: track.audioPath,
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

    return NextResponse.json(formattedTrack);
  } catch (error) {
    console.error('Error updating track:', error);
    return NextResponse.json(
      { error: 'Failed to update track' },
      { status: 500 }
    );
  }
}

// DELETE /api/tracks/[id] - удалить трек
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Получаем трек перед удалением, чтобы удалить файл
    const track = await prisma.track.findUnique({
      where: { id }
    });

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Удаляем трек из БД (каскадно удалятся и lyrics)
    await prisma.track.delete({
      where: { id }
    });

    // Пытаемся удалить аудио файл
    try {
      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
      const audioFilePath = path.resolve(process.cwd(), 'public', track.audioPath);

      // Validate path is within uploads directory to prevent path traversal
      if (!audioFilePath.startsWith(uploadsDir + path.sep) && audioFilePath !== uploadsDir) {
        warn('Attempted path traversal in audio file deletion:', track.audioPath);
      } else {
        await fs.unlink(audioFilePath);
      }
    } catch (fileError) {
      warn('Failed to delete audio file:', fileError);
      // Не критично, файл может быть уже удалён
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting track:', error);
    return NextResponse.json(
      { error: 'Failed to delete track' },
      { status: 500 }
    );
  }
}
