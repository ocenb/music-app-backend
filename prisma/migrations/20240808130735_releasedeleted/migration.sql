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
