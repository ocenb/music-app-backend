import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly configService: ConfigService) {}

	use(req: Request, res: Response, next: NextFunction) {
		const accessToken = req.cookies[this.configService.get('ACCESS_TOKEN')];
		if (accessToken) {
			req.headers.authorization = `Bearer ${accessToken}`;
		}
		next();
	}
}
