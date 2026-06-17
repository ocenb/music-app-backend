import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';
import { PlaylistModule } from '../playlist.module';
import { PlaylistTrackController } from './playlist-track.controller';
import { PlaylistTrackService } from './playlist-track.service';

@Module({
	controllers: [PlaylistTrackController],
	providers: [PlaylistTrackService, PrismaService],
	imports: [forwardRef(() => TrackModule), forwardRef(() => PlaylistModule)],
	exports: [PlaylistTrackService]
})
export class PlaylistTrackModule {}
