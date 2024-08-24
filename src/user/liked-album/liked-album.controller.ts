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
import { LikedAlbumService } from './liked-album.service';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LikedAlbum } from './liked-album.entities';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Liked albums')
@Auth()
@Controller('user/liked-album')
export class LikedAlbumController {
	constructor(private readonly likedAlbumService: LikedAlbumService) {}

	@Get()
	@ApiOperation({ summary: 'Gets multiple liked albums' })
	@ApiResponse({ status: 200, type: [LikedAlbum] })
	async getMany(
		@User('id') userId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.likedAlbumService.getMany(userId, take);
	}

	@Post(':albumId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Adds album to liked' })
	@ApiResponse({ status: 204 })
	async add(
		@User('id') userId: number,
		@Param('albumId', ParseIntPipe) albumId: number
	) {
		await this.likedAlbumService.add(userId, albumId);
	}

	@Delete(':albumId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Removes album from liked' })
	@ApiResponse({ status: 204 })
	async remove(
		@User('id') userId: number,
		@Param('albumId', ParseIntPipe) albumId: number
	) {
		await this.likedAlbumService.remove(userId, albumId);
	}
}
