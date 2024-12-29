/*
  Warnings:

  - You are about to drop the column `user_id` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "user_id";

-- CreateTable
CREATE TABLE "user_notification" (
    "user_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,

    CONSTRAINT "user_notification_pkey" PRIMARY KEY ("user_id","notification_id")
);

-- AddForeignKey
ALTER TABLE "user_notification" ADD CONSTRAINT "user_notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification" ADD CONSTRAINT "user_notification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
