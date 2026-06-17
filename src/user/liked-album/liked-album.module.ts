import { forwardRef, Module } from '@nestjs/common';
import { AlbumModule } from 'src/album/album.module';
import { PrismaService } from 'src/prisma.service';
import { LikedAlbumController } from './liked-album.controller';
import { LikedAlbumService } from './liked-album.service';

@Module({
	controllers: [LikedAlbumController],
	providers: [LikedAlbumService, PrismaService],
	imports: [forwardRef(() => AlbumModule)]
})
export class LikedAlbumModule {}
