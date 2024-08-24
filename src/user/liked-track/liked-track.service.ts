import { Injectable, NotFoundException } from '@nestjs/common';
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
				track: { include: { user: { select: { username: true } } } }
			},
			orderBy: { addedAt: 'desc' },
			take
		});
	}

	async add(userId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		await this.prismaService.userLikedTrack.create({
			data: { userId, trackId }
		});
	}

	async remove(userId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const likedTrack = await this.prismaService.userLikedTrack.findUnique({
			where: { userId_trackId: { userId, trackId } }
		});
		if (!likedTrack) {
			throw new NotFoundException("Track is not in this user's liked tracks");
		}
		await this.prismaService.userLikedTrack.delete({
			where: { userId_trackId: { userId, trackId } }
		});
	}
}
