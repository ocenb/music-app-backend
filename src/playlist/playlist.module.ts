import { forwardRef, Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { PrismaService } from 'src/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileModule } from 'src/file/file.module';
import { PlaylistTrackModule } from './playlist-track/playlist-track.module';
import { TrackModule } from 'src/track/track.module';
import { multerConfig } from 'config/multer.config';

@Module({
  controllers: [PlaylistController],
  providers: [PlaylistService, PrismaService],
  imports: [
    MulterModule.register(multerConfig),
    forwardRef(() => TrackModule),
    forwardRef(() => PlaylistTrackModule),
    FileModule
  ],
  exports: [PlaylistService]
})
export class PlaylistModule {}
