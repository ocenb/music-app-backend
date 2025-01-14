import { forwardRef, Module } from '@nestjs/common';
import { TrackService } from './track.service';
import { TrackController } from './track.controller';
import { PrismaService } from 'src/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileModule } from 'src/file/file.module';
import { PlaylistTrackModule } from 'src/playlist/playlist-track/playlist-track.module';
import { multerConfig } from 'config/multer.config';
import { AlbumTrackModule } from 'src/album/album-track/album-track.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SearchModule } from 'src/search/search.module';

@Module({
	controllers: [TrackController],
	providers: [TrackService, PrismaService],
	imports: [
		MulterModule.register(multerConfig),
		forwardRef(() => PlaylistTrackModule),
		FileModule,
		AlbumTrackModule,
		NotificationModule,
		forwardRef(() => SearchModule)
	],
	exports: [TrackService]
})
export class TrackModule {}
