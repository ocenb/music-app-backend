import { ApiDate } from 'src/decorators/api.decorator';

export class UserWithoutFollowingCount {
	id: number;
	username: string;
	image: string;
	_count: { followers: number };
}

export class UserPublic extends UserWithoutFollowingCount {
	_count: { followers: number; following: number };
}

export class UserPrivate extends UserWithoutFollowingCount {
	email: string;
	@ApiDate()
	createdAt: string;
	@ApiDate()
	updatedAt: string;
}
