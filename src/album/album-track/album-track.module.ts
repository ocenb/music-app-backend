import { forwardRef, Module } from '@nestjs/common';
import { AlbumTrackService } from './album-track.service';
import { AlbumTrackController } from './album-track.controller';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';
import { AlbumModule } from '../album.module';

@Module({
	controllers: [AlbumTrackController],
	providers: [AlbumTrackService, PrismaService],
	imports: [forwardRef(() => TrackModule), forwardRef(() => AlbumModule)],
	exports: [AlbumTrackService]
})
export class AlbumTrackModule {}
