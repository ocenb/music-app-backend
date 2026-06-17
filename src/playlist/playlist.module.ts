import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { FileModule } from 'src/file/file.module';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';
import { SavedPlaylistModule } from 'src/user/saved-playlist/saved-playlist.module';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { PlaylistTrackModule } from './playlist-track/playlist-track.module';

@Module({
	controllers: [PlaylistController],
	providers: [PlaylistService, PrismaService],
	imports: [
		MulterModule.register(multerConfig),
		forwardRef(() => TrackModule),
		forwardRef(() => PlaylistTrackModule),
		forwardRef(() => SavedPlaylistModule),
		FileModule
	],
	exports: [PlaylistService]
})
export class PlaylistModule {}
