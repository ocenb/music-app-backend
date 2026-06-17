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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { SavedPlaylist } from './saved-playlist.entities';
import { SavedPlaylistService } from './saved-playlist.service';

@ApiTags('Saved playlists')
@Auth()
@Controller('user/saved-playlist')
export class SavedPlaylistController {
	constructor(private readonly savedPlaylistService: SavedPlaylistService) {}

	@Get()
	@ApiOperation({ summary: 'Gets multiple saved playlists' })
	@ApiResponse({ status: 200, type: [SavedPlaylist] })
	async getMany(
		@User('id') userId: number,
		@Query('take', ParseIntOptionalPipe) take?: number,
		@Query('lastId', ParseIntOptionalPipe) lastId?: number
	) {
		return await this.savedPlaylistService.getMany(userId, take, lastId);
	}

	@Post(':playlistId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Adds playlist to saved' })
	@ApiResponse({ status: 204 })
	async save(
		@User('id') userId: number,
		@Param('playlistId', ParseIntPipe) playlistId: number
	) {
		await this.savedPlaylistService.save(userId, playlistId);
	}

	@Delete(':playlistId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Removes playlist from saved' })
	@ApiResponse({ status: 204 })
	async remove(
		@User('id') userId: number,
		@Param('playlistId', ParseIntPipe) playlistId: number
	) {
		await this.savedPlaylistService.remove(userId, playlistId);
	}
}
