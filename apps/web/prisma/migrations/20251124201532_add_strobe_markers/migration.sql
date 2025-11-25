-- CreateTable
CREATE TABLE "strobe_markers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trackId" TEXT NOT NULL,
    "time" REAL NOT NULL,
    CONSTRAINT "strobe_markers_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "strobe_markers_trackId_idx" ON "strobe_markers"("trackId");
