-- CreateTable
CREATE TABLE "release" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_track" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "release_track_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateTable
CREATE TABLE "user_liked_release" (
    "user_id" INTEGER NOT NULL,
    "release_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_liked_release_pkey" PRIMARY KEY ("user_id","release_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "release_user_id_title_key" ON "release"("user_id", "title");

-- AddForeignKey
ALTER TABLE "release" ADD CONSTRAINT "release_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_track" ADD CONSTRAINT "release_track_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_track" ADD CONSTRAINT "release_track_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_release" ADD CONSTRAINT "user_liked_release_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_release" ADD CONSTRAINT "user_liked_release_release_id_fkey" FOREIGN KEY ("release_id") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE CASCADE;
