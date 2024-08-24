import { Module } from '@nestjs/common';
import { LikedAlbumService } from './liked-album.service';
import { LikedAlbumController } from './liked-album.controller';
import { AlbumModule } from 'src/album/album.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [LikedAlbumController],
  providers: [LikedAlbumService, PrismaService],
  imports: [AlbumModule]
})
export class LikedAlbumModule {}
