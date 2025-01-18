/*
  Warnings:

  - You are about to drop the column `isVerified` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "isVerified",
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "album_user_id_idx" ON "album"("user_id");

-- CreateIndex
CREATE INDEX "playlist_user_id_idx" ON "playlist"("user_id");

-- CreateIndex
CREATE INDEX "track_user_id_idx" ON "track"("user_id");
