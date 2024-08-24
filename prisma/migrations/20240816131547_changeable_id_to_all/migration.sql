/*
  Warnings:

  - A unique constraint covering the columns `[user_id,changeableId]` on the table `album` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,changeableId]` on the table `playlist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,changeableId]` on the table `track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `changeableId` to the `album` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changeableId` to the `playlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "track_changeableId_key";

-- AlterTable
ALTER TABLE "album" ADD COLUMN     "changeableId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "playlist" ADD COLUMN     "changeableId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "album_user_id_changeableId_key" ON "album"("user_id", "changeableId");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_user_id_changeableId_key" ON "playlist"("user_id", "changeableId");

-- CreateIndex
CREATE UNIQUE INDEX "track_user_id_changeableId_key" ON "track"("user_id", "changeableId");
