import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { FollowModule } from './follow/follow.module';
import { SavedPlaylistModule } from './saved-playlist/saved-playlist.module';
import { LikedTrackModule } from './liked-track/liked-track.module';
import { FileModule } from 'src/file/file.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'config/multer.config';
import { ListeningHistoryModule } from './listening-history/listening-history.module';
import { AlbumModule } from 'src/album/album.module';
import { TrackModule } from 'src/track/track.module';
import { AuthModule } from 'src/auth/auth.module';
import { LikedAlbumModule } from './liked-album/liked-album.module';
import { PlaylistModule } from 'src/playlist/playlist.module';
import { SearchModule } from 'src/search/search.module';

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
		AlbumModule,
		TrackModule,
		PlaylistModule,
		forwardRef(() => SearchModule)
	]
})
export class UserModule {}
