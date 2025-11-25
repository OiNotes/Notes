import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file type
        if (!pathname.match(/\.(mp3|m4a|wav|ogg|flac|aac)$/i)) {
          throw new Error('Invalid file type');
        }
        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp4',
            'audio/x-m4a',
            'audio/wav',
            'audio/ogg',
            'audio/flac',
            'audio/aac',
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB limit
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload completed:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
