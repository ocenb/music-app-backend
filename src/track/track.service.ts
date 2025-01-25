import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateTrackDto, UploadedFilesDto, UploadTrackDto } from './track.dto';
import { FileService } from 'src/file/file.service';
import { PlaylistTrackService } from 'src/playlist/playlist-track/playlist-track.service';
import { AlbumTrackService } from 'src/album/album-track/album-track.service';
import { NotificationService } from 'src/notification/notification.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SearchService } from 'src/search/search.service';
import { Express } from 'express';
import { CreateDocumentDto } from 'src/search/search.dto';

@Injectable()
export class TrackService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService,
		@Inject(forwardRef(() => PlaylistTrackService))
		private readonly playlistTrackService: PlaylistTrackService,
		private readonly albumTrackService: AlbumTrackService,
		private readonly notificationService: NotificationService,
		@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
		private readonly searchService: SearchService
	) {}

	async getOneById(currentUserId: number, trackId: number) {
		return await this.prismaService.track.findUnique({
			where: { id: trackId },
			include: {
				likes: { where: { userId: currentUserId }, select: { addedAt: true } }
			}
		});
	}

	async getOne(currentUserId: number, username: string, changeableId: string) {
		return await this.prismaService.track.findUnique({
			where: { username_changeableId: { changeableId, username } },
			include: {
				likes: { where: { userId: currentUserId }, select: { addedAt: true } }
			}
		});
	}

	async getMany(
		currentUserId: number,
		userId: number,
		take?: number,
		lastId?: number
	) {
		return await this.prismaService.track.findMany({
			where: { userId, id: { lt: lastId } },
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			take,
			include: {
				likes: { where: { userId: currentUserId }, select: { addedAt: true } }
			}
		});
	}

	async getManyPopular(
		currentUserId: number,
		userId: number,
		take?: number,
		lastId?: number
	) {
		const cursor = lastId ? { id: lastId } : undefined;

		return await this.prismaService.track.findMany({
			where: { userId },
			orderBy: { plays: 'desc' },
			take,
			include: {
				likes: { where: { userId: currentUserId }, select: { addedAt: true } }
			},
			cursor
		});
	}

	async getManyIds(userId: number, trackIdToExclude: number) {
		await this.validateTrack(trackIdToExclude);

		const prevTracks = await this.prismaService.track.findMany({
			where: { userId, id: { gt: trackIdToExclude } },
			select: { id: true },
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
		});
		const nextTracks = await this.prismaService.track.findMany({
			where: { userId, id: { lt: trackIdToExclude } },
			select: { id: true },
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
		});

		const prevIds: number[] = [];
		prevTracks.map((obj) => {
			prevIds.push(obj.id);
		});

		const nextIds: number[] = [];
		nextTracks.map((obj) => {
			nextIds.push(obj.id);
		});

		return { prevIds, nextIds };
	}

	async getById(id: number) {
		return await this.prismaService.track.findUnique({ where: { id } });
	}

	async getByTitle(userId: number, title: string) {
		return await this.prismaService.track.findUnique({
			where: { userId_title: { title, userId } }
		});
	}

	async upload(
		userId: number,
		username: string,
		uploadTrackDto: UploadTrackDto,
		files: UploadedFilesDto
	) {
		await this.validateTrackTitle(userId, uploadTrackDto.title);
		await this.validateChangeableId(userId, uploadTrackDto.changeableId);

		const { fileName, duration } = await this.fileService.saveAudio(
			files.audio[0]
		);

		let imageName: string;

		try {
			imageName = await this.fileService.saveImage(files.image[0]);
		} catch (err) {
			this.fileService.deleteFileByName(fileName, 'audio');
			throw err;
		}

		const newTrack = await this.prismaService.track.create({
			data: {
				user: { connect: { id: userId } },
				duration,
				audio: fileName,
				image: imageName,
				...uploadTrackDto
			}
		});

		await this.searchService.create({
			id: newTrack.id,
			name: newTrack.title,
			type: 'track'
		});

		this.notificationService.create(userId, username, uploadTrackDto, 'track');

		return newTrack;
	}

	async uploadMany(
		userId: number,
		username: string,
		uploadTracksDto: UploadTrackDto[],
		audios: Express.Multer.File[]
	) {
		const data: {
			userId: number;
			username: string;
			duration: number;
			audio: string;
			title: string;
			changeableId: string;
		}[] = [];

		for (let i = 0; i < uploadTracksDto.length; i++) {
			const trackInfo = uploadTracksDto[i];

			try {
				await this.validateTrackTitle(userId, trackInfo.title);
				await this.validateChangeableId(userId, trackInfo.changeableId);

				const { fileName, duration } = await this.fileService.saveAudio(
					audios[i]
				);

				data.push({
					userId,
					username,
					duration,
					audio: fileName,
					changeableId: trackInfo.changeableId,
					title: trackInfo.title
				});
			} catch (err) {
				for (const track of data) {
					await this.fileService.deleteFileByName(track.audio, 'audio');
				}

				throw err;
			}
		}

		await this.prismaService.track.createMany({
			data
		});

		const tracksChangeableIds = uploadTracksDto.map(
			(track) => track.changeableId
		);

		const tracksIdsObjects = await this.prismaService.track.findMany({
			where: { changeableId: { in: tracksChangeableIds }, userId },
			select: { id: true, title: true }
		});

		const forSearch: CreateDocumentDto[] = [];
		const tracksIds: number[] = [];

		tracksIdsObjects.map((obj) => {
			forSearch.push({ id: obj.id, name: obj.title, type: 'track' });
			tracksIds.push(obj.id);
		});

		await this.searchService.createMany(forSearch);

		tracksIds.sort((a, b) => a - b);

		return tracksIds;
	}

	async addPlay(trackId: number) {
		await this.validateTrack(trackId);

		await this.prismaService.track.update({
			data: { plays: { increment: 1 } },
			where: { id: trackId }
		});
	}

	async changeImages(tracksIds: number[], image: string) {
		return await this.prismaService.track.updateMany({
			data: { image },
			where: { id: { in: tracksIds } }
		});
	}

	async update(
		userId: number,
		trackId: number,
		updateTrackDto: UpdateTrackDto,
		image: Express.Multer.File
	) {
		const track = await this.validateTrack(trackId);
		await this.checkPermission(
			userId,
			track.userId,
			'You do not have permission to update this track'
		);
		if (updateTrackDto.title) {
			await this.validateTrackTitle(userId, updateTrackDto.title);
		}

		let imageName: string;

		if (image) {
			if (await this.albumTrackService.checkTrackInAlbum(trackId)) {
				throw new BadRequestException(
					'Сannot change the image of a track that is in an album'
				);
			}

			imageName = await this.fileService.saveImage(image);
			await this.fileService.deleteFileByName(track.image, 'images');
		}

		const updatedTrack = await this.prismaService.track.update({
			data: { image: imageName, ...updateTrackDto },
			where: { id: trackId }
		});

		if (updateTrackDto.title) {
			await this.searchService.update(`track_${updatedTrack.id}`, {
				name: updatedTrack.title
			});
		}

		return updatedTrack;
	}

	async delete(userId: number, trackId: number) {
		const track = await this.prismaService.track.findUnique({
			where: { id: trackId },
			include: {
				playlists: { select: { playlistId: true, position: true } },
				albums: { select: { albumId: true, position: true } }
			}
		});
		if (!track) {
			throw new NotFoundException('Track not found');
		}
		await this.checkPermission(
			userId,
			track.userId,
			'You do not have permission to delete this track'
		);

		await this.fileService.deleteFileByName(track.audio, 'audio');
		if (!track.albums.length) {
			await this.fileService.deleteFileByName(track.image, 'images');
		}

		await this.prismaService.track.delete({
			where: { id: trackId }
		});

		await this.searchService.delete(`track_${track.id}`);

		await this.playlistTrackService.moveTracksPositions(track.playlists);
		await this.albumTrackService.moveTracksPositions(track.albums);

		if (track.albums.length) {
			for (const album of track.albums) {
				const _count = await this.cacheManager.get<string>(
					`album:${album.albumId}`
				);

				if (!_count) {
					const album2 = await this.prismaService.album.findUnique({
						where: { id: album.albumId },
						select: { _count: { select: { likes: true, tracks: true } } }
					});

					await this.cacheManager.set(
						`album:${album.albumId}`,
						JSON.stringify({
							likes: album2._count.likes,
							tracks: album2._count.tracks
						})
					);
				} else {
					const parsedCount = JSON.parse(_count);

					await this.cacheManager.set(
						`album:${album.albumId}`,
						JSON.stringify({
							likes: parsedCount.likes,
							tracks: parsedCount.tracks - 1
						})
					);
				}
			}
		}
	}

	async deleteMany(tracksIds: number[]) {
		const tracks = await this.prismaService.track.findMany({
			where: { id: { in: tracksIds } },
			include: {
				playlists: { select: { playlistId: true, position: true } },
				albums: { select: { albumId: true, position: true } }
			}
		});

		for (const track of tracks) {
			await this.fileService.deleteFileByName(track.audio, 'audio');
		}

		await this.prismaService.track.deleteMany({
			where: { id: { in: tracksIds } }
		});

		for (const track of tracks) {
			await this.playlistTrackService.moveTracksPositions(track.playlists);
			await this.albumTrackService.moveTracksPositions(track.albums);
		}
	}

	async deleteAllUserTracks(userId: number) {
		const tracks = await this.prismaService.track.findMany({
			where: { userId }
		});

		tracks.map(async (track) => {
			await this.fileService.deleteFileByName(track.image, 'images');
			await this.fileService.deleteFileByName(track.audio, 'audio');
		});

		await this.prismaService.track.deleteMany({ where: { userId } });
	}

	async validateTrack(trackId: number) {
		const track = await this.getById(trackId);
		if (!track) {
			throw new NotFoundException('Track not found');
		}

		return track;
	}

	async checkPermission(userId: number, trackId: number, message: string) {
		if (userId !== trackId) {
			throw new ForbiddenException(message);
		}
	}

	private async validateTrackTitle(userId: number, title: string) {
		const track = await this.getByTitle(userId, title);
		if (track) {
			throw new BadRequestException(
				`A track with the title "${title}" already exists.`
			);
		}
	}

	private async validateChangeableId(userId: number, changeableId: string) {
		const track = await this.prismaService.track.findUnique({
			where: { userId_changeableId: { userId, changeableId } }
		});
		if (track) {
			throw new BadRequestException(
				`You already have a track with the id "${changeableId}".`
			);
		}
	}
}
