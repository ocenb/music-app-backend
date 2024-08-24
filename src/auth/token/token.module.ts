import { forwardRef, Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PrismaService } from 'src/prisma.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
	providers: [TokenService, PrismaService, JwtStrategy],
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService): JwtModuleOptions => ({
				secret: configService.get('JWT_SECRET')
			})
		}),
		forwardRef(() => UserModule),
		ConfigModule,
		PassportModule
	],
	exports: [TokenService]
})
export class TokenModule {}
