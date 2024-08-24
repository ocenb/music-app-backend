import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { Payload, UserData } from './models/payload.model';
import { UserService } from 'src/user/user.service';
import { Interval } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
	private readonly logger = new Logger(TokenService.name);

	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly userService: UserService
	) {}

	async getTokenById(tokenId: string) {
		return await this.prismaService.token.findUnique({
			where: { id: tokenId }
		});
	}

	async createTokens(userId: number) {
		const { accessToken, refreshToken, tokenId, expiresAt } =
			this.generateTokens({
				userId
			});
		await this.prismaService.token.create({
			data: { id: tokenId, userId, refreshToken, expiresAt }
		});
		return { accessToken, refreshToken };
	}

	async revokeTokenById(tokenId: string) {
		await this.prismaService.token.delete({
			where: { id: tokenId }
		});
	}

	async revokeAllTokens(userId: number) {
		await this.prismaService.token.deleteMany({ where: { userId } });
	}

	async validateRefreshToken(refreshToken: string) {
		const payload: Payload = this.jwtService.verify(refreshToken);
		if (!payload) {
			throw new UnauthorizedException('Invalid refresh token');
		}
		const token = await this.prismaService.token.findUnique({
			where: { refreshToken }
		});
		if (!token) {
			throw new UnauthorizedException('Invalid refresh token');
		}
		const user = await this.userService.getById(payload.userId);
		return { user, tokenId: payload.tokenId };
	}

	private generateTokens(userData: UserData) {
		const tokenId = uuidv4();
		const payload = { tokenId, ...userData };
		const accessToken = this.jwtService.sign(payload, {
			expiresIn: '30d' //change to 30m later
		});
		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: '30d'
		});
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);
		return { accessToken, refreshToken, tokenId, expiresAt };
	}

	@Interval(86400000)
	async cleanUpTokens() {
		this.logger.log('Deleting expired tokens...');
		const result = await this.prismaService.token.deleteMany({
			where: { expiresAt: { lt: new Date() } }
		});
		this.logger.log(`Deleted ${result.count} expired tokens`);
	}
}
