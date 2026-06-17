import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from '../user.module';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';

@Module({
	controllers: [FollowController],
	providers: [FollowService, PrismaService],
	imports: [forwardRef(() => UserModule)],
	exports: [FollowService]
})
export class FollowModule {}
