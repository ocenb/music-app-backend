/*
  Warnings:

  - A unique constraint covering the columns `[changeableId]` on the table `track` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "track_changeableId_key" ON "track"("changeableId");
