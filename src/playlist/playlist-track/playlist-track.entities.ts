import { ApiDate } from 'src/decorators/api.decorator';
import { Track } from 'src/track/track.entities';

export class TrackInPlaylist {
	position: number;
	track: Track;
	@ApiDate()
	addedAt: string;
}

export class PlaylistTrackRelation {
	position: number;
	trackId: number;
	playlistId: number;
	@ApiDate()
	addedAt: string;
}
