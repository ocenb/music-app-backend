/*
  Warnings:

  - You are about to drop the column `release_id` on the `listening_history` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "listening_history" DROP CONSTRAINT "listening_history_release_id_fkey";

-- AlterTable
ALTER TABLE "listening_history" DROP COLUMN "release_id";
