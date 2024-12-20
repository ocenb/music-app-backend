import { TrackWithLiked } from 'src/track/track.entities';

export class ListeningHistoryTrack {
	track: TrackWithLiked;
}

export class ListeningHistoryRelation {
	id: string;
	userId: number;
	trackId: number;
	playedAt: string;
}
