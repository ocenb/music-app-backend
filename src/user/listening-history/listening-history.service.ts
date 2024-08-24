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
				track: { include: { user: { select: { username: true } } } }
			},
			orderBy: { playedAt: 'desc' },
			take
		});
	}

	async add(userId: number, trackId: number) {
		await this.trackService.validateTrack(trackId);
		const lastTrack = await this.prismaService.listeningHistory.findFirst({
			where: { userId },
			orderBy: { playedAt: 'desc' }
		});
		if (lastTrack && lastTrack.trackId === trackId) {
			throw new BadRequestException('Track is already the last one in history');
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
