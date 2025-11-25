import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomBytes } from 'crypto';

// POST /api/upload - загрузка аудио файла в Vercel Blob
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'File must be an audio file' },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const ext = file.name.split('.').pop();
    const filename = `audio/${randomBytes(16).toString('hex')}.${ext}`;

    // Загружаем в Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Возвращаем URL из Vercel Blob
    return NextResponse.json({ audioPath: blob.url }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload file', details: errorMessage },
      { status: 500 }
    );
  }
}
