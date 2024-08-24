import {
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Query
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Follower, Following } from './follow.entities';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Follows')
@Auth()
@Controller('user/:userId')
export class FollowController {
	constructor(private readonly followService: FollowService) {}

	@Get('followers')
	@ApiOperation({ summary: 'Gets user followers' })
	@ApiResponse({ status: 200, type: [Follower] })
	async getManyFollowers(
		@Param('userId', ParseIntPipe) userId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.followService.getManyFollowers(userId, take);
	}

	@Get('following')
	@ApiOperation({ summary: 'Gets those the user follows' })
	@ApiResponse({ status: 200, type: [Following] })
	async getManyFollowing(
		@Param('userId', ParseIntPipe) userId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.followService.getManyFollowing(userId, take);
	}

	@Get('check-follow')
	@ApiOperation({ summary: 'Checks if current user follows another user' })
	@ApiResponse({ status: 200, type: Boolean })
	async check(
		@User('id') userId: number,
		@Param('userId', ParseIntPipe) userToCheckId: number
	) {
		return await this.followService.check(userId, userToCheckId);
	}

	@Post('follow')
	@HttpCode(204)
	@ApiOperation({ summary: 'Follows user' })
	@ApiResponse({ status: 204 })
	async follow(
		@User('id') userId: number,
		@Param('userId', ParseIntPipe) userToFollowId: number
	) {
		return await this.followService.follow(userId, userToFollowId);
	}

	@Delete('unfollow')
	@HttpCode(204)
	@ApiOperation({ summary: 'Unfollows user' })
	@ApiResponse({ status: 204 })
	async unfollow(
		@User('id') userId: number,
		@Param('userId', ParseIntPipe) userToUnfollowId: number
	) {
		return await this.followService.unfollow(userId, userToUnfollowId);
	}
}
