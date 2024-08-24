/*
  Warnings:

  - You are about to drop the `albums_tracks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `playlists_tracks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_followers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_liked_tracks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_saved_playlists` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `image` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "albums_tracks" DROP CONSTRAINT "albums_tracks_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "albums_tracks" DROP CONSTRAINT "albums_tracks_track_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists_tracks" DROP CONSTRAINT "playlists_tracks_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists_tracks" DROP CONSTRAINT "playlists_tracks_track_id_fkey";

-- DropForeignKey
ALTER TABLE "users_followers" DROP CONSTRAINT "users_followers_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "users_followers" DROP CONSTRAINT "users_followers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users_liked_tracks" DROP CONSTRAINT "users_liked_tracks_track_id_fkey";

-- DropForeignKey
ALTER TABLE "users_liked_tracks" DROP CONSTRAINT "users_liked_tracks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users_saved_playlists" DROP CONSTRAINT "users_saved_playlists_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "users_saved_playlists" DROP CONSTRAINT "users_saved_playlists_user_id_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "image" SET NOT NULL,
ALTER COLUMN "image" SET DEFAULT 'default.jpg';

-- DropTable
DROP TABLE "albums_tracks";

-- DropTable
DROP TABLE "playlists_tracks";

-- DropTable
DROP TABLE "users_followers";

-- DropTable
DROP TABLE "users_liked_tracks";

-- DropTable
DROP TABLE "users_saved_playlists";

-- CreateTable
CREATE TABLE "user_follower" (
    "user_id" INTEGER NOT NULL,
    "follower_id" INTEGER NOT NULL,
    "followed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follower_pkey" PRIMARY KEY ("user_id","follower_id")
);

-- CreateTable
CREATE TABLE "playlist_track" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_track_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateTable
CREATE TABLE "album_track" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_track_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateTable
CREATE TABLE "user_liked_track" (
    "user_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_liked_track_pkey" PRIMARY KEY ("user_id","track_id")
);

-- CreateTable
CREATE TABLE "user_saved_playlist" (
    "user_id" INTEGER NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_saved_playlist_pkey" PRIMARY KEY ("user_id","playlist_id")
);

-- AddForeignKey
ALTER TABLE "user_follower" ADD CONSTRAINT "user_follower_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follower" ADD CONSTRAINT "user_follower_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_track" ADD CONSTRAINT "playlist_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_track" ADD CONSTRAINT "playlist_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_track" ADD CONSTRAINT "album_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_track" ADD CONSTRAINT "album_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_track" ADD CONSTRAINT "user_liked_track_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_track" ADD CONSTRAINT "user_liked_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_playlist" ADD CONSTRAINT "user_saved_playlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_playlist" ADD CONSTRAINT "user_saved_playlist_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
