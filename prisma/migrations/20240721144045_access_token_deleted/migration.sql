/*
  Warnings:

  - You are about to drop the column `access_token` on the `Token` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Token_access_token_key";

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "access_token";
