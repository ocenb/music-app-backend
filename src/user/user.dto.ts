import {
	IsNotIn,
	IsOptional,
	IsString,
	Length,
	Matches
} from 'class-validator';
import { restrictedUsernames } from 'src/auth/auth.dto';
import { ApiFile } from 'src/decorators/api.decorator';

export class UpdateUserDto {
	@IsOptional()
	@Length(1, 20)
	@IsString()
	@Matches(/^[a-z0-9][a-z0-9_-]*$/, {
		message:
			'username can only contain lowercase letters, numbers, hyphens, underscores and cannot start with a hyphen or underscore'
	})
	@IsNotIn(restrictedUsernames)
	username?: string;
}

// For Swagger

export class UpdateUserDtoWithImage extends UpdateUserDto {
	@ApiFile()
	image?: string;
}
