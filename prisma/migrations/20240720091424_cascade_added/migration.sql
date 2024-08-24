-- DropForeignKey
ALTER TABLE "playlists_tracks" DROP CONSTRAINT "playlists_tracks_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists_tracks" DROP CONSTRAINT "playlists_tracks_track_id_fkey";

-- AddForeignKey
ALTER TABLE "playlists_tracks" ADD CONSTRAINT "playlists_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists_tracks" ADD CONSTRAINT "playlists_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
