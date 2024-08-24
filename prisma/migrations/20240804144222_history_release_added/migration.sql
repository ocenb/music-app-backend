/*
  Warnings:

  - Added the required column `release_id` to the `listening_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "listening_history" ADD COLUMN     "release_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
