import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TrackService } from 'src/track/track.service';

@Injectable()
export class ListeningHistoryService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly trackService: TrackService
	) {}

	async get(userId: number, take?: number) {
		return await this.prismaService.listeningHistory.findMany({
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
			orderBy: { playedAt: 'desc' },
			take
		});
	}

	async add(userId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const track = await this.prismaService.listeningHistory.findUnique({
			where: { userId_trackId: { trackId, userId } }
		});
		if (track) {
			await this.prismaService.listeningHistory.delete({
				where: { userId_trackId: { trackId, userId } }
			});
		}
		return await this.prismaService.listeningHistory.create({
			data: { userId, trackId }
		});
	}

	async clear(userId: number) {
		await this.prismaService.listeningHistory.deleteMany({
			where: { userId }
		});
	}
}
