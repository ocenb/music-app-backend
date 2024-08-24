import { Module } from '@nestjs/common';
import { SavedPlaylistService } from './saved-playlist.service';
import { SavedPlaylistController } from './saved-playlist.controller';
import { PrismaService } from 'src/prisma.service';
import { PlaylistModule } from 'src/playlist/playlist.module';

@Module({
  controllers: [SavedPlaylistController],
  providers: [SavedPlaylistService, PrismaService],
  imports: [PlaylistModule]
})
export class SavedPlaylistModule {}
