import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from './token/token.module';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [forwardRef(() => UserModule), TokenModule, ConfigModule],
	exports: [AuthService]
})
export class AuthModule {}
