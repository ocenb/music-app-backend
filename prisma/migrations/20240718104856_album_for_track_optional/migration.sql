/*
  Warnings:

  - A unique constraint covering the columns `[user_id,title]` on the table `Album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,title]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[album_id,title]` on the table `Track` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_album_id_fkey";

-- AlterTable
ALTER TABLE "Track" ALTER COLUMN "album_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Album_user_id_title_key" ON "Album"("user_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Track_user_id_title_key" ON "Track"("user_id", "title");

-- CreateIndex
CREATE UNIQUE INDEX "Track_album_id_title_key" ON "Track"("album_id", "title");

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
