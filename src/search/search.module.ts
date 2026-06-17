import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AlbumModule } from 'src/album/album.module';
import { TrackModule } from 'src/track/track.module';
import { UserModule } from 'src/user/user.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

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
				node: configService.get('ELASTICSEARCH_URL')
			}),
			inject: [ConfigService]
		})
	],
	exports: [SearchService]
})
export class SearchModule {}
