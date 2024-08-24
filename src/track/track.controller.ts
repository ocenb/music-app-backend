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
	UploadTrackDtoWithFiles,
	UploadTracksDto,
	UploadTracksDtoWithAudios
} from './track.dto';
import {
	FileFieldsInterceptor,
	FileInterceptor,
	FilesInterceptor
} from '@nestjs/platform-express';
import { User } from 'src/auth/decorators/user.decorator';
import {
	AudioImageValidationPipe,
	AudiosValidationPipe,
	ImageOptionalValidationPipe
} from 'src/pipes/files-validation.pipe';
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { Track, TracksCreatedCount, TrackWithUsername } from './track.entities';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Track')
@Auth()
@Controller('track')
export class TrackController {
	constructor(private readonly trackService: TrackService) {}

	@Get()
	@ApiOperation({ summary: 'Gets many tracks' })
	@ApiResponse({
		status: 200,
		type: [TrackWithUsername]
	})
	async getMany(
		@Query('userId', ParseIntOptionalPipe) userId?: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.trackService.getMany(userId, take);
	}

	@Get('most-popular')
	@ApiOperation({ summary: 'Gets most popular tracks' })
	@ApiResponse({ status: 200, type: [TrackWithUsername] })
	async getMostPopular(
		@Query('userId', ParseIntOptionalPipe) userId?: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.trackService.getMostPopular(userId, take);
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
		@Body()
		uploadTrackDto: UploadTrackDto,
		@UploadedFiles(AudioImageValidationPipe)
		files: UploadedFilesDto
	) {
		return await this.trackService.upload(userId, uploadTrackDto, files);
	}

	@Post('for-album')
	@UseInterceptors(FilesInterceptor('audios'))
	@ApiOperation({
		summary: 'Uploads tracks for album (before creating an album)'
	})
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: UploadTracksDtoWithAudios
	})
	@ApiResponse({ status: 201, type: TracksCreatedCount })
	async uploadForAlbum(
		@User('id') userId: number,
		@Body()
		uploadTracksDto: UploadTracksDto,
		@UploadedFiles(AudiosValidationPipe)
		audios: Express.Multer.File[]
	) {
		return await this.trackService.uploadForAlbum(
			userId,
			uploadTracksDto,
			audios
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
