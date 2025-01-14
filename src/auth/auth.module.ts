import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { TokenModule } from './token/token.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [forwardRef(() => UserModule), TokenModule, MailModule],
	exports: [AuthService]
})
export class AuthModule {}
