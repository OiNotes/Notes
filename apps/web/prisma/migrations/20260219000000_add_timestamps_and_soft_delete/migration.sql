-- Add compound index for category + createdAt queries
CREATE INDEX "tracks_category_createdAt_idx" ON "tracks"("category", "createdAt");

-- Float precision sufficient for audio timestamps (millisecond accuracy not required)

-- Add timestamps to lyrics
ALTER TABLE "lyrics" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "lyrics" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add createdAt to strobe_markers
ALTER TABLE "strobe_markers" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add soft delete to tracks
ALTER TABLE "tracks" ADD COLUMN "deletedAt" TIMESTAMP(3);
