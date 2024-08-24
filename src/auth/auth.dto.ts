import { IsEmail, IsNotIn, IsString, Length, Matches } from 'class-validator';

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
	@Matches(/^[\w!@#$%^&*?-]*$/, {
		message: 'Password can only contain letters, numbers and !@#$%^&*?-_'
	})
	password: string;
}

export class RegisterDto extends LoginDto {
	@Length(1, 20)
	@IsString()
	@Matches(/^[a-z0-9][a-z0-9_-]*$/, {
		message:
			'username can only contain lowercase letters, numbers, hyphens, underscores and cannot start with a hyphen or underscore'
	})
	@IsNotIn(restrictedUsernames)
	username: string;
}

export class ChangeEmailDto {
	@IsEmail()
	email: string;
}

export class ChangePasswordDto {
	@Length(5, 50)
	@IsString()
	@Matches(/^[\w!@#$%^&*?-]*$/, {
		message: 'Password can only contain letters, numbers and !@#$%^&*?-_'
	})
	oldPassword: string;

	@Length(5, 50)
	@IsString()
	@Matches(/^[\w!@#$%^&*?-]*$/, {
		message: 'Password can only contain letters, numbers and !@#$%^&*?-_'
	})
	newPassword: string;
}
