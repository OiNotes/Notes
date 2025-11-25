import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/tracks/[id]/strobe - обновить strobe markers для трека
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { strobeMarkers } = body;

    // Удаляем старые маркеры
    await prisma.strobeMarker.deleteMany({
      where: { trackId: id }
    });

    // Создаём новые маркеры
    if (strobeMarkers && strobeMarkers.length > 0) {
      await prisma.strobeMarker.createMany({
        data: strobeMarkers.map((marker: { time: number }) => ({
          trackId: id,
          time: marker.time
        }))
      });
    }

    // Возвращаем обновлённый трек
    const track = await prisma.track.findUnique({
      where: { id },
      include: {
        strobeMarkers: {
          orderBy: { time: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      strobeMarkers: track?.strobeMarkers || []
    });
  } catch (error) {
    console.error('Error updating strobe markers:', error);
    return NextResponse.json(
      { error: 'Failed to update strobe markers' },
      { status: 500 }
    );
  }
}
