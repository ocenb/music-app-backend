import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import {
	type MiddlewareConsumer,
	Module,
	type NestModule
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AlbumModule } from './album/album.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { MailModule } from './mail/mail.module';
import { NotificationModule } from './notification/notification.module';
import { PlaylistModule } from './playlist/playlist.module';
import { SearchModule } from './search/search.module';
import { TrackModule } from './track/track.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		ScheduleModule.forRoot(),
		CacheModule.registerAsync({
			inject: [ConfigService],
			isGlobal: true,
			useFactory: async (configService: ConfigService) => {
				return {
					stores: [
						new KeyvRedis(configService.getOrThrow<string>('REDIS_URL'))
					],
					ttl: 86400000
				};
			}
		}),
		ThrottlerModule.forRoot([
			{
				ttl: 60000,
				limit: 500
			}
		]),
		AlbumModule,
		AuthModule,
		FileModule,
		PlaylistModule,
		TrackModule,
		UserModule,
		NotificationModule,
		MailModule,
		SearchModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	]
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(AuthMiddleware)
			.exclude('auth/register', 'auth/login')
			.forRoutes('*');
	}
}
