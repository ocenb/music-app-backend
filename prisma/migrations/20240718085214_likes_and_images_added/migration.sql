/*
  Warnings:

  - You are about to drop the column `artist_id` on the `Album` table. All the data in the column will be lost.
  - You are about to drop the column `artist_id` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the `Artist` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `image` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_artist_id_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_album_id_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_artist_id_fkey";

-- AlterTable
ALTER TABLE "Album" DROP COLUMN "artist_id",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "artist_id",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "album_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT;

-- DropTable
DROP TABLE "Artist";

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikesTracks" (
    "like_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikesTracks_pkey" PRIMARY KEY ("like_id","track_id")
);

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesTracks" ADD CONSTRAINT "LikesTracks_like_id_fkey" FOREIGN KEY ("like_id") REFERENCES "Like"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesTracks" ADD CONSTRAINT "LikesTracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
