import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file extension
        if (!pathname.match(/\.(mp3|m4a|wav|ogg|flac|aac|webm|mp4)$/i)) {
          throw new Error('Invalid file type');
        }
        return {
          // Remove allowedContentTypes restriction - causes 403 errors due to content-type mismatches
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB limit
          validUntil: Date.now() + 60 * 60 * 1000, // 1 hour validity for slow uploads
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
