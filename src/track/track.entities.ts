import { ApiDate } from 'src/decorators/api.decorator';

export class Track {
	id: number;
	changeableId: string;
	title: string;
	duration: number;
	plays: number;
	audio: string;
	image: string;
	userId: number;
	@ApiDate()
	createdAt: string;
	@ApiDate()
	updatedAt: string;
}

export class TrackWithUsername extends Track {
	user: { username: string };
}

export class TracksCreatedCount {
	count: number;
}
