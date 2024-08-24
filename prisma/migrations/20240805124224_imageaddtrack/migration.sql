/*
  Warnings:

  - You are about to drop the column `lastReleaseId` on the `Track` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "lastReleaseId",
ADD COLUMN     "image" TEXT NOT NULL DEFAULT 'default.jpg';
