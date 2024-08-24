import { forwardRef, Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from '../user.module';

@Module({
  controllers: [FollowController],
  providers: [FollowService, PrismaService],
  imports: [forwardRef(() => UserModule)]
})
export class FollowModule {}
