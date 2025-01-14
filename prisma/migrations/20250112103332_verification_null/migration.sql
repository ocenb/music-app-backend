-- AlterTable
ALTER TABLE "user" ALTER COLUMN "verification_token" DROP NOT NULL,
ALTER COLUMN "verification_token_expires_at" DROP NOT NULL;
