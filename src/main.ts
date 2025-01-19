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
	const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');

	app.setGlobalPrefix('api');
	app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
	app.useGlobalPipes(
		new ValidationPipe({
			forbidNonWhitelisted: true,
			whitelist: true,
			transform: true
		})
	);
	app.use(cookieParser());
	app.enableCors({
		origin: [frontendUrl],
		credentials: true,
		exposedHeaders: 'set-cookie'
	});

	const config = new DocumentBuilder()
		.setTitle('musicapp.fun')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document, {
		jsonDocumentUrl: '/api/docs/json',
		yamlDocumentUrl: '/api/docs/yaml'
	});

	await app.listen(port, () => console.log(`Port: ${port}`));
}

bootstrap();
