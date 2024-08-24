/*
  Warnings:

  - A unique constraint covering the columns `[user_id,title]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Playlist_user_id_title_key" ON "Playlist"("user_id", "title");
