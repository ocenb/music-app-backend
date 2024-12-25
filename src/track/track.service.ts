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
import { TrackToAdd } from 'src/album/album.dto';

@Injectable()
export class TrackService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly fileService: FileService,
		@Inject(forwardRef(() => PlaylistTrackService))
		private readonly playlistTrackService: PlaylistTrackService,
		private readonly albumTrackService: AlbumTrackService
	) {}

	async streamAudio(trackId: number) {
		const track = await this.validateTrack(trackId);
		const { streamableFile, size } = this.fileService.streamAudio(track.audio);
		return { streamableFile, fileName: track.audio, size };
	}

	async getOne(trackId: number, currentUserId: number) {
		return await this.prismaService.track.findUnique({
			where: { id: trackId },
			include: {
				likes: { where: { userId: currentUserId }, select: { addedAt: true } }
			}
		});
	}

	async getMany(
		currentUserId: number,
		userId?: number,
		take?: number,
		sort?: 'popular'
	) {
		if (sort === 'popular') {
			return await this.prismaService.track.findMany({
				where: { userId },
				orderBy: { plays: 'desc' },
				take,
				include: {
					likes: { where: { userId: currentUserId }, select: { addedAt: true } }
				}
			});
		} else {
			return await this.prismaService.track.findMany({
				where: { userId },
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				take,
				include: {
					likes: { where: { userId: currentUserId }, select: { addedAt: true } }
				}
			});
		}
	}

	async getManyIds(userId: number, trackIdToExclude: number) {
		this.validateTrack(trackIdToExclude);
		const prevTracks = await this.prismaService.track.findMany({
			where: { userId, id: { gt: trackIdToExclude } },
			select: { id: true },
			orderBy: { createdAt: 'desc' }
		});
		const nextTracks = await this.prismaService.track.findMany({
			where: { userId, id: { lt: trackIdToExclude } },
			select: { id: true },
			orderBy: { createdAt: 'desc' }
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
		uploadTrackDto: UploadTrackDto,
		files: UploadedFilesDto
	) {
		await this.validateTrackTitle(userId, uploadTrackDto.title);
		await this.validateChangeableId(userId, uploadTrackDto.changeableId);
		const audioFile = await this.fileService.saveAudio(files.audio[0]);
		let duration: number;
		let imageName: string;
		try {
			duration = await this.fileService.getTrackDuration(audioFile.path);
			const imageFile = await this.fileService.saveImage(files.image[0]);
			imageName = imageFile.filename;
		} catch (err) {
			this.fileService.deleteFileByPath(audioFile.path);
			throw err;
		}
		return await this.prismaService.track.create({
			data: {
				user: { connect: { id: userId } },
				duration,
				audio: audioFile.filename,
				image: imageName,
				...uploadTrackDto
			}
		});
	}

	async uploadMany(
		userId: number,
		username: string,
		uploadTracksDto: TrackToAdd[],
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
				const audioFile = await this.fileService.saveAudio(audios[i]);
				const duration = await this.fileService.getTrackDuration(
					audioFile.path
				);
				data.push({
					userId,
					username,
					duration,
					audio: audioFile.filename,
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
		let tracksChangeableIds = [];
		uploadTracksDto.map((track) => {
			tracksChangeableIds.push(track.changeableId);
		});
		const tracksIdsObjects = await this.prismaService.track.findMany({
			where: { changeableId: { in: tracksChangeableIds } },
			select: { id: true }
		});
		let tracksIds: number[] = [];
		tracksIdsObjects.map((obj) => {
			tracksIds.push(obj.id);
		});
		tracksIds.sort((a, b) => a - b); //
		return tracksIds;
	}

	async addPlay(trackId: number) {
		await this.validateTrack(trackId);
		await this.prismaService.track.update({
			data: { plays: { increment: 1 } },
			where: { id: trackId }
		});
	}

	async changeImage(trackId: number, image: string) {
		return await this.prismaService.track.update({
			data: { image },
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
			const imageFile = await this.fileService.saveImage(image);
			await this.deleteImageIfFirstAlbum(trackId, track.image);
			imageName = imageFile.filename;
		}
		return await this.prismaService.track.update({
			data: { image: imageName, ...updateTrackDto },
			where: { id: trackId }
		});
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
		await this.deleteImageIfFirstAlbum(trackId, track.image);
		await this.prismaService.track.delete({
			where: { id: trackId }
		});
		await this.playlistTrackService.moveTracksPositions(track.playlists);
		await this.albumTrackService.moveTracksPositions(track.albums);
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

	private async deleteImageIfFirstAlbum(trackId: number, trackImage: string) {
		const firstAlbum = await this.albumTrackService.getFirstAlbum(trackId);
		if (!firstAlbum || firstAlbum.image !== trackImage) {
			await this.fileService.deleteFileByName(trackImage, 'images');
		}
	}
}
