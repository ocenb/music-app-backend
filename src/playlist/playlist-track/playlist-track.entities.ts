import { ApiDate } from 'src/decorators/api.decorator';
import { TrackWithLiked } from 'src/track/track.entities';

export class TrackInPlaylist {
	position: number;
	track: TrackWithLiked;
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
