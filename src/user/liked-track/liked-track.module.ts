import { Module } from '@nestjs/common';
import { LikedTrackService } from './liked-track.service';
import { LikedTrackController } from './liked-track.controller';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';

@Module({
  controllers: [LikedTrackController],
  providers: [LikedTrackService, PrismaService],
  imports: [TrackModule]
})
export class LikedTrackModule {}
