import { ApiDate } from 'src/decorators/api.decorator';
import { TrackWithLiked } from 'src/track/track.entities';

export class TrackInAlbum {
	position: number;
	track: TrackWithLiked;
	@ApiDate()
	addedAt: string;
}
