import { forwardRef, Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AlbumModule } from 'src/album/album.module';
import { UserModule } from 'src/user/user.module';
import { TrackModule } from 'src/track/track.module';

@Module({
	controllers: [SearchController],
	providers: [SearchService],
	imports: [
		forwardRef(() => AlbumModule),
		forwardRef(() => UserModule),
		forwardRef(() => TrackModule),
		ElasticsearchModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				node: configService.get('ELASTICSEARCH_NODE')
			}),
			inject: [ConfigService]
		})
	],
	exports: [SearchService]
})
export class SearchModule {}
