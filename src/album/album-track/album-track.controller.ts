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
import { AlbumTrackService } from './album-track.service';
import { User } from 'src/auth/decorators/user.decorator';
import { AddTrackDto, UpdateTrackPositionDto } from './album-track.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlbumTrackRelation, TrackInAlbum } from './album-track.entities';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';

@ApiTags('Album tracks')
@Auth()
@Controller('album/:albumId/track')
export class AlbumTrackController {
	constructor(private readonly albumTrackService: AlbumTrackService) {}

	@Get()
	@ApiOperation({ summary: 'Gets multiple tracks in album' })
	@ApiResponse({ status: 200, type: [TrackInAlbum] })
	async getMany(
		@Param('albumId', ParseIntPipe) albumId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.albumTrackService.getMany(albumId, take);
	}

	@Get('ids')
	@ApiOperation({ summary: 'Gets multiple tracks in album' })
	@ApiResponse({ status: 200, type: [Number] })
	async getManyIds(
		@Param('albumId', ParseIntPipe) albumId: number,
		@Query('startPosition', ParseIntPipe) startPosition: number
	) {
		return await this.albumTrackService.getManyIds(albumId, startPosition);
	}

	@Post(':trackId')
	@ApiOperation({ summary: 'Adds a track to the album' })
	@ApiResponse({ status: 200, type: AlbumTrackRelation })
	async addTrack(
		@User('id') userId: number,
		@Param('albumId', ParseIntPipe) albumId: number,
		@Param('trackId', ParseIntPipe) trackId: number,
		@Body() addTrackDto: AddTrackDto
	) {
		return await this.albumTrackService.addTrack(
			userId,
			albumId,
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
		@Param('albumId', ParseIntPipe) albumId: number,
		@Param('trackId', ParseIntPipe) trackId: number,
		@Body() updateTrackPositionDto: UpdateTrackPositionDto
	) {
		await this.albumTrackService.updateTrackPosition(
			userId,
			albumId,
			trackId,
			updateTrackPositionDto
		);
	}

	@Delete(':trackId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Removes a track from an album' })
	@ApiResponse({ status: 204 })
	async removeTrack(
		@User('id') userId: number,
		@Param('albumId', ParseIntPipe) albumId: number,
		@Param('trackId', ParseIntPipe) trackId: number
	) {
		await this.albumTrackService.removeTrack(userId, albumId, trackId);
	}
}
