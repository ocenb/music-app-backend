import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { TrackService } from 'src/track/track.service';

@Injectable()
export class ListeningHistoryService {
	private readonly logger = new Logger(ListeningHistoryService.name);

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

	@Interval(2147483647)
	async cleanUpHistory() {
		this.logger.log('Deleting old history...');

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const result = await this.prismaService.notification.deleteMany({
			where: { createdAt: { lt: thirtyDaysAgo } }
		});

		this.logger.log(`Deleted ${result.count} old history`);
	}
}
