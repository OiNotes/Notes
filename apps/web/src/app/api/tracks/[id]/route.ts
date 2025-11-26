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
      audioSrc: track.audioPath,
      category: track.category,
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
    const { artist, title, category } = await request.json();

    const track = await prisma.track.update({
      where: { id },
      data: {
        artist,
        title,
        ...(category && { category })
      },
      include: {
        lyrics: { orderBy: { order: 'asc' } },
        strobeMarkers: { orderBy: { time: 'asc' } }
      }
    });

    const formattedTrack = {
      id: track.id,
      artist: track.artist,
      title: track.title,
      color: track.color,
      audioSrc: track.audioPath,
      category: track.category,
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
