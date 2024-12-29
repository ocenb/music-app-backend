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
	UseInterceptors
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import {
	CreatePlaylistDto,
	CreatePlaylistDtoWithImage,
	UpdatePlaylistDto,
	UpdatePlaylistDtoWithImage
} from './playlist.dto';
import { User } from 'src/auth/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ImageOptionalValidationPipe,
	ImageValidationPipe
} from 'src/pipes/files-validation.pipe';
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { Playlist, PlaylistFull } from './playlist.entities';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseTakePipe } from 'src/pipes/parse-take.pipe';

@ApiTags('Playlist')
@Auth()
@Controller('playlist')
export class PlaylistController {
	constructor(private readonly playlistService: PlaylistService) {}

	@Get()
	@ApiOperation({ summary: 'Gets one playlist' })
	@ApiResponse({ status: 200, type: PlaylistFull })
	async getOne(
		@Query('username') username: string,
		@Query('changeableId') changeableId: string
	) {
		return await this.playlistService.getOne(username, changeableId);
	}

	@Get('many')
	@ApiOperation({ summary: 'Gets multiple playlists' })
	@ApiResponse({ status: 200, type: [Playlist] })
	async getMany(
		@Query('userId', ParseIntPipe) userId: number,
		@Query('take', ParseTakePipe) take?: number,
		@Query('lastId', ParseIntOptionalPipe) lastId?: number
	) {
		return await this.playlistService.getMany(userId, take, lastId);
	}

	@Post()
	@UseInterceptors(FileInterceptor('image'))
	@ApiOperation({ summary: 'Creates a playlist' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: CreatePlaylistDtoWithImage
	})
	@ApiResponse({ status: 201, type: Playlist })
	async create(
		@User('id') userId: number,
		@Body() createPlaylistDto: CreatePlaylistDto,
		@UploadedFile(ImageValidationPipe) image: Express.Multer.File
	) {
		return await this.playlistService.create(userId, createPlaylistDto, image);
	}

	@Patch(':playlistId')
	@UseInterceptors(FileInterceptor('image'))
	@ApiOperation({ summary: 'Changes playlist' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: UpdatePlaylistDtoWithImage
	})
	@ApiResponse({ status: 200, type: Playlist })
	async update(
		@User('id') userId: number,
		@Param('playlistId', ParseIntPipe) playlistId: number,
		@Body() updatePlaylistInfoDto: UpdatePlaylistDto,
		@UploadedFile(ImageOptionalValidationPipe) image?: Express.Multer.File
	) {
		return await this.playlistService.update(
			userId,
			playlistId,
			updatePlaylistInfoDto,
			image
		);
	}

	@Delete(':playlistId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Deletes playlist' })
	@ApiResponse({ status: 204 })
	async delete(
		@User('id') userId: number,
		@Param('playlistId', ParseIntPipe) playlistId: number
	) {
		await this.playlistService.delete(userId, playlistId);
	}
}
