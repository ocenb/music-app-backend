import { IsNotIn, IsOptional, IsString, Length } from 'class-validator';
import { restrictedUsernames } from 'src/auth/auth.dto';
import { ApiFile } from 'src/decorators/api.decorator';
import { Username } from 'src/decorators/validation.decorator';

export class UpdateUserDto {
	@IsOptional()
	@Length(1, 20)
	@IsString()
	@Username()
	@IsNotIn(restrictedUsernames)
	username?: string;
}

// For Swagger

export class UpdateUserDtoWithImage extends UpdateUserDto {
	@ApiFile()
	image?: string;
}
