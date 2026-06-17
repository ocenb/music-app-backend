import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';
import { LikedTrackController } from './liked-track.controller';
import { LikedTrackService } from './liked-track.service';

@Module({
	controllers: [LikedTrackController],
	providers: [LikedTrackService, PrismaService],
	imports: [forwardRef(() => TrackModule)]
})
export class LikedTrackModule {}
