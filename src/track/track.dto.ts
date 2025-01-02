import { PartialType } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { ApiFile } from 'src/decorators/api.decorator';
import { ChangeableId, Title } from 'src/decorators/validation.decorator';

export class UploadTrackDto {
	@IsString()
	@Length(1, 20)
	@Title()
	title: string;

	@IsString()
	@Length(1, 20)
	@ChangeableId()
	changeableId: string;
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

export class UpdateTrackDtoWithImage extends UpdateTrackDto {
	@ApiFile()
	image?: string;
}
