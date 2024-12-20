import { AlbumType } from './album.dto';
import { ApiDate } from 'src/decorators/api.decorator';

export class Album {
	id: number;
	title: string;
	changeableId: string;
	image: string;
	type: AlbumType;
	userId: number;
	username: string;
	@ApiDate()
	createdAt: string;
	@ApiDate()
	updatedAt: string;
}

export class AlbumFull extends Album {
	_count: { likes: number; tracks: number };
}
