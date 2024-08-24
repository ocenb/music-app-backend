import { BadRequestException } from '@nestjs/common';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	isArray,
	IsString,
	Length,
	Matches,
	Validate,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';
import { ApiFile } from 'src/decorators/api.decorator';

@ValidatorConstraint()
export class IsTracksArray implements ValidatorConstraintInterface {
	public async validate(tracks: UploadTrackDto[]) {
		if (!isArray(tracks)) {
			throw new BadRequestException('tracks should be an array');
		}
		const messages: string[] = [];
		tracks.forEach((track, index) => {
			if (Object.keys(track).length !== 2) {
				messages.push(
					`tracks.${index} object should have three properties: "title", "changeableId"`
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
		});
		if (messages.length) {
			throw new BadRequestException(messages);
		}
		return true;
	}
}

export class UploadTrackDto {
	@IsString()
	@Length(1, 20)
	@Matches(/^[^\s][\s\S]*$/, {
		message: 'title cannot start with a space'
	})
	title: string;

	@IsString()
	@Length(1, 20)
	@Matches(/^[a-z0-9][a-z0-9_-]*$/, {
		message:
			'changeableId can only contain lowercase letters, numbers, hyphens, underscores and cannot start with a hyphen or underscore'
	})
	changeableId: string;
}

export class UploadTracksDto {
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

export class UpdateTrackDto extends PartialType(UploadTrackDto) {}

export class UploadedFilesDto {
	image: Express.Multer.File[];
	audio: Express.Multer.File[];
}

// For Swagger

export class UploadTrackDtoWithFiles extends UploadTrackDto {
	@ApiFile()
	image: string;

	@ApiFile()
	audio: string;
}

export class UploadTracksDtoWithAudios extends UploadTracksDto {
	@ApiProperty({ format: 'binary', description: 'Array of files' })
	audios: string[];
}

export class UpdateTrackDtoWithImage extends UpdateTrackDto {
	@ApiFile()
	image?: string;
}
