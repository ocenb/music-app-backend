/*
  Warnings:

  - You are about to drop the `release` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `release_track` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_liked_release` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "release" DROP CONSTRAINT "release_user_id_fkey";

-- DropForeignKey
ALTER TABLE "release_track" DROP CONSTRAINT "release_track_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "release_track" DROP CONSTRAINT "release_track_track_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_release" DROP CONSTRAINT "user_liked_release_release_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_release" DROP CONSTRAINT "user_liked_release_user_id_fkey";

-- DropTable
DROP TABLE "release";

-- DropTable
DROP TABLE "release_track";

-- DropTable
DROP TABLE "user_liked_release";

-- CreateTable
CREATE TABLE "album" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_liked_album" (
    "user_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_liked_album_pkey" PRIMARY KEY ("user_id","album_id")
);

-- CreateTable
CREATE TABLE "album_track" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_track_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "album_user_id_title_key" ON "album"("user_id", "title");

-- AddForeignKey
ALTER TABLE "album" ADD CONSTRAINT "album_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_album" ADD CONSTRAINT "user_liked_album_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_album" ADD CONSTRAINT "user_liked_album_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_track" ADD CONSTRAINT "album_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_track" ADD CONSTRAINT "album_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
