import {
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	Post,
	Query
} from '@nestjs/common';
import { ListeningHistoryService } from './listening-history.service';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	ListeningHistoryRelation,
	ListeningHistoryTrack
} from './listening-history.entities';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';

@ApiTags('Listening history')
@Auth()
@Controller('user/listening-history')
export class ListeningHistoryController {
	constructor(
		private readonly listeningHistoryService: ListeningHistoryService
	) {}

	@Get()
	@ApiOperation({ summary: 'Gets listening history' })
	@ApiResponse({ status: 200, type: [ListeningHistoryTrack] })
	async get(
		@User('id') userId: number,
		@Query('take', ParseIntOptionalPipe) take?: number
	) {
		return await this.listeningHistoryService.get(userId, take);
	}

	@Post(':trackId')
	@ApiOperation({ summary: 'Adds track to listening history' })
	@ApiResponse({ status: 201, type: ListeningHistoryRelation })
	async add(
		@User('id') userId: number,
		@Param('trackId', ParseIntPipe) trackId: number
	) {
		return await this.listeningHistoryService.add(userId, trackId);
	}

	@Delete()
	@HttpCode(204)
	@ApiOperation({ summary: 'Clears listening history' })
	@ApiResponse({ status: 204 })
	async clear(@User('id') userId: number) {
		await this.listeningHistoryService.clear(userId);
	}
}
