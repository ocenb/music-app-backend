import { BadRequestException } from '@nestjs/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsString, Length, Validate } from 'class-validator';
import { ApiFile } from 'src/decorators/api.decorator';
import {
	ChangeableId,
	IsTracksArray,
	Title
} from 'src/decorators/validation.decorator';
import { UploadTrackDto } from 'src/track/track.dto';

export enum AlbumType {
	lp = 'lp',
	ep = 'ep'
}

export class CreateAlbumDto {
	@Length(1, 20)
	@IsString()
	@Title()
	title: string;

	@Length(1, 20)
	@IsString()
	@ChangeableId()
	changeableId: string;

	@IsString()
	@IsEnum(AlbumType)
	type: AlbumType;

	@Validate(IsTracksArray)
	@Transform(({ value }) => {
		try {
			return JSON.parse(value);
		} catch {
			throw new BadRequestException('tracks must be a valid JSON');
		}
	})
	tracks: UploadTrackDto[];
}

export class UpdateAlbumDto extends PartialType(
	OmitType(CreateAlbumDto, ['tracks'] as const)
) {}

// For Swagger

export class CreateAlbumDtoWithFiles extends CreateAlbumDto {
	@ApiFile()
	image: string;

	@ApiProperty({ format: 'binary', description: 'Array of files' })
	audios: string[];
}

export class UpdateAlbumDtoWithImage extends UpdateAlbumDto {
	@ApiFile()
	image?: string;
}
