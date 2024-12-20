/*
  Warnings:

  - A unique constraint covering the columns `[username,changeableId]` on the table `album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,title]` on the table `album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,changeableId]` on the table `playlist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,title]` on the table `playlist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,changeableId]` on the table `track` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,title]` on the table `track` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `track` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "album" DROP CONSTRAINT "album_user_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist" DROP CONSTRAINT "playlist_user_id_fkey";

-- DropForeignKey
ALTER TABLE "track" DROP CONSTRAINT "track_user_id_fkey";

-- AlterTable
ALTER TABLE "album" ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "playlist" ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "track" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "album_username_changeableId_key" ON "album"("username", "changeableId");

-- CreateIndex
CREATE UNIQUE INDEX "album_username_title_key" ON "album"("username", "title");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_username_changeableId_key" ON "playlist"("username", "changeableId");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_username_title_key" ON "playlist"("username", "title");

-- CreateIndex
CREATE UNIQUE INDEX "track_username_changeableId_key" ON "track"("username", "changeableId");

-- CreateIndex
CREATE UNIQUE INDEX "track_username_title_key" ON "track"("username", "title");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_username_key" ON "user"("id", "username");

-- AddForeignKey
ALTER TABLE "track" ADD CONSTRAINT "track_user_id_username_fkey" FOREIGN KEY ("user_id", "username") REFERENCES "user"("id", "username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album" ADD CONSTRAINT "album_user_id_username_fkey" FOREIGN KEY ("user_id", "username") REFERENCES "user"("id", "username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_user_id_username_fkey" FOREIGN KEY ("user_id", "username") REFERENCES "user"("id", "username") ON DELETE CASCADE ON UPDATE CASCADE;
