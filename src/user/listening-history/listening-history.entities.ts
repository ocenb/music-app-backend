import { TrackWithUsername } from 'src/track/track.entities';

export class ListeningHistoryTrack {
	track: TrackWithUsername;
}

export class ListeningHistoryRelation {
	id: string;
	userId: number;
	trackId: number;
	playedAt: string;
}
