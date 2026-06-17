import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { AlbumService } from 'src/album/album.service';
import { TrackService } from 'src/track/track.service';
import { UserService } from 'src/user/user.service';
import { CreateDocumentDto, UpdateDocumentDto } from './search.dto';

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
			query: {
				match: {
					name: {
						query: searchQuery,
						fuzziness: 'AUTO'
					}
				}
			}
		});

		const documents = await Promise.all(
			// biome-ignore lint/suspicious/noExplicitAny: Elasticsearch hit can have any structure
			result.hits.hits.map(async (hit: any) => {
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
			document: createDto
		});
	}

	async createMany(createManyDto: CreateDocumentDto[]) {
		const operations = createManyDto.flatMap((createDto) => [
			{ index: { _index: 'main', _id: `${createDto.type}_${createDto.id}` } },
			createDto
		]);

		await this.elasticsearchService.bulk({
			refresh: true,
			operations
		});
	}

	async update(id: string, updateDto: UpdateDocumentDto) {
		await this.elasticsearchService.update({
			index: 'main',
			id,
			doc: updateDto
		});
	}

	async delete(id: string) {
		await this.elasticsearchService.delete({
			index: 'main',
			id
		});
	}
}
