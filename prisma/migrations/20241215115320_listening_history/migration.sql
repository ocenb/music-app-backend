/*
  Warnings:

  - The primary key for the `listening_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `listening_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "listening_history" DROP CONSTRAINT "listening_history_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "listening_history_pkey" PRIMARY KEY ("user_id", "track_id");
