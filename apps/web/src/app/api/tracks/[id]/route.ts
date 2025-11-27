import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    return NextResponse.json(formattedTrack);
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
    const { artist, title, category, coverUrl, lyrics, strobeMarkers } = await request.json();

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
                data: lyrics.map((l: any, index: number) => ({
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

        // 3. If strobeMarkers provided, replace them (optional, usually handled by separate endpoint but good to have sync)
        // Actually strobeMarkers has its own endpoint logic usually, but let's allow full save here.
        if (strobeMarkers) {
            await tx.strobeMarker.deleteMany({ where: { trackId: id } });
            await tx.strobeMarker.createMany({
                data: strobeMarkers.map((m: any) => ({
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
      { 
        error: 'Failed to update track', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined 
      },
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
      const audioFilePath = path.join(process.cwd(), 'public', track.audioPath);
      await fs.unlink(audioFilePath);
    } catch (fileError) {
      console.warn('Failed to delete audio file:', fileError);
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
