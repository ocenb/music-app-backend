import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';

@Module({
	providers: [TokenService, PrismaService, JwtStrategy],
	imports: [
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService): JwtModuleOptions => ({
				secret: configService.getOrThrow<string>('JWT_SECRET')
			})
		}),
		forwardRef(() => UserModule),
		PassportModule
	],
	exports: [TokenService]
})
export class TokenModule {}
