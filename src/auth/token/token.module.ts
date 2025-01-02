import { forwardRef, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

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
