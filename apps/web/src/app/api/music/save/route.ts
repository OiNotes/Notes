import { NextResponse } from "next/server";
import { saveSong } from "@/lib/music-server";
import { songSchema } from "@/lib/music-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Валидация через Zod
    const song = songSchema.parse(body);

    // Сохранение в файл
    await saveSong(song);

    return NextResponse.json({ success: true, slug: song.slug });
  } catch (error) {
    console.error("Error saving song:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save song" },
      { status: 500 }
    );
  }
}
