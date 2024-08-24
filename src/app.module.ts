import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
	imports: [
		ConfigModule.forRoot(),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', '..', 'static', 'images')
		}),
		ScheduleModule.forRoot(),
		AlbumModule,
		AuthModule,
		FileModule,
		PlaylistModule,
		TrackModule,
		UserModule
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
