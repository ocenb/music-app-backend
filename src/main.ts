import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const configService = app.get(ConfigService);
	const port = configService.getOrThrow<string>('PORT');
	const frontendPort = configService.getOrThrow<string>('FRONTEND_PORT');
	const url = configService.getOrThrow<string>('URL');

	app.setGlobalPrefix('api');
	app.use(helmet());
	app.useGlobalPipes(
		new ValidationPipe({
			forbidNonWhitelisted: true,
			whitelist: true,
			transform: true
		})
	);
	app.use(cookieParser());
	app.enableCors({
		origin: [`${url}:${frontendPort}`],
		credentials: true,
		exposedHeaders: 'set-cookie'
	});

	const config = new DocumentBuilder()
		.setTitle('Music app')
		.setVersion('1.0')
		.addCookieAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	await app.listen(port, () => console.log(`${url}:${port}`));
}

bootstrap();
