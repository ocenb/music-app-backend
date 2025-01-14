import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
	SearchResultAlbum,
	SearchResultTrack,
	SearchResultUser
} from './search.entities';

@Controller('search')
export class SearchController {
	constructor(private readonly searchService: SearchService) {}

	@Get()
	@ApiOperation({ summary: 'Tracks, albums, users search' })
	@ApiResponse({
		status: 200,
		type: [SearchResultUser || SearchResultAlbum || SearchResultTrack]
	})
	async search(@Query('search') searchQuery: string) {
		return await this.searchService.search(searchQuery);
	}
}
