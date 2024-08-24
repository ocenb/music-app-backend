-- DropForeignKey
ALTER TABLE "listening_history" DROP CONSTRAINT "listening_history_track_id_fkey";

-- DropForeignKey
ALTER TABLE "users_liked_tracks" DROP CONSTRAINT "users_liked_tracks_track_id_fkey";

-- CreateTable
CREATE TABLE "users_saved_playlists" (
    "user_id" INTEGER NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_saved_playlists_pkey" PRIMARY KEY ("user_id","playlist_id")
);

-- AddForeignKey
ALTER TABLE "users_liked_tracks" ADD CONSTRAINT "users_liked_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_saved_playlists" ADD CONSTRAINT "users_saved_playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_saved_playlists" ADD CONSTRAINT "users_saved_playlists_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
