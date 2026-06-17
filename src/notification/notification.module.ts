import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FollowModule } from 'src/user/follow/follow.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
	controllers: [NotificationController],
	providers: [NotificationService, PrismaService],
	imports: [FollowModule],
	exports: [NotificationService]
})
export class NotificationModule {}
