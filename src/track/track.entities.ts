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
	username: string;
	@ApiDate()
	createdAt: string;
	@ApiDate()
	updatedAt: string;
}

class AddedAt {
	addedAt: string;
}

export class TrackWithLiked extends Track {
	likes: AddedAt[];
}

export class TracksCreatedCount {
	count: number;
}

export class TracksIds {
	prevIds: number[];
	nextIds: number[];
}
