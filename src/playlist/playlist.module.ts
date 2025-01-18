import { forwardRef, Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { PrismaService } from 'src/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileModule } from 'src/file/file.module';
import { PlaylistTrackModule } from './playlist-track/playlist-track.module';
import { TrackModule } from 'src/track/track.module';
import { multerConfig } from 'src/config/multer.config';
import { SavedPlaylistModule } from 'src/user/saved-playlist/saved-playlist.module';

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
