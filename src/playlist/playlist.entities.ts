import { ApiDate } from 'src/decorators/api.decorator';

export class Playlist {
	id: number;
	title: string;
	changeableId: string;
	image: string;
	userId: number;
	username: string;
	@ApiDate()
	createdAt: string;
	@ApiDate()
	updatedAt: string;
}

export class PlaylistFull extends Playlist {
	_count: { savedByUsers: number; tracks: number };
}
