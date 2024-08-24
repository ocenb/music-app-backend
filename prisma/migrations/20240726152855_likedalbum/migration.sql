-- CreateTable
CREATE TABLE "user_liked_album" (
    "user_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_liked_album_pkey" PRIMARY KEY ("user_id","album_id")
);

-- AddForeignKey
ALTER TABLE "user_liked_album" ADD CONSTRAINT "user_liked_album_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_album" ADD CONSTRAINT "user_liked_album_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
