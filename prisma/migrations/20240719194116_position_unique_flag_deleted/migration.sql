/*
  Warnings:

  - You are about to drop the `ListeningHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistsTracks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsersLikedTracks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ListeningHistory" DROP CONSTRAINT "ListeningHistory_track_id_fkey";

-- DropForeignKey
ALTER TABLE "ListeningHistory" DROP CONSTRAINT "ListeningHistory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistsTracks" DROP CONSTRAINT "PlaylistsTracks_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistsTracks" DROP CONSTRAINT "PlaylistsTracks_track_id_fkey";

-- DropForeignKey
ALTER TABLE "UsersLikedTracks" DROP CONSTRAINT "UsersLikedTracks_track_id_fkey";

-- DropForeignKey
ALTER TABLE "UsersLikedTracks" DROP CONSTRAINT "UsersLikedTracks_user_id_fkey";

-- DropTable
DROP TABLE "ListeningHistory";

-- DropTable
DROP TABLE "PlaylistsTracks";

-- DropTable
DROP TABLE "UsersLikedTracks";

-- CreateTable
CREATE TABLE "playlists_tracks" (
    "playlist_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlists_tracks_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateTable
CREATE TABLE "users_liked_tracks" (
    "user_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_liked_tracks_pkey" PRIMARY KEY ("user_id","track_id")
);

-- CreateTable
CREATE TABLE "listening_history" (
    "user_id" INTEGER NOT NULL,
    "track_id" INTEGER NOT NULL,
    "played_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listening_history_pkey" PRIMARY KEY ("user_id","track_id")
);

-- AddForeignKey
ALTER TABLE "playlists_tracks" ADD CONSTRAINT "playlists_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists_tracks" ADD CONSTRAINT "playlists_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_liked_tracks" ADD CONSTRAINT "users_liked_tracks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_liked_tracks" ADD CONSTRAINT "users_liked_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
