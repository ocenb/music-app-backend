import { Injectable, type NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly configService: ConfigService) {}

	use(req: Request, _res: Response, next: NextFunction) {
		const accessToken =
			req.cookies[this.configService.getOrThrow<string>('ACCESS_TOKEN')];

		if (accessToken) {
			req.headers.authorization = `Bearer ${accessToken}`;
		}

		next();
	}
}
