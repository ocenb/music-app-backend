import { forwardRef, Module } from '@nestjs/common';
import { PlaylistTrackService } from './playlist-track.service';
import { PlaylistTrackController } from './playlist-track.controller';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';
import { PlaylistModule } from '../playlist.module';

@Module({
  controllers: [PlaylistTrackController],
  providers: [PlaylistTrackService, PrismaService],
  imports: [forwardRef(() => TrackModule), forwardRef(() => PlaylistModule)],
  exports: [PlaylistTrackService]
})
export class PlaylistTrackModule {}
