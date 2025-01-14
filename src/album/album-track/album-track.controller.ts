import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Patch,
	Query
} from '@nestjs/common';
import { AlbumTrackService } from './album-track.service';
import { User } from 'src/auth/decorators/user.decorator';
import { UpdateTrackPositionDto } from './album-track.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrackInAlbum } from './album-track.entities';
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
		@User('id') currentUserId: number,
		@Param('albumId', ParseIntPipe) albumId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.albumTrackService.getMany(currentUserId, albumId, take);
	}

	@Get('ids')
	@ApiOperation({ summary: "Gets multiple tracks' ids in album" })
	@ApiResponse({ status: 200, type: [Number] })
	async getManyIds(
		@Param('albumId', ParseIntPipe) albumId: number,
		@Query('positionToExclude', ParseIntPipe) positionToExclude: number
	) {
		return await this.albumTrackService.getManyIds(albumId, positionToExclude);
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
}
