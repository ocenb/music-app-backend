import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AlbumTrackModule } from 'src/album/album-track/album-track.module';
import { multerConfig } from 'src/config/multer.config';
import { FileModule } from 'src/file/file.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PlaylistTrackModule } from 'src/playlist/playlist-track/playlist-track.module';
import { PrismaService } from 'src/prisma.service';
import { SearchModule } from 'src/search/search.module';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';

@Module({
	controllers: [TrackController],
	providers: [TrackService, PrismaService],
	imports: [
		MulterModule.register(multerConfig),
		forwardRef(() => PlaylistTrackModule),
		FileModule,
		forwardRef(() => AlbumTrackModule),
		forwardRef(() => NotificationModule),
		forwardRef(() => SearchModule)
	],
	exports: [TrackService]
})
export class TrackModule {}
