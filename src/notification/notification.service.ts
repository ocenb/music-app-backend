import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';
import { FollowService } from 'src/user/follow/follow.service';

@Injectable()
export class NotificationService {
	private readonly logger = new Logger(NotificationService.name);

	constructor(
		private readonly prismaService: PrismaService,
		private readonly followService: FollowService
	) {}
	async create(
		userId: number,
		username: string,
		info: { changeableId: string; title: string },
		type: 'track' | 'album'
	) {
		const followers = await this.followService.getManyFollowersIds(userId);
		return await this.prismaService.notification.create({
			data: {
				message: `${username} uploaded new ${type}: ${info.title}`,
				link: info.changeableId,
				users: {
					create: followers.map(({ follower }) => ({ userId: follower.id }))
				}
			}
		});
	}

	async getAll(userId: number) {
		return await this.prismaService.userNotification.findMany({
			where: { userId },
			orderBy: { notification: { createdAt: 'desc' } },
			select: { notification: true }
		});
	}

	async delete(userId: number, notificationId: number) {
		const notification = await this.prismaService.userNotification.findUnique({
			where: { userId_notificationId: { userId, notificationId } }
		});
		if (!notification) {
			throw new NotFoundException('Notification not found');
		}
		await this.prismaService.userNotification.delete({
			where: { userId_notificationId: { userId, notificationId } }
		});
	}

	async deleteAll(userId: number) {
		await this.prismaService.userNotification.deleteMany({
			where: { userId }
		});
	}

	@Interval(2147483647)
	async cleanUpNotifications() {
		this.logger.log('Deleting old notifications...');

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const result = await this.prismaService.notification.deleteMany({
			where: { createdAt: { lt: thirtyDaysAgo } }
		});

		this.logger.log(`Deleted ${result.count} expired tokens`);
	}
}
