import {
	ConflictException,
	forwardRef,
	Inject,
	Injectable
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from '../user.service';

@Injectable()
export class FollowService {
	constructor(
		private readonly prismaService: PrismaService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {}

	async getManyFollowersIds(userId: number) {
		return await this.prismaService.userFollower.findMany({
			where: { followingId: userId },
			select: {
				follower: {
					select: {
						id: true
					}
				}
			}
		});
	}

	async getManyFollowers(userId: number, take?: number) {
		return await this.prismaService.userFollower.findMany({
			where: { followingId: userId },
			orderBy: { followedAt: 'desc' },
			select: {
				follower: {
					select: {
						id: true,
						username: true,
						image: true,
						_count: { select: { followers: true } }
					}
				}
			},
			take
		});
	}

	async getManyFollowing(userId: number, take?: number) {
		return await this.prismaService.userFollower.findMany({
			where: { followerId: userId },
			orderBy: { followedAt: 'desc' },
			select: {
				following: {
					select: {
						id: true,
						username: true,
						image: true,
						_count: { select: { followers: true } }
					}
				}
			},
			take
		});
	}

	async check(userId: number, userToCheckId: number) {
		const follow = await this.getFollow(userId, userToCheckId);
		return follow ? true : false;
	}

	async follow(userId: number, userToFollowId: number) {
		await this.userService.validateUser(userToFollowId);
		const follow = await this.getFollow(userId, userToFollowId);
		if (follow) {
			throw new ConflictException('You are already following this user');
		}
		return await this.prismaService.userFollower.create({
			data: { followerId: userId, followingId: userToFollowId }
		});
	}

	async unfollow(userId: number, userToUnfollowId: number) {
		const follow = await this.getFollow(userId, userToUnfollowId);
		if (!follow) {
			throw new ConflictException('You are not following this user');
		}
		return await this.prismaService.userFollower.delete({
			where: {
				followingId_followerId: {
					followerId: userId,
					followingId: userToUnfollowId
				}
			}
		});
	}

	private async getFollow(followerId: number, followingId: number) {
		const follow = await this.prismaService.userFollower.findUnique({
			where: { followingId_followerId: { followerId, followingId } }
		});
		return follow;
	}
}
