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
import { AlbumService } from './album.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/auth/decorators/user.decorator';
import {
	CreateAlbumDto,
	CreateAlbumDtoWithImage,
	UpdateAlbumDto,
	UpdateAlbumDtoWithImage
} from './album.dto';
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
import { Album, AlbumFull } from './album.entities';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Album')
@Auth()
@Controller('album')
export class AlbumController {
	constructor(private readonly albumService: AlbumService) {}

	@Get(':albumId')
	@ApiOperation({ summary: 'Gets one album' })
	@ApiResponse({ status: 200, type: AlbumFull })
	async getOne(
		@Query('username', ParseIntPipe) username: string,
		@Query('changeableId', ParseIntPipe) changeableId: string
	) {
		return await this.albumService.getOne(username, changeableId);
	}

	@Get()
	@ApiOperation({ summary: 'Gets multiple albums' })
	@ApiResponse({ status: 200, type: [Album] })
	async getMany(
		@Query('userId', ParseIntOptionalPipe) userId?: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.albumService.getMany(userId, take);
	}

	@Post()
	@UseInterceptors(FileInterceptor('image'))
	@ApiOperation({ summary: 'Creates an album' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: CreateAlbumDtoWithImage
	})
	@ApiResponse({ status: 201, type: AlbumFull })
	async create(
		@User('id') userId: number,
		@Body() createAlbumDto: CreateAlbumDto,
		@UploadedFile(ImageValidationPipe) image: Express.Multer.File
	) {
		return await this.albumService.create(userId, createAlbumDto, image);
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
