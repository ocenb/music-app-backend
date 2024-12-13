import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Payload } from './models/payload.model';
import { TokenService } from './token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly tokenService: TokenService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET')
		});
	}

	async validate(payload: Payload) {
		const { userId, tokenId } = payload;
		if (!userId || !tokenId) {
			throw new UnauthorizedException('Invalid access token');
		}
		const user = await this.userService.getFullById(userId);
		if (!user) {
			throw new UnauthorizedException('Invalid user');
		}
		const token = await this.tokenService.getTokenById(tokenId);
		if (!token) {
			throw new UnauthorizedException('Invalid access token');
		}
		return { user, tokenId };
	}
}
