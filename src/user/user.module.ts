import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AlbumModule } from 'src/album/album.module';
import { AuthModule } from 'src/auth/auth.module';
import { multerConfig } from 'src/config/multer.config';
import { FileModule } from 'src/file/file.module';
import { PlaylistModule } from 'src/playlist/playlist.module';
import { PrismaService } from 'src/prisma.service';
import { SearchModule } from 'src/search/search.module';
import { TrackModule } from 'src/track/track.module';
import { FollowModule } from './follow/follow.module';
import { LikedAlbumModule } from './liked-album/liked-album.module';
import { LikedTrackModule } from './liked-track/liked-track.module';
import { ListeningHistoryModule } from './listening-history/listening-history.module';
import { SavedPlaylistModule } from './saved-playlist/saved-playlist.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaService],
	exports: [UserService],
	imports: [
		MulterModule.register(multerConfig),
		forwardRef(() => FollowModule),
		forwardRef(() => AuthModule),
		SavedPlaylistModule,
		LikedTrackModule,
		LikedAlbumModule,
		FileModule,
		ListeningHistoryModule,
		forwardRef(() => AlbumModule),
		forwardRef(() => TrackModule),
		PlaylistModule,
		forwardRef(() => SearchModule)
	]
})
export class UserModule {}
