/*
  Warnings:

  - A unique constraint covering the columns `[playlist_id,position]` on the table `PlaylistsTracks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `position` to the `PlaylistsTracks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlaylistsTracks" ADD COLUMN     "position" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "plays" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistsTracks_playlist_id_position_key" ON "PlaylistsTracks"("playlist_id", "position");
