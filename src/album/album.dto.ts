import { BadRequestException } from '@nestjs/common';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	isArray,
	IsEnum,
	IsString,
	Length,
	Matches,
	Validate,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';
import { ApiFile } from 'src/decorators/api.decorator';
import { UploadTrackDto } from 'src/track/track.dto';

export enum AlbumType {
	lp = 'lp',
	ep = 'ep'
}

@ValidatorConstraint()
export class IsTracksArray implements ValidatorConstraintInterface {
	public async validate(tracks: TrackToAdd[]) {
		if (!isArray(tracks)) {
			throw new BadRequestException('tracks should be an array');
		}
		const messages: string[] = [];
		tracks.forEach((track, index) => {
			if (Object.keys(track).length !== 3) {
				messages.push(
					`tracks.${index} object should have three properties: "title", "changeableId" and "position"`
				);
			}
			if (track.title && typeof track.title !== 'string') {
				messages.push(`tracks.${index} property "title" should be string`);
			}
			if (track.changeableId && typeof track.changeableId !== 'string') {
				messages.push(
					`tracks.${index} property "changeableId" should be string`
				);
			}
			if (track.position && typeof track.position !== 'number') {
				messages.push(`tracks.${index} property "position" should be number`);
			}
			if (
				track.position &&
				typeof track.position === 'number' &&
				track.position < 1
			) {
				messages.push(
					`tracks.${index} property "position" should be greater than 1`
				);
			}
		});
		if (messages.length) {
			throw new BadRequestException(messages);
		}
		return true;
	}
}

export class CreateAlbumDto {
	@Length(1, 20)
	@IsString()
	@Matches(/^[^\s][\s\S]*$/, {
		message: 'title cannot start with a space'
	})
	title: string;

	@Length(1, 20)
	@IsString()
	@Matches(/^[a-z0-9][a-z0-9_-]*$/, {
		message:
			'changeableId can only contain lowercase letters, numbers, hyphens, underscores and cannot start with a hyphen or underscore'
	})
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
	tracks: TrackToAdd[];
}

export class TrackToAdd extends UploadTrackDto {
	position: number;
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
