/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `verification_token_expires_at` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "verification_token_expires_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "verification_token" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "user_verification_token_key" ON "user"("verification_token");
