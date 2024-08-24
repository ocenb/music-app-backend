/*
  Warnings:

  - You are about to drop the column `artistId` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Artist` table. All the data in the column will be lost.
  - The primary key for the `ListeningHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `playedAt` on the `ListeningHistory` table. All the data in the column will be lost.
  - You are about to drop the column `trackId` on the `ListeningHistory` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ListeningHistory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Playlist` table. All the data in the column will be lost.
  - The primary key for the `PlaylistsTracks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `addedAt` on the `PlaylistsTracks` table. All the data in the column will be lost.
  - You are about to drop the column `playlistId` on the `PlaylistsTracks` table. All the data in the column will be lost.
  - You are about to drop the column `trackId` on the `PlaylistsTracks` table. All the data in the column will be lost.
  - You are about to drop the column `albumId` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `artistId` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `artist_id` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `release_date` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Artist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `track_id` to the `ListeningHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `ListeningHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playlist_id` to the `PlaylistsTracks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `track_id` to the `PlaylistsTracks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `album_id` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artist_id` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_artistId_fkey";

-- DropForeignKey
ALTER TABLE "ListeningHistory" DROP CONSTRAINT "ListeningHistory_trackId_fkey";

-- DropForeignKey
ALTER TABLE "ListeningHistory" DROP CONSTRAINT "ListeningHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistsTracks" DROP CONSTRAINT "PlaylistsTracks_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistsTracks" DROP CONSTRAINT "PlaylistsTracks_trackId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_albumId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_artistId_fkey";

-- AlterTable
ALTER TABLE "Album" DROP COLUMN "artistId",
DROP COLUMN "createdAt",
DROP COLUMN "releaseDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "artist_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "release_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ListeningHistory" DROP CONSTRAINT "ListeningHistory_pkey",
DROP COLUMN "playedAt",
DROP COLUMN "trackId",
DROP COLUMN "userId",
ADD COLUMN     "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "track_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "ListeningHistory_pkey" PRIMARY KEY ("user_id", "track_id");

-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PlaylistsTracks" DROP CONSTRAINT "PlaylistsTracks_pkey",
DROP COLUMN "addedAt",
DROP COLUMN "playlistId",
DROP COLUMN "trackId",
ADD COLUMN     "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "playlist_id" INTEGER NOT NULL,
ADD COLUMN     "track_id" INTEGER NOT NULL,
ADD CONSTRAINT "PlaylistsTracks_pkey" PRIMARY KEY ("playlist_id", "track_id");

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "albumId",
DROP COLUMN "artistId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "album_id" INTEGER NOT NULL,
ADD COLUMN     "artist_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistsTracks" ADD CONSTRAINT "PlaylistsTracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistsTracks" ADD CONSTRAINT "PlaylistsTracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningHistory" ADD CONSTRAINT "ListeningHistory_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
