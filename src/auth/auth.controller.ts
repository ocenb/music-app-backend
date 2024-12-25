import {
	Body,
	Controller,
	HttpCode,
	Patch,
	Post,
	Req,
	Res,
	UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
	ChangeEmailDto,
	ChangePasswordDto,
	LoginDto,
	RegisterDto
} from './auth.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenId } from './decorators/token-id.decorator';
import { User } from './decorators/user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserPrivate } from 'src/user/user.entities';
import { Auth } from './decorators/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	@Post('register')
	@ApiOperation({ summary: 'Register' })
	@ApiResponse({ status: 201, type: UserPrivate })
	async register(
		@Body() registerDto: RegisterDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken, user } =
			await this.authService.register(registerDto);
		this.authService.addTokensToResponse(res, accessToken, refreshToken);
		return user;
	}

	@Post('login')
	@ApiOperation({ summary: 'Login' })
	@ApiResponse({ status: 201, type: UserPrivate })
	async login(
		@Body() loginDto: LoginDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken, user } =
			await this.authService.login(loginDto);
		this.authService.addTokensToResponse(res, accessToken, refreshToken);
		return user;
	}

	@Post('logout')
	@Auth()
	@HttpCode(204)
	@ApiOperation({ summary: 'Logout' })
	@ApiResponse({ status: 204 })
	async logout(
		@TokenId() tokenId: string,
		@Res({ passthrough: true }) res: Response
	) {
		this.authService.logout(tokenId);
		this.authService.removeTokensFromResponse(res);
	}

	@Post('logout-all')
	@Auth()
	@HttpCode(204)
	@ApiOperation({ summary: 'Logout everywhere' })
	@ApiResponse({ status: 204 })
	async logoutAll(
		@User('id') userId: number,
		@Res({ passthrough: true }) res: Response
	) {
		this.authService.logoutAll(userId);
		this.authService.removeTokensFromResponse(res);
	}

	@Post('login/refresh')
	@ApiOperation({ summary: 'Gets new jwt tokens' })
	@ApiResponse({ status: 201, type: UserPrivate })
	async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		const refreshTokenFromCookies =
			req.cookies[this.configService.get('REFRESH_TOKEN')];
		if (!refreshTokenFromCookies) {
			this.authService.removeTokensFromResponse(res);
			throw new UnauthorizedException('Refresh token not passed');
		}
		try {
			const { accessToken, refreshToken, user } =
				await this.authService.refresh(refreshTokenFromCookies);
			this.authService.addTokensToResponse(res, accessToken, refreshToken);
			return user;
		} catch (err) {
			this.authService.removeTokensFromResponse(res);
			throw err;
		}
	}

	@Patch('email')
	@Auth()
	@ApiOperation({ summary: 'Changes email' })
	@ApiResponse({ status: 200, type: UserPrivate })
	async changeEmail(
		@User('id') userId: number,
		@Body() changeEmailDto: ChangeEmailDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken, user } =
			await this.authService.changeEmail(userId, changeEmailDto);
		this.authService.addTokensToResponse(res, accessToken, refreshToken);
		return user;
	}

	@Patch('password')
	@Auth()
	@ApiOperation({ summary: 'Changes password' })
	@ApiResponse({ status: 200, type: UserPrivate })
	async changePassword(
		@User('id') userId: number,
		@User('password') password: string,
		@Body() changePasswordDto: ChangePasswordDto,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken, refreshToken, user } =
			await this.authService.changePassword(
				userId,
				password,
				changePasswordDto
			);
		this.authService.addTokensToResponse(res, accessToken, refreshToken);
		return user;
	}
}
