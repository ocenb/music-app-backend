/*
  Warnings:

  - You are about to drop the column `file` on the `Track` table. All the data in the column will be lost.
  - Added the required column `audio` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "file",
ADD COLUMN     "audio" TEXT NOT NULL;
