import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';
import { AlbumModule } from '../album.module';
import { AlbumTrackController } from './album-track.controller';
import { AlbumTrackService } from './album-track.service';

@Module({
	controllers: [AlbumTrackController],
	providers: [AlbumTrackService, PrismaService],
	imports: [forwardRef(() => TrackModule), forwardRef(() => AlbumModule)],
	exports: [AlbumTrackService]
})
export class AlbumTrackModule {}
