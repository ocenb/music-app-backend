import { UserWithoutFollowingCount } from '../user.entities';

export class Follower {
	follower: UserWithoutFollowingCount;
}

export class Following {
	following: UserWithoutFollowingCount;
}
