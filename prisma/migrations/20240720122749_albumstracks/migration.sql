/*
  Warnings:

  - You are about to drop the column `album_id` on the `Track` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_album_id_fkey";

-- DropIndex
DROP INDEX "Track_album_id_title_key";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "album_id";

-- CreateTable
CREATE TABLE "albums_tracks" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "albums_tracks_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- AddForeignKey
ALTER TABLE "albums_tracks" ADD CONSTRAINT "albums_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums_tracks" ADD CONSTRAINT "albums_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
