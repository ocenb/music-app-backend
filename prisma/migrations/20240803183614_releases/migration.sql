/*
  Warnings:

  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `album_track` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_liked_album` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_user_id_fkey";

-- DropForeignKey
ALTER TABLE "album_track" DROP CONSTRAINT "album_track_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "album_track" DROP CONSTRAINT "album_track_track_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_album" DROP CONSTRAINT "user_liked_album_album_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_album" DROP CONSTRAINT "user_liked_album_user_id_fkey";

-- DropTable
DROP TABLE "Album";

-- DropTable
DROP TABLE "album_track";

-- DropTable
DROP TABLE "user_liked_album";

-- CreateTable
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_track" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "release_track_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateTable
CREATE TABLE "user_liked_release" (
    "user_id" INTEGER NOT NULL,
    "release_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_liked_release_pkey" PRIMARY KEY ("user_id","release_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Release_user_id_title_key" ON "Release"("user_id", "title");

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_track" ADD CONSTRAINT "release_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_track" ADD CONSTRAINT "release_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_release" ADD CONSTRAINT "user_liked_release_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_release" ADD CONSTRAINT "user_liked_release_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
