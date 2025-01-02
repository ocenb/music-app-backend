import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TrackModule } from './track/track.module';
import { PlaylistModule } from './playlist/playlist.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileModule } from './file/file.module';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthMiddleware } from './auth/auth.middleware';
import { AlbumModule } from './album/album.module';
import { NotificationModule } from './notification/notification.module';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', '..', 'static', 'images')
		}),
		ScheduleModule.forRoot(),
		CacheModule.registerAsync({
			inject: [ConfigService],
			isGlobal: true,
			useFactory: async (configService: ConfigService) => {
				const store = await redisStore({
					socket: {
						host: configService.getOrThrow<string>('REDIS_HOST'),
						port: parseInt(configService.getOrThrow<string>('REDIS_PORT'), 10)
					}
				});

				return {
					store: store as unknown as CacheStore,
					ttl: 0
				};
			}
		}),
		AlbumModule,
		AuthModule,
		FileModule,
		PlaylistModule,
		TrackModule,
		UserModule,
		NotificationModule
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
