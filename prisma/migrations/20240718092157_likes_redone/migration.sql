/*
  Warnings:

  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikesTracks` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `album_id` on table `Track` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_user_id_fkey";

-- DropForeignKey
ALTER TABLE "LikesTracks" DROP CONSTRAINT "LikesTracks_like_id_fkey";

-- DropForeignKey
ALTER TABLE "LikesTracks" DROP CONSTRAINT "LikesTracks_track_id_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_album_id_fkey";

-- AlterTable
ALTER TABLE "Track" ALTER COLUMN "album_id" SET NOT NULL;

-- DropTable
DROP TABLE "Like";

-- DropTable
DROP TABLE "LikesTracks";

-- CreateTable
CREATE TABLE "UsersLikedTracks" (
    "user_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersLikedTracks_pkey" PRIMARY KEY ("user_id","track_id")
);

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersLikedTracks" ADD CONSTRAINT "UsersLikedTracks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersLikedTracks" ADD CONSTRAINT "UsersLikedTracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
