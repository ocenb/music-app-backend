import { forwardRef, Module } from '@nestjs/common';
import { PlaylistModule } from 'src/playlist/playlist.module';
import { PrismaService } from 'src/prisma.service';
import { SavedPlaylistController } from './saved-playlist.controller';
import { SavedPlaylistService } from './saved-playlist.service';

@Module({
	controllers: [SavedPlaylistController],
	providers: [SavedPlaylistService, PrismaService],
	imports: [forwardRef(() => PlaylistModule)],
	exports: [SavedPlaylistService]
})
export class SavedPlaylistModule {}
