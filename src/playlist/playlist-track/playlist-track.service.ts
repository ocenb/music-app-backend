import {
	BadRequestException,
	ConflictException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AddTrackDto, UpdateTrackPositionDto } from './playlist-track.dto';
import { TrackService } from 'src/track/track.service';
import { PlaylistService } from '../playlist.service';

@Injectable()
export class PlaylistTrackService {
	constructor(
		private readonly prismaService: PrismaService,
		@Inject(forwardRef(() => TrackService))
		private readonly trackService: TrackService,
		private readonly playlistService: PlaylistService
	) {}

	async getMany(playlistId: number, take?: number) {
		const { tracks } = await this.prismaService.playlist.findUnique({
			where: { id: playlistId },
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

	async getManyIds(playlistId: number, positionToExclude: number) {
		const prevTracks = await this.prismaService.playlist.findUnique({
			where: { id: playlistId },
			select: {
				tracks: {
					orderBy: { position: 'asc' },
					select: { track: { select: { id: true } } },
					where: { position: { lt: positionToExclude } }
				}
			}
		});
		const nextTracks = await this.prismaService.playlist.findUnique({
			where: { id: playlistId },
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

	async add(
		userId: number,
		playlistId: number,
		trackId: number,
		addTrackDto: AddTrackDto
	) {
		const { position } = addTrackDto;

		await this.playlistService.validatePlaylist(playlistId, userId);
		await this.trackService.validateTrack(trackId);
		const trackInPlaylist = await this.getOnePlaylistTrackRelation(
			playlistId,
			trackId
		);
		if (trackInPlaylist) {
			throw new ConflictException('Track already in playlist');
		}

		const lastPositionTrack = await this.prismaService.playlistTrack.findFirst({
			orderBy: { position: 'desc' },
			where: { playlistId }
		});
		const lastPosition = lastPositionTrack ? lastPositionTrack.position : 0;

		if (!position || position > lastPosition) {
			return await this.prismaService.playlistTrack.create({
				data: {
					...addTrackDto,
					trackId,
					playlistId,
					position: lastPosition + 1
				}
			});
		} else {
			await this.prismaService.playlistTrack.updateMany({
				data: { position: { increment: 1 } },
				where: { position: { gte: position } }
			});

			return await this.prismaService.playlistTrack.create({
				data: { ...addTrackDto, trackId, playlistId, position }
			});
		}
	}

	async updateTrackPosition(
		userId: number,
		playlistId: number,
		trackId: number,
		updateTrackPositionDto: UpdateTrackPositionDto
	) {
		const { position } = updateTrackPositionDto;

		await this.playlistService.validatePlaylist(playlistId, userId);
		const trackInPlaylist = await this.validateTrackInPlaylist(
			playlistId,
			trackId
		);

		if (position > trackInPlaylist.position) {
			await this.prismaService.playlistTrack.updateMany({
				data: { position: { decrement: 1 } },
				where: { position: { gt: trackInPlaylist.position, lte: position } }
			});
		} else if (position < trackInPlaylist.position) {
			await this.prismaService.playlistTrack.updateMany({
				data: { position: { increment: 1 } },
				where: { position: { gte: position, lt: trackInPlaylist.position } }
			});
		} else {
			throw new ConflictException('Track already in this position');
		}

		await this.prismaService.playlistTrack.update({
			data: { position },
			where: { playlistId_trackId: { playlistId, trackId } }
		});
	}

	async moveTracksPositions(
		playlists: {
			playlistId: number;
			position: number;
		}[]
	) {
		for (const playlist of playlists) {
			await this.prismaService.playlistTrack.updateMany({
				data: { position: { decrement: 1 } },
				where: {
					position: { gt: playlist.position },
					playlistId: playlist.playlistId
				}
			});
		}
	}

	async remove(userId: number, playlistId: number, trackId: number) {
		await this.playlistService.validatePlaylist(playlistId, userId);
		await this.validateTrackInPlaylist(playlistId, trackId);

		const removedTrack = await this.prismaService.playlistTrack.delete({
			where: { playlistId_trackId: { playlistId, trackId } }
		});

		await this.moveTracksPositions([
			{ playlistId, position: removedTrack.position }
		]);
	}

	private async getOnePlaylistTrackRelation(
		playlistId: number,
		trackId: number
	) {
		return await this.prismaService.playlistTrack.findUnique({
			where: { playlistId_trackId: { playlistId, trackId } }
		});
	}

	private async validateTrackInPlaylist(playlistId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const trackInPlaylist = await this.getOnePlaylistTrackRelation(
			playlistId,
			trackId
		);
		if (!trackInPlaylist) {
			throw new NotFoundException('Track is not in this playlist');
		}

		return trackInPlaylist;
	}
}
