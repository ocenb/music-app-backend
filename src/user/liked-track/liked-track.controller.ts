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
import { LikedTrackService } from './liked-track.service';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LikedTrack } from './liked-track.entities';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Liked tracks')
@Auth()
@Controller('user/liked-track')
export class LikedTrackController {
	constructor(private readonly likedTrackService: LikedTrackService) {}

	@Get()
	@ApiOperation({ summary: 'Gets multiple liked tracks' })
	@ApiResponse({ status: 200, type: [LikedTrack] })
	async getMany(
		@User('id') userId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.likedTrackService.getMany(userId, take);
	}

	@Post(':trackId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Adds track to liked' })
	@ApiResponse({ status: 204 })
	async add(
		@User('id') userId: number,
		@Param('trackId', ParseIntPipe) trackId: number
	) {
		await this.likedTrackService.add(userId, trackId);
	}

	@Delete(':trackId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Removes track from liked' })
	@ApiResponse({ status: 204 })
	async remove(
		@User('id') userId: number,
		@Param('trackId', ParseIntPipe) trackId: number
	) {
		await this.likedTrackService.remove(userId, trackId);
	}
}
