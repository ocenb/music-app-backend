import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import {
	ChangeEmailDto,
	ChangePasswordDto,
	LoginDto,
	RegisterDto
} from './auth.dto';
import { hash, compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { TokenService } from './token/token.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
	accessTokenName: string =
		this.configService.getOrThrow<string>('ACCESS_TOKEN');
	refreshTokenName: string =
		this.configService.getOrThrow<string>('REFRESH_TOKEN');

	constructor(
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly mailService: MailService
	) {}

	async register(registerDto: RegisterDto) {
		const userByEmail = await this.userService.getByEmail(registerDto.email);
		if (userByEmail) {
			throw new BadRequestException('User with the same email already exists');
		}

		const userByName = await this.userService.getByNameWithoutError(
			registerDto.username
		);
		if (userByName) {
			throw new BadRequestException('User with the same name already exists');
		}

		const hashedPassword = await hash(registerDto.password, 5);
		const verificationToken = this.tokenService.generateVerificationToken();

		const user = await this.userService.create({
			...registerDto,
			password: hashedPassword,
			verificationToken
		});

		await this.mailService.sendVerificationMail(
			registerDto.email,
			verificationToken
		);

		return user;
	}

	async login(loginDto: LoginDto) {
		const userByEmail = await this.userService.getByEmail(loginDto.email);
		if (!userByEmail) {
			throw new NotFoundException('User with this email does not exist');
		}

		const {
			password,
			isVerified,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			verificationToken,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			verificationTokenExpiresAt,
			...user
		} = userByEmail;

		const isPassCorrect = await compare(loginDto.password, password);
		if (!isPassCorrect) {
			throw new UnauthorizedException('Wrong password');
		}

		if (!isVerified) {
			throw new BadRequestException('User is not verified');
		}

		const tokens = await this.tokenService.createTokens(user.id);

		return { user, ...tokens };
	}

	async logout(tokenId: string) {
		await this.tokenService.revokeTokenById(tokenId);
	}

	async logoutAll(userId: number) {
		await this.tokenService.revokeAllTokens(userId);
	}

	async refresh(oldRefreshToken: string) {
		const { user, tokenId } =
			await this.tokenService.validateRefreshToken(oldRefreshToken);

		await this.tokenService.revokeTokenById(tokenId);
		const tokens = await this.tokenService.createTokens(user.id);

		return { user, ...tokens };
	}

	async verify(verificationToken: string) {
		const userByToken = await this.userService.getByToken(verificationToken);

		if (!userByToken) {
			throw new NotFoundException('Token not found');
		}

		if (userByToken.verificationTokenExpiresAt < new Date()) {
			throw new BadRequestException('Token expired');
		}

		const verifiedUser = await this.userService.setVerified(userByToken.id);

		const tokens = await this.tokenService.createTokens(userByToken.id);

		return { user: verifiedUser, ...tokens };
	}

	async newVerification(newVerificationDto: LoginDto) {
		const userByEmail = await this.userService.getByEmail(
			newVerificationDto.email
		);
		if (!userByEmail) {
			throw new NotFoundException('User with this email does not exist');
		}

		const isPassCorrect = await compare(
			newVerificationDto.password,
			userByEmail.password
		);
		if (!isPassCorrect) {
			throw new UnauthorizedException('Wrong password');
		}

		if (userByEmail.isVerified) {
			throw new BadRequestException('User is already verified');
		}

		const newVerificationToken = this.tokenService.generateVerificationToken();

		const user = await this.userService.updateVerificationToken(
			userByEmail.id,
			newVerificationToken
		);

		await this.mailService.sendVerificationMail(
			userByEmail.email,
			newVerificationToken
		);

		return user;
	}

	async changeEmail(userId: number, changeEmailDto: ChangeEmailDto) {
		const user = await this.userService.changeEmail(
			userId,
			changeEmailDto.email
		);
		await this.logoutAll(userId);

		const tokens = await this.tokenService.createTokens(userId);

		return { user, ...tokens };
	}

	async changePassword(
		userId: number,
		password: string,
		changePasswordDto: ChangePasswordDto
	) {
		const isPassCorrect = await compare(
			changePasswordDto.oldPassword,
			password
		);
		if (!isPassCorrect) {
			throw new UnauthorizedException('Wrong password');
		}

		const hashedPassword = await hash(changePasswordDto.newPassword, 5);

		const user = await this.userService.changePassword(userId, hashedPassword);
		await this.logoutAll(userId);

		const tokens = await this.tokenService.createTokens(userId);

		return { user, ...tokens };
	}

	addTokensToResponse(
		res: Response,
		accessToken: string,
		refreshToken: string
	) {
		const accessTokenExpiresAt = new Date();
		const refreshTokenExpiresAt = new Date();
		accessTokenExpiresAt.setMinutes(accessTokenExpiresAt.getMinutes() + 30);
		refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30);

		res.cookie(this.accessTokenName, accessToken, {
			httpOnly: true,
			domain: this.configService.getOrThrow<string>('DOMAIN'),
			expires: accessTokenExpiresAt,
			secure: true,
			sameSite: 'lax'
		});
		res.cookie(this.refreshTokenName, refreshToken, {
			httpOnly: true,
			domain: this.configService.getOrThrow<string>('DOMAIN'),
			expires: refreshTokenExpiresAt,
			secure: true,
			sameSite: 'lax'
		});
	}

	removeTokensFromResponse(res: Response) {
		res.cookie(this.accessTokenName, '', {
			httpOnly: true,
			domain: this.configService.getOrThrow<string>('DOMAIN'),
			expires: new Date(0),
			secure: true,
			sameSite: 'lax'
		});
		res.cookie(this.refreshTokenName, '', {
			httpOnly: true,
			domain: this.configService.getOrThrow<string>('DOMAIN'),
			expires: new Date(0),
			secure: true,
			sameSite: 'lax'
		});
	}
}
