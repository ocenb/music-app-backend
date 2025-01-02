import {
	ConflictException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { UpdateTrackPositionDto } from './album-track.dto';
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
		const album = await this.prismaService.album.findUnique({
			where: { id: albumId },
			select: {
				tracks: {
					orderBy: { position: 'asc' },
					select: { track: true, position: true, addedAt: true },
					take
				}
			}
		});

		if (!album) {
			throw new NotFoundException('Album not found');
		}

		return album.tracks;
	}

	async getManyIds(albumId: number, positionToExclude: number) {
		const prevTracks = await this.prismaService.album.findUnique({
			where: { id: albumId },
			select: {
				tracks: {
					orderBy: { position: 'asc' },
					select: { track: { select: { id: true } } },
					where: { position: { lt: positionToExclude } }
				}
			}
		});
		const nextTracks = await this.prismaService.album.findUnique({
			where: { id: albumId },
			select: {
				tracks: {
					orderBy: { position: 'asc' },
					select: { track: { select: { id: true } } },
					where: { position: { gt: positionToExclude } }
				}
			}
		});

		const prevIds: number[] = [];
		prevTracks.tracks.map((obj) => {
			prevIds.push(obj.track.id);
		});

		const nextIds: number[] = [];
		nextTracks.tracks.map((obj) => {
			nextIds.push(obj.track.id);
		});

		return { prevIds, nextIds };
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

	async getAllTracksIds(albumId: number) {
		const albumTracks = await this.prismaService.albumTrack.findMany({
			where: { albumId }
		});

		const tracksIds: number[] = [];

		for (const { trackId } of albumTracks) {
			tracksIds.push(trackId);
		}

		return tracksIds;
	}

	async checkTrackInAlbum(trackId: number) {
		const album = await this.prismaService.albumTrack.findFirst({
			where: { trackId }
		});

		if (album) {
			return true;
		}

		return false;
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

	private async validateTrackInAlbum(albumId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const trackInAlbum = await this.getOneAlbumTrackRelation(albumId, trackId);

		if (!trackInAlbum) {
			throw new NotFoundException('Track is not in this album');
		}

		return trackInAlbum;
	}

	private async getOneAlbumTrackRelation(albumId: number, trackId: number) {
		return await this.prismaService.albumTrack.findUnique({
			where: { albumId_trackId: { albumId, trackId } }
		});
	}
}
