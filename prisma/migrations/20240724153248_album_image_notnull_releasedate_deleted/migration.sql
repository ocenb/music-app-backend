/*
  Warnings:

  - You are about to drop the column `release_date` on the `Album` table. All the data in the column will be lost.
  - Made the column `image` on table `Playlist` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Album" DROP COLUMN "release_date";

-- AlterTable
ALTER TABLE "Playlist" ALTER COLUMN "image" SET NOT NULL;
