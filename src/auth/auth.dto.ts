import { IsEmail, IsNotIn, IsString, Length } from 'class-validator';
import { Password, Username } from 'src/decorators/validation.decorator';

export const restrictedUsernames = [
	'login',
	'signup',
	'logout',
	'library',
	'upload',
	'settings'
];

export class LoginDto {
	@IsEmail()
	email: string;

	@Length(5, 50)
	@IsString()
	@Password()
	password: string;
}

export class RegisterDto extends LoginDto {
	@Length(1, 20)
	@IsString()
	@Username()
	@IsNotIn(restrictedUsernames)
	username: string;
}

export class CreateUserDto extends RegisterDto {
	verificationToken: string;
}

export class ChangeEmailDto {
	@IsEmail()
	email: string;
}

export class ChangePasswordDto {
	@Length(5, 50)
	@IsString()
	@Password()
	oldPassword: string;

	@Length(5, 50)
	@IsString()
	@Password()
	newPassword: string;
}
