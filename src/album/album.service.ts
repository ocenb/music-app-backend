import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma.service';
import { CreateAlbumDto, UpdateAlbumDto } from './album.dto';
import { TrackService } from 'src/track/track.service';
import { AlbumTrackService } from './album-track/album-track.service';

@Injectable()
export class AlbumService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService,
		@Inject(forwardRef(() => TrackService))
		private readonly trackService: TrackService,
		@Inject(forwardRef(() => AlbumTrackService))
		private readonly albumTrackService: AlbumTrackService
	) {}

	async getOne(username: string, changeableId: string) {
		const album = await this.prismaService.album.findUnique({
			where: { username_changeableId: { changeableId, username } },
			include: {
				_count: { select: { likes: true, tracks: true } }
			}
		});
		if (!album) {
			throw new NotFoundException('Album not found');
		}
		return album;
	}

	async getOneById(albumId: number) {
		const album = await this.prismaService.album.findUnique({
			where: { id: albumId }
		});
		if (!album) {
			throw new NotFoundException('Album not found');
		}
		return album;
	}

	async getMany(userId?: number, take?: number) {
		return await this.prismaService.album.findMany({
			where: { userId },
			take
		});
	}

	async create(
		userId: number,
		username: string,
		createAlbumDto: CreateAlbumDto,
		image: Express.Multer.File,
		audios: Express.Multer.File[]
	) {
		const { title, changeableId, type, tracks } = createAlbumDto;
		await this.validateAlbumTitle(userId, title);
		await this.validateChangeableId(userId, changeableId);
		const trackIds = await this.trackService.uploadMany(
			userId,
			username,
			tracks,
			audios
		);
		const imageFile = await this.fileService.saveImage(image);
		await this.trackService.changeImages(trackIds, imageFile.filename);

		let createManyData: { position: number; trackId: number }[] = [];
		for (let i = 0; i < trackIds.length; i++) {
			createManyData.push({
				position: tracks[i].position,
				trackId: trackIds[i]
			});
		}

		const album = await this.prismaService.album.create({
			data: {
				user: { connect: { id: userId } },
				title,
				type,
				changeableId,
				image: imageFile.filename,
				tracks: { createMany: { data: createManyData } }
			},
			include: {
				tracks: { orderBy: { position: 'asc' }, select: { track: true } },
				_count: { select: { likes: true, tracks: true } }
			}
		});

		return album;
	}

	async update(
		userId: number,
		albumId: number,
		updateAlbumDto: UpdateAlbumDto,
		image?: Express.Multer.File
	) {
		const album = await this.validateAlbum(albumId);
		this.checkPermission(userId, album.userId);
		if (updateAlbumDto.title) {
			await this.validateAlbumTitle(userId, updateAlbumDto.title);
		}
		if (updateAlbumDto.changeableId) {
			await this.validateChangeableId(userId, updateAlbumDto.changeableId);
		}
		let imageName: string;
		if (image) {
			const imageFile = await this.fileService.saveImage(image);
			await this.fileService.deleteFileByName(album.image, 'images');
			imageName = imageFile.filename;
			const albumTracks = await this.albumTrackService.getAllRelations(albumId);
			const tracksIds: number[] = [];
			for (const { trackId } of albumTracks) {
				if (await this.albumTrackService.checkFirstAlbum(trackId, albumId)) {
					tracksIds.push(trackId);
				}
			}
			await this.trackService.changeImages(tracksIds, imageFile.filename);
		}
		return await this.prismaService.album.update({
			data: { image: imageName, ...updateAlbumDto },
			where: { id: albumId }
		});
	}

	async delete(userId: number, albumId: number) {
		const album = await this.validateAlbum(albumId);
		this.checkPermission(userId, album.userId);
		const albumTracks = await this.albumTrackService.getAllRelations(albumId);
		const tracksToDelete: number[] = [];
		const tracksToChangeImage: number[] = [];
		let secondAlbumImage: string;
		for (const { trackId } of albumTracks) {
			if (await this.albumTrackService.checkFirstAlbum(trackId, albumId)) {
				if (await this.albumTrackService.checkTheOnlyAlbum(trackId)) {
					tracksToDelete.push(trackId);
				} else {
					const secondAlbum =
						await this.albumTrackService.getSecondAlbum(trackId);
					secondAlbumImage = secondAlbum.image;
					tracksToChangeImage.push(trackId);
				}
			}
		}
		await this.trackService.deleteMany(tracksToDelete);
		await this.trackService.changeImages(tracksToChangeImage, secondAlbumImage);
		await this.fileService.deleteFileByName(album.image, 'images');
		await this.prismaService.album.delete({
			where: { id: albumId }
		});
	}

	async deleteAllUserAlbums(userId: number) {
		await this.prismaService.album.deleteMany({ where: { userId } });
	}

	async validateAlbum(albumId: number) {
		const album = await this.prismaService.album.findUnique({
			where: { id: albumId }
		});
		if (!album) {
			throw new NotFoundException('Album not found');
		}
		return album;
	}

	private async validateAlbumTitle(userId: number, title: string) {
		const album = await this.prismaService.album.findUnique({
			where: { userId_title: { userId, title } }
		});
		if (album) {
			throw new BadRequestException(
				`Album with the title "${title}" already exists.`
			);
		}
	}

	private async validateChangeableId(userId: number, changeableId: string) {
		const album = await this.prismaService.album.findUnique({
			where: { userId_changeableId: { userId, changeableId } }
		});
		if (album) {
			throw new BadRequestException(
				`You already have an album with the id "${changeableId}".`
			);
		}
	}

	checkPermission(userId: number, albumCreatorId: number) {
		if (userId !== albumCreatorId) {
			throw new ForbiddenException(
				'You do not have permission to change this album'
			);
		}
	}
}
