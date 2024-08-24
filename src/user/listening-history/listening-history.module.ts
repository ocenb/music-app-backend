import { Module } from '@nestjs/common';
import { ListeningHistoryService } from './listening-history.service';
import { ListeningHistoryController } from './listening-history.controller';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';

@Module({
	controllers: [ListeningHistoryController],
	providers: [ListeningHistoryService, PrismaService],
	imports: [TrackModule]
})
export class ListeningHistoryModule {}
