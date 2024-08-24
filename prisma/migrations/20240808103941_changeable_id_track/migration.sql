/*
  Warnings:

  - Added the required column `changeableId` to the `track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "track" ADD COLUMN     "changeableId" TEXT NOT NULL;
