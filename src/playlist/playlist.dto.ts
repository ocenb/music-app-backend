import { PartialType } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { ApiFile } from 'src/decorators/api.decorator';

export class CreatePlaylistDto {
	@Length(1, 20)
	@IsString()
	@Matches(/^[^\s][\s\S]*$/, {
		message: 'Title cannot start with a space'
	})
	title: string;

	@Length(1, 20)
	@IsString()
	@Matches(/^[a-z0-9][a-z0-9_-]*$/, {
		message:
			'changeableId can only contain lowercase letters, numbers, hyphens, underscores and cannot start with a hyphen or underscore'
	})
	changeableId: string;
}

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {}

// For Swagger

export class CreatePlaylistDtoWithImage extends CreatePlaylistDto {
	@ApiFile()
	image: string;
}

export class UpdatePlaylistDtoWithImage extends UpdatePlaylistDto {
	@ApiFile()
	image?: string;
}
