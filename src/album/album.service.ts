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
import { NotificationService } from 'src/notification/notification.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SearchService } from 'src/search/search.service';
import { Express } from 'express';

@Injectable()
export class AlbumService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService,
		@Inject(forwardRef(() => TrackService))
		private readonly trackService: TrackService,
		@Inject(forwardRef(() => AlbumTrackService))
		private readonly albumTrackService: AlbumTrackService,
		private readonly notificationService: NotificationService,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		private readonly searchService: SearchService
	) {}

	async getById(albumId: number) {
		const album = await this.prismaService.album.findUnique({
			where: { id: albumId }
		});

		if (!album) {
			throw new NotFoundException('Album not found');
		}

		return album;
	}

	async getOne(currentUserId: number, username: string, changeableId: string) {
		const album = await this.prismaService.album.findUnique({
			where: { username_changeableId: { changeableId, username } },
			include: {
				likes: {
					where: { userId: currentUserId },
					select: { addedAt: true }
				}
			}
		});

		if (!album) {
			throw new NotFoundException('Album not found');
		}

		const _count = await this.cacheManager.get<string>(`album:${album.id}`);

		if (!_count) {
			const album2 = await this.prismaService.album.findUnique({
				where: { id: album.id },
				select: { _count: { select: { tracks: true } } }
			});

			await this.cacheManager.set(
				`album:${album.id}`,
				JSON.stringify({
					tracks: album2._count.tracks
				})
			);

			return { ...album, _count: album2._count };
		}

		return { ...album, _count: JSON.parse(_count) };
	}

	async getMany(userId: number, take?: number, lastId?: number) {
		return await this.prismaService.album.findMany({
			where: { userId, id: { lt: lastId } },
			orderBy: { createdAt: 'desc' },
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

		const imageName = await this.fileService.saveImage(image);
		await this.trackService.changeImages(trackIds, imageName);

		const createManyData: { position: number; trackId: number }[] = [];

		for (let i = 0; i < trackIds.length; i++) {
			createManyData.push({
				position: i + 1,
				trackId: trackIds[i]
			});
		}

		const album = await this.prismaService.album.create({
			data: {
				user: { connect: { id: userId } },
				title,
				type,
				changeableId,
				image: imageName,
				tracks: { createMany: { data: createManyData } }
			}
		});

		await this.cacheManager.set(
			`album:${album.id}`,
			JSON.stringify({ tracks: createManyData.length })
		);

		await this.searchService.create({
			id: album.id,
			name: album.title,
			type: 'album'
		});

		this.notificationService.create(
			userId,
			username,
			{ changeableId: album.changeableId, title: album.title },
			'album'
		);

		return { ...album, _count: { tracks: createManyData.length } };
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
			imageName = await this.fileService.saveImage(image);

			const tracksIds = await this.albumTrackService.getAllTracksIds(albumId);

			await this.trackService.changeImages(tracksIds, imageName);
			await this.fileService.deleteFileByName(album.image, 'images');
		}

		const updatedAlbum = await this.prismaService.album.update({
			data: { image: imageName, ...updateAlbumDto },
			where: { id: albumId }
		});

		if (updateAlbumDto.title) {
			await this.searchService.update(`album_${updatedAlbum.id}`, {
				name: updatedAlbum.title
			});
		}

		return updatedAlbum;
	}

	async delete(userId: number, albumId: number) {
		const album = await this.validateAlbum(albumId);
		this.checkPermission(userId, album.userId);

		const tracksIds = await this.albumTrackService.getAllTracksIds(albumId);

		await this.trackService.deleteMany(tracksIds);
		await this.fileService.deleteFileByName(album.image, 'images');

		await this.prismaService.album.delete({
			where: { id: albumId }
		});

		await this.cacheManager.del(`album:${album.id}`);

		await this.searchService.delete(`album_${album.id}`);
	}

	async deleteAllUserAlbums(userId: number) {
		const albums = await this.prismaService.album.findMany({
			where: { userId }
		});

		const keys: string[] = [];

		albums.map(async (album) => {
			keys.push(`album:${album.id}`);
			const tracksIds = await this.albumTrackService.getAllTracksIds(album.id);

			await this.trackService.deleteMany(tracksIds);
			await this.fileService.deleteFileByName(album.image, 'images');
		});

		await this.prismaService.album.deleteMany({ where: { userId } });

		await this.cacheManager.store.mdel(...keys);
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
