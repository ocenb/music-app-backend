-- CreateTable
CREATE TABLE "users_followers" (
    "user_id" INTEGER NOT NULL,
    "follower_id" INTEGER NOT NULL,
    "followed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_followers_pkey" PRIMARY KEY ("user_id","follower_id")
);

-- AddForeignKey
ALTER TABLE "users_followers" ADD CONSTRAINT "users_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_followers" ADD CONSTRAINT "users_followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
