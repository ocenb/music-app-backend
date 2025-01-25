/*
  Warnings:

  - The primary key for the `album_track` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `playlist_id` on the `album_track` table. All the data in the column will be lost.
  - Added the required column `album_id` to the `album_track` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "album_track" DROP CONSTRAINT "album_track_playlist_id_fkey";

-- AlterTable
ALTER TABLE "album_track" DROP CONSTRAINT "album_track_pkey",
DROP COLUMN "playlist_id",
ADD COLUMN     "album_id" INTEGER NOT NULL,
ADD CONSTRAINT "album_track_pkey" PRIMARY KEY ("album_id", "track_id");

-- AddForeignKey
ALTER TABLE "album_track" ADD CONSTRAINT "album_track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
