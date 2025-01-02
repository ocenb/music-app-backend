import { ApiDate } from 'src/decorators/api.decorator';
import { Track } from 'src/track/track.entities';

export class TrackInAlbum {
	position: number;
	track: Track;
	@ApiDate()
	addedAt: string;
}
