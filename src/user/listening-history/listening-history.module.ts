import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TrackModule } from 'src/track/track.module';
import { ListeningHistoryController } from './listening-history.controller';
import { ListeningHistoryService } from './listening-history.service';

@Module({
	controllers: [ListeningHistoryController],
	providers: [ListeningHistoryService, PrismaService],
	imports: [forwardRef(() => TrackModule)]
})
export class ListeningHistoryModule {}
