/*
  Warnings:

  - You are about to drop the `Playlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Release` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Track` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Release" DROP CONSTRAINT "Release_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_user_id_fkey";

-- DropForeignKey
ALTER TABLE "listening_history" DROP CONSTRAINT "listening_history_release_id_fkey";

-- DropForeignKey
ALTER TABLE "listening_history" DROP CONSTRAINT "listening_history_track_id_fkey";

-- DropForeignKey
ALTER TABLE "listening_history" DROP CONSTRAINT "listening_history_user_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist_track" DROP CONSTRAINT "playlist_track_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist_track" DROP CONSTRAINT "playlist_track_track_id_fkey";

-- DropForeignKey
ALTER TABLE "release_track" DROP CONSTRAINT "release_track_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "release_track" DROP CONSTRAINT "release_track_track_id_fkey";

-- DropForeignKey
ALTER TABLE "user_follower" DROP CONSTRAINT "user_follower_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "user_follower" DROP CONSTRAINT "user_follower_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_release" DROP CONSTRAINT "user_liked_release_release_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_release" DROP CONSTRAINT "user_liked_release_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_track" DROP CONSTRAINT "user_liked_track_track_id_fkey";

-- DropForeignKey
ALTER TABLE "user_liked_track" DROP CONSTRAINT "user_liked_track_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_saved_playlist" DROP CONSTRAINT "user_saved_playlist_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "user_saved_playlist" DROP CONSTRAINT "user_saved_playlist_user_id_fkey";

-- DropTable
DROP TABLE "Playlist";

-- DropTable
DROP TABLE "Release";

-- DropTable
DROP TABLE "Token";

-- DropTable
DROP TABLE "Track";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT 'default.jpg',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "plays" INTEGER NOT NULL DEFAULT 0,
    "audio" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT 'default.jpg',
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "track_user_id_title_key" ON "track"("user_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "release_user_id_title_key" ON "release"("user_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_user_id_title_key" ON "playlist"("user_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "token_refresh_token_key" ON "token"("refresh_token");

-- AddForeignKey
ALTER TABLE "track" ADD CONSTRAINT "track_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release" ADD CONSTRAINT "release_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follower" ADD CONSTRAINT "user_follower_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follower" ADD CONSTRAINT "user_follower_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_track" ADD CONSTRAINT "playlist_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_track" ADD CONSTRAINT "playlist_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_track" ADD CONSTRAINT "release_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_track" ADD CONSTRAINT "release_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_track" ADD CONSTRAINT "user_liked_track_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_track" ADD CONSTRAINT "user_liked_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_release" ADD CONSTRAINT "user_liked_release_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_release" ADD CONSTRAINT "user_liked_release_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_playlist" ADD CONSTRAINT "user_saved_playlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_playlist" ADD CONSTRAINT "user_saved_playlist_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
