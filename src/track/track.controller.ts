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
	Query,
	Res,
	StreamableFile,
	UploadedFile,
	UploadedFiles,
	UseInterceptors
} from '@nestjs/common';
import { TrackService } from './track.service';
import {
	UpdateTrackDto,
	UpdateTrackDtoWithImage,
	UploadedFilesDto,
	UploadTrackDto,
	UploadTrackDtoWithFiles
} from './track.dto';
import {
	FileFieldsInterceptor,
	FileInterceptor
} from '@nestjs/platform-express';
import { User } from 'src/auth/decorators/user.decorator';
import {
	AudioImageValidationPipe,
	ImageOptionalValidationPipe
} from 'src/pipes/files-validation.pipe';
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { Track, TrackWithLiked } from './track.entities';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Response } from 'express';
import { ParseTakePipe } from 'src/pipes/parse-take.pipe';

@ApiTags('Track')
@Auth()
@Controller('track')
export class TrackController {
	constructor(private readonly trackService: TrackService) {}

	@Get('stream/:trackId')
	@ApiOperation({ summary: 'Streams an audio file' })
	@ApiResponse({ status: 200, type: StreamableFile })
	async streamAudio(
		@Res({ passthrough: true }) res: Response,
		@Param('trackId') trackId: number
	) {
		const { streamableFile, fileName, size } =
			await this.trackService.streamAudio(trackId);
		res.set({
			'Access-Control-Allow-Origin': '*', // ??
			'Accept-Ranges': 'bytes',
			'Content-Type': 'audio/webm',
			'Content-Length': size,
			'Content-Range': `0-${size}`,
			'Content-Disposition': `inline; filename=${fileName}`
		});
		return streamableFile;
	}

	@Get('one/:trackId')
	@ApiOperation({ summary: 'Gets one track' })
	@ApiResponse({
		status: 200,
		type: TrackWithLiked
	})
	async getOne(
		@User('id') currentUserId: number,
		@Param('trackId') trackId: number
	) {
		return await this.trackService.getOne(trackId, currentUserId);
	}

	@Get()
	@ApiOperation({ summary: 'Gets many tracks' })
	@ApiResponse({
		status: 200,
		type: [TrackWithLiked]
	})
	async getMany(
		@User('id') currentUserId: number,
		@Query('userId', ParseIntPipe) userId: number,
		@Query('take', ParseTakePipe) take?: number,
		@Query('lastId', ParseIntOptionalPipe) lastId?: number
	) {
		return await this.trackService.getMany(currentUserId, userId, take, lastId);
	}

	@Get('popular')
	@ApiOperation({ summary: 'Gets many popular tracks' })
	@ApiResponse({
		status: 200,
		type: [TrackWithLiked]
	})
	async getManyPopular(
		@User('id') currentUserId: number,
		@Query('userId', ParseIntPipe) userId: number,
		@Query('take', ParseTakePipe) take?: number,
		@Query('lastId', ParseIntOptionalPipe) lastId?: number
	) {
		return await this.trackService.getManyPopular(
			currentUserId,
			userId,
			take,
			lastId
		);
	}

	@Get('ids')
	@ApiOperation({ summary: "Gets many tracks' ids" })
	@ApiResponse({
		status: 200,
		type: [Number]
	})
	async getManyIds(
		@Query('userId', ParseIntPipe) userId: number,
		@Query('trackIdToExclude', ParseIntPipe) trackIdToExclude: number
	) {
		return await this.trackService.getManyIds(userId, trackIdToExclude);
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'audio', maxCount: 1 },
			{ name: 'image', maxCount: 1 }
		])
	)
	@ApiOperation({ summary: 'Uploads track' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: UploadTrackDtoWithFiles
	})
	@ApiResponse({ status: 201, type: Track })
	async upload(
		@User('id') userId: number,
		@User('username') username: string,
		@Body()
		uploadTrackDto: UploadTrackDto,
		@UploadedFiles(AudioImageValidationPipe)
		files: UploadedFilesDto
	) {
		return await this.trackService.upload(
			userId,
			username,
			uploadTrackDto,
			files
		);
	}

	@Post(':trackId/add-play')
	@HttpCode(204)
	@ApiOperation({
		summary: 'Adds one play to track'
	})
	@ApiResponse({ status: 204 })
	async addPlay(@Param('trackId', ParseIntPipe) trackId: number) {
		await this.trackService.addPlay(trackId);
	}

	@Patch(':trackId')
	@UseInterceptors(FileInterceptor('image'))
	@ApiOperation({
		summary: 'Changes track'
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: UpdateTrackDtoWithImage
	})
	@ApiResponse({ status: 200, type: Track })
	async update(
		@User('id') userId: number,
		@Param('trackId', ParseIntPipe) trackId: number,
		@Body()
		updateTrackDto: UpdateTrackDto,
		@UploadedFile(ImageOptionalValidationPipe)
		image?: Express.Multer.File
	) {
		return await this.trackService.update(
			userId,
			trackId,
			updateTrackDto,
			image
		);
	}

	@Delete(':trackId')
	@HttpCode(204)
	@ApiOperation({
		summary: 'Deletes track'
	})
	@ApiResponse({ status: 204 })
	async delete(
		@User('id') userId: number,
		@Param('trackId', ParseIntPipe) trackId: number
	) {
		await this.trackService.delete(userId, trackId);
	}
}
