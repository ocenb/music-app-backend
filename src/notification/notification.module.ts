import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from 'src/prisma.service';
import { FollowModule } from 'src/user/follow/follow.module';

@Module({
	controllers: [NotificationController],
	providers: [NotificationService, PrismaService],
	imports: [FollowModule],
	exports: [NotificationService]
})
export class NotificationModule {}
