import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

// POST /api/upload - загрузка аудио файла
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
    const fileExtension = path.extname(file.name);
    const randomName = randomBytes(16).toString('hex');
    const fileName = `${randomName}${fileExtension}`;

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Возвращаем относительный путь для хранения в БД
    const audioPath = `/uploads/audio/${fileName}`;

    return NextResponse.json({ audioPath }, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
