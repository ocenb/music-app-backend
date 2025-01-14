import { Album } from 'src/album/album.entities';
import { Track } from 'src/track/track.entities';
import { UserWithoutFollowingCount } from 'src/user/user.entities';

export class SearchResultUser {
	type: 'user';
	document: UserWithoutFollowingCount;
}

export class SearchResultAlbum {
	type: 'album';
	document: Album;
}

export class SearchResultTrack {
	type: 'track';
	document: Track;
}
