import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CreateDocumentDto, UpdateDocumentDto } from './search.dto';
import { AlbumService } from 'src/album/album.service';
import { TrackService } from 'src/track/track.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SearchService {
	constructor(
		private readonly elasticsearchService: ElasticsearchService,
		@Inject(forwardRef(() => AlbumService))
		private readonly albumService: AlbumService,
		@Inject(forwardRef(() => TrackService))
		private readonly trackService: TrackService,
		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService
	) {}

	async search(searchQuery: string) {
		const result = await this.elasticsearchService.search({
			index: 'main',
			body: {
				query: {
					match: { name: searchQuery }
				}
			}
		});

		const documents = await Promise.all(
			result.body.hits.hits.map(async (hit: any) => {
				if (hit._source.type === 'user') {
					const document = await this.userService.getByIdPublic(hit._source.id);
					return {
						type: 'user',
						document
					};
				} else if (hit._source.type === 'track') {
					const document = await this.trackService.getById(hit._source.id);
					return {
						type: 'track',
						document
					};
				} else if (hit._source.type === 'album') {
					const document = await this.albumService.getById(hit._source.id);
					return {
						type: 'album',
						document
					};
				}
			})
		);

		return documents;
	}

	async create(createDto: CreateDocumentDto) {
		const id = `${createDto.type}_${createDto.id}`;

		await this.elasticsearchService.create({
			index: 'main',
			id,
			body: createDto
		});
	}

	async createMany(createManyDto: CreateDocumentDto[]) {
		const bulkBody = createManyDto.flatMap((createDto) => [
			{ index: { _index: 'main', _id: `${createDto.type}_${createDto.id}` } },
			createDto
		]);

		await this.elasticsearchService.bulk({
			refresh: true,
			body: bulkBody
		});
	}

	async update(id: string, updateDto: UpdateDocumentDto) {
		await this.elasticsearchService.update({
			index: 'main',
			id,
			body: {
				doc: updateDto
			}
		});
	}

	async delete(id: string) {
		await this.elasticsearchService.delete({
			index: 'main',
			id
		});
	}
}
