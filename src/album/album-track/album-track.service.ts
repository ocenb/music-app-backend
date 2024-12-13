import {
	ConflictException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { AddTrackDto, UpdateTrackPositionDto } from './album-track.dto';
import { PrismaService } from 'src/prisma.service';
import { AlbumService } from '../album.service';
import { TrackService } from 'src/track/track.service';

@Injectable()
export class AlbumTrackService {
	constructor(
		private readonly prismaService: PrismaService,
		@Inject(forwardRef(() => AlbumService))
		private readonly albumService: AlbumService,
		@Inject(forwardRef(() => TrackService))
		private readonly trackService: TrackService
	) {}

	async getMany(albumId: number, take?: number) {
		const { tracks } = await this.prismaService.album.findUnique({
			where: { id: albumId },
			select: {
				tracks: {
					orderBy: { position: 'asc' },
					select: { track: true, position: true, addedAt: true },
					take
				}
			}
		});
		return tracks;
	}

	async getAllRelations(albumId: number) {
		return await this.prismaService.albumTrack.findMany({
			where: { albumId }
		});
	}

	async getOneAlbumTrackRelation(albumId: number, trackId: number) {
		return await this.prismaService.albumTrack.findUnique({
			where: { albumId_trackId: { albumId, trackId } }
		});
	}

	async getFirstAlbum(trackId: number) {
		return await this.prismaService.album.findFirst({
			where: { tracks: { some: { trackId } } }
		});
	}

	async getSecondAlbum(trackId: number) {
		const albums = await this.prismaService.albumTrack.findMany({
			orderBy: { addedAt: 'asc' },
			where: { trackId }
		});
		return await this.albumService.getOne(albums[1].albumId);
	}

	async checkFirstAlbum(trackId: number, albumId: number) {
		const firstAlbum = await this.prismaService.albumTrack.findFirst({
			orderBy: { addedAt: 'asc' },
			where: { trackId }
		});
		if (firstAlbum.albumId === albumId) {
			return true;
		}
		return false;
	}

	async checkTheOnlyAlbum(trackId: number) {
		const albums = await this.prismaService.albumTrack.findMany({
			take: 2,
			where: { trackId }
		});
		if (albums.length > 1) {
			return false;
		}
		return true;
	}

	async addTrack(
		userId: number,
		albumId: number,
		trackId: number,
		addTrackDto: AddTrackDto
	) {
		const { position } = addTrackDto;
		const album = await this.albumService.validateAlbum(albumId);
		this.albumService.checkPermission(userId, album.userId);
		const trackById = await this.trackService.validateTrack(trackId);
		await this.trackService.checkPermission(
			userId,
			trackById.userId,
			`track ${trackById.title} is not yours`
		);
		const trackInAlbum = await this.getOneAlbumTrackRelation(albumId, trackId);
		if (trackInAlbum) {
			throw new ConflictException('Track already in album');
		}
		const lastPositionTrack = await this.prismaService.albumTrack.findFirst({
			orderBy: { position: 'desc' },
			where: { albumId }
		});
		const lastPosition = lastPositionTrack ? lastPositionTrack.position : 0;
		if (!position || position > lastPosition) {
			return await this.prismaService.albumTrack.create({
				data: { ...addTrackDto, trackId, albumId, position: lastPosition + 1 }
			});
		} else {
			await this.prismaService.albumTrack.updateMany({
				data: { position: { increment: 1 } },
				where: { position: { gte: position } }
			});
			return await this.prismaService.albumTrack.create({
				data: { ...addTrackDto, trackId, albumId, position }
			});
		}
	}

	async updateTrackPosition(
		userId: number,
		albumId: number,
		trackId: number,
		updateTrackPositionDto: UpdateTrackPositionDto
	) {
		const { position } = updateTrackPositionDto;
		const album = await this.albumService.validateAlbum(albumId);
		this.albumService.checkPermission(userId, album.userId);
		const trackInAlbum = await this.validateTrackInAlbum(albumId, trackId);
		if (position > trackInAlbum.position) {
			await this.prismaService.albumTrack.updateMany({
				data: { position: { decrement: 1 } },
				where: { position: { gt: trackInAlbum.position, lte: position } }
			});
		} else if (position < trackInAlbum.position) {
			await this.prismaService.albumTrack.updateMany({
				data: { position: { increment: 1 } },
				where: { position: { gte: position, lt: trackInAlbum.position } }
			});
		} else {
			throw new ConflictException('Track already in this position');
		}
		await this.prismaService.albumTrack.update({
			data: { position },
			where: { albumId_trackId: { albumId, trackId } }
		});
	}

	async moveTracksPositions(
		albums: {
			albumId: number;
			position: number;
		}[]
	) {
		for (const album of albums) {
			await this.prismaService.albumTrack.updateMany({
				data: { position: { decrement: 1 } },
				where: {
					position: { gt: album.position },
					albumId: album.albumId
				}
			});
		}
	}

	async removeTrack(userId: number, albumId: number, trackId: number) {
		const album = await this.albumService.validateAlbum(albumId);
		this.albumService.checkPermission(userId, album.userId);
		await this.validateTrackInAlbum(albumId, trackId);
		const removedTrack = await this.prismaService.albumTrack.delete({
			where: { albumId_trackId: { albumId, trackId } }
		});
		await this.moveTracksPositions([
			{ albumId, position: removedTrack.position }
		]);
	}

	async validateTrackInAlbum(albumId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const trackInAlbum = await this.getOneAlbumTrackRelation(albumId, trackId);
		if (!trackInAlbum) {
			throw new NotFoundException('Track is not in this album');
		}
		return trackInAlbum;
	}
}
