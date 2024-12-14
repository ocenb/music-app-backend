import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query
} from '@nestjs/common';
import { PlaylistTrackService } from './playlist-track.service';
import { User } from 'src/auth/decorators/user.decorator';
import { AddTrackDto, UpdateTrackPositionDto } from './playlist-track.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	PlaylistTrackRelation,
	TrackInPlaylist
} from './playlist-track.entities';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';

@ApiTags('Playlist tracks')
@Auth()
@Controller('playlist/:playlistId/track')
export class PlaylistTrackController {
	constructor(private readonly playlistTrackService: PlaylistTrackService) {}

	@Get()
	@ApiOperation({ summary: 'Gets multiple tracks in playlist' })
	@ApiResponse({ status: 200, type: [TrackInPlaylist] })
	async getMany(
		@Param('playlistId', ParseIntPipe) playlistId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.playlistTrackService.getMany(playlistId, take);
	}

	@Get('ids')
	@ApiOperation({ summary: "Gets multiple tracks' ids in playlist" })
	@ApiResponse({ status: 200, type: [Number] })
	async getManyIds(
		@Param('playlistId', ParseIntPipe) playlistId: number,
		@Query('startPosition', ParseIntPipe) startPosition: number
	) {
		return await this.playlistTrackService.getManyIds(
			playlistId,
			startPosition
		);
	}

	@Post(':trackId')
	@ApiOperation({ summary: 'Adds track to a playlist' })
	@ApiResponse({ status: 200, type: PlaylistTrackRelation })
	async add(
		@User('id') userId: number,
		@Param('playlistId', ParseIntPipe) playlistId: number,
		@Param('trackId', ParseIntPipe) trackId: number,
		@Body() addTrackDto: AddTrackDto
	) {
		return await this.playlistTrackService.add(
			userId,
			playlistId,
			trackId,
			addTrackDto
		);
	}

	@Patch(':trackId/position')
	@HttpCode(204)
	@ApiOperation({ summary: 'Changes track position' })
	@ApiResponse({ status: 204 })
	async updateTrackPosition(
		@User('id') userId: number,
		@Param('playlistId', ParseIntPipe) playlistId: number,
		@Param('trackId', ParseIntPipe) trackId: number,
		@Body() updateTrackPositionDto: UpdateTrackPositionDto
	) {
		await this.playlistTrackService.updateTrackPosition(
			userId,
			playlistId,
			trackId,
			updateTrackPositionDto
		);
	}

	@Delete(':trackId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Removes a track from a playlist' })
	@ApiResponse({ status: 204 })
	async remove(
		@User('id') userId: number,
		@Param('playlistId', ParseIntPipe) playlistId: number,
		@Param('trackId', ParseIntPipe) trackId: number
	) {
		await this.playlistTrackService.remove(userId, playlistId, trackId);
	}
}
