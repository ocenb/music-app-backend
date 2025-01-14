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
import { AlbumService } from './album.service';
import {
	FileFieldsInterceptor,
	FileInterceptor
} from '@nestjs/platform-express';
import { User } from 'src/auth/decorators/user.decorator';
import {
	CreateAlbumDto,
	CreateAlbumDtoWithFiles,
	UpdateAlbumDto,
	UpdateAlbumDtoWithImage
} from './album.dto';
import {
	ImageAndAudiosValidationPipe,
	ImageOptionalValidationPipe
} from 'src/pipes/files-validation.pipe';
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { Album, AlbumFull } from './album.entities';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Album')
@Auth()
@Controller('album')
export class AlbumController {
	constructor(private readonly albumService: AlbumService) {}

	@Get()
	@ApiOperation({ summary: 'Gets one album' })
	@ApiResponse({ status: 200, type: AlbumFull })
	async getOne(
		@User('id') currentUserId: number,
		@Query('username') username: string,
		@Query('changeableId') changeableId: string
	) {
		return await this.albumService.getOne(
			currentUserId,
			username,
			changeableId
		);
	}

	@Get('many')
	@ApiOperation({ summary: 'Gets multiple albums' })
	@ApiResponse({ status: 200, type: [Album] })
	async getMany(
		@Query('userId', ParseIntPipe) userId: number,
		@Query('take', ParseIntOptionalPipe) take?: number,
		@Query('lastId', ParseIntOptionalPipe) lastId?: number
	) {
		return await this.albumService.getMany(userId, take, lastId);
	}

	@Post()
	@UseInterceptors(
		FileFieldsInterceptor([{ name: 'image', maxCount: 1 }, { name: 'audios' }])
	)
	@ApiOperation({ summary: 'Creates an album' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: CreateAlbumDtoWithFiles
	})
	@ApiResponse({ status: 201, type: AlbumFull })
	async create(
		@User('id') userId: number,
		@User('username') username: string,
		@Body() createAlbumDto: CreateAlbumDto,
		@UploadedFiles(ImageAndAudiosValidationPipe)
		files: {
			image: [Express.Multer.File];
			audios: Express.Multer.File[];
		}
	) {
		return await this.albumService.create(
			userId,
			username,
			createAlbumDto,
			files.image[0],
			files.audios
		);
	}

	@Patch(':albumId')
	@UseInterceptors(FileInterceptor('image'))
	@ApiOperation({ summary: 'Changes album' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: UpdateAlbumDtoWithImage
	})
	@ApiResponse({ status: 200, type: Album })
	async update(
		@User('id') userId: number,
		@Param('albumId', ParseIntPipe) albumId: number,
		@Body() updateAlbumDto: UpdateAlbumDto,
		@UploadedFile(ImageOptionalValidationPipe) image?: Express.Multer.File
	) {
		return await this.albumService.update(
			userId,
			albumId,
			updateAlbumDto,
			image
		);
	}

	@Delete(':albumId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Deletes album' })
	@ApiResponse({ status: 204 })
	async delete(
		@User('id') userId: number,
		@Param('albumId', ParseIntPipe) albumId: number
	) {
		await this.albumService.delete(userId, albumId);
	}
}
