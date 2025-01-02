import { PartialType } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { ApiFile } from 'src/decorators/api.decorator';
import { ChangeableId, Title } from 'src/decorators/validation.decorator';

export class CreatePlaylistDto {
	@Length(1, 20)
	@IsString()
	@Title()
	title: string;

	@Length(1, 20)
	@IsString()
	@ChangeableId()
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
