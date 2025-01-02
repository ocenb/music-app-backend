import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TrackService } from 'src/track/track.service';

@Injectable()
export class LikedTrackService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly trackService: TrackService
	) {}

	async getMany(userId: number, take?: number) {
		return await this.prismaService.userLikedTrack.findMany({
			where: { userId },
			select: {
				track: {
					include: {
						likes: {
							where: { userId },
							select: { addedAt: true }
						}
					}
				}
			},
			orderBy: { addedAt: 'desc' },
			take
		});
	}

	async getManyIds(userId: number, trackIdToExclude: number) {
		const likedTrack = await this.validateLikedTrack(userId, trackIdToExclude);

		const prevTracks = await this.prismaService.userLikedTrack.findMany({
			where: {
				userId,
				trackId: { not: trackIdToExclude },
				addedAt: { gt: likedTrack.addedAt }
			},
			select: {
				track: { select: { id: true } }
			},
			orderBy: { addedAt: 'desc' }
		});

		const nextTracks = await this.prismaService.userLikedTrack.findMany({
			where: {
				userId,
				trackId: { not: trackIdToExclude },
				addedAt: { lt: likedTrack.addedAt }
			},
			select: {
				track: { select: { id: true } }
			},
			orderBy: { addedAt: 'desc' }
		});

		const prevIds: number[] = [];
		prevTracks.map((obj) => {
			prevIds.push(obj.track.id);
		});

		const nextIds: number[] = [];
		nextTracks.map((obj) => {
			nextIds.push(obj.track.id);
		});

		return { prevIds, nextIds };
	}

	async add(userId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const likedTrack = await this.prismaService.userLikedTrack.findUnique({
			where: { userId_trackId: { userId, trackId } }
		});
		if (likedTrack) {
			throw new BadRequestException('Track is already liked');
		}

		await this.prismaService.userLikedTrack.create({
			data: { userId, trackId }
		});
	}

	async remove(userId: number, trackId: number) {
		await this.validateLikedTrack(userId, trackId);

		await this.prismaService.userLikedTrack.delete({
			where: { userId_trackId: { userId, trackId } }
		});
	}

	private async validateLikedTrack(userId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const likedTrack = await this.prismaService.userLikedTrack.findUnique({
			where: { userId_trackId: { userId, trackId } }
		});
		if (!likedTrack) {
			throw new NotFoundException("Track is not in this user's liked tracks");
		}

		return likedTrack;
	}
}
