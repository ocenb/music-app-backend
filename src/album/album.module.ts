import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { FileModule } from 'src/file/file.module';
import { NotificationModule } from 'src/notification/notification.module';
import { PrismaService } from 'src/prisma.service';
import { SearchModule } from 'src/search/search.module';
import { TrackModule } from 'src/track/track.module';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { AlbumTrackModule } from './album-track/album-track.module';

@Module({
	controllers: [AlbumController],
	providers: [AlbumService, PrismaService],
	imports: [
		MulterModule.register(multerConfig),
		forwardRef(() => AlbumTrackModule),
		forwardRef(() => TrackModule),
		FileModule,
		NotificationModule,
		forwardRef(() => SearchModule)
	],
	exports: [AlbumService]
})
export class AlbumModule {}
