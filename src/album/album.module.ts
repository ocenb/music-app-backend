import { forwardRef, Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { PrismaService } from 'src/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'config/multer.config';
import { FileModule } from 'src/file/file.module';
import { AlbumTrackModule } from './album-track/album-track.module';
import { TrackModule } from 'src/track/track.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SearchModule } from 'src/search/search.module';

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
