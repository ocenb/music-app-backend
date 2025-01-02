import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { UploadedFilesDto } from 'src/track/track.dto';

const audioFormats = [
	'.mp3',
	'.aac',
	'.m4a',
	'.flac',
	'.wav',
	'.aiff',
	'.webm'
];
const imageFormats = ['.jpg', '.png'];

@Injectable()
export class AudioValidationPipe implements PipeTransform {
	constructor(private readonly configService: ConfigService) {}

	transform(audio: Express.Multer.File) {
		validateAudio(
			audio,
			parseInt(this.configService.getOrThrow<string>('AUDIO_FILE_LIMIT'), 10)
		);

		return audio;
	}
}

@Injectable()
export class ImageAndAudiosValidationPipe implements PipeTransform {
	constructor(private readonly configService: ConfigService) {}

	transform(files: {
		image: [Express.Multer.File];
		audios: Express.Multer.File[];
	}) {
		validateImage(
			files.image[0],
			parseInt(this.configService.getOrThrow<string>('IMAGE_FILE_LIMIT'), 10)
		);
		files.audios.forEach((audio) =>
			validateAudio(
				audio,
				parseInt(this.configService.getOrThrow<string>('AUDIO_FILE_LIMIT'), 10)
			)
		);

		return files;
	}
}

@Injectable()
export class ImageValidationPipe implements PipeTransform {
	constructor(private readonly configService: ConfigService) {}

	transform(image: Express.Multer.File) {
		validateImage(
			image,
			parseInt(this.configService.getOrThrow<string>('IMAGE_FILE_LIMIT'), 10)
		);

		return image;
	}
}

@Injectable()
export class ImageOptionalValidationPipe implements PipeTransform {
	constructor(private readonly configService: ConfigService) {}

	transform(image: Express.Multer.File) {
		if (image) {
			validateImage(
				image,
				parseInt(this.configService.getOrThrow<string>('IMAGE_FILE_LIMIT'), 10)
			);
		}

		return image;
	}
}

@Injectable()
export class AudioImageValidationPipe implements PipeTransform {
	constructor(private readonly configService: ConfigService) {}

	transform(files: UploadedFilesDto) {
		if (!files) {
			throw new BadRequestException('Audio and image files are required');
		}
		if (!files.audio) {
			throw new BadRequestException('Audio file is required');
		}
		if (!files.image) {
			throw new BadRequestException('Image file is required');
		}

		validateAudio(
			files.audio[0],
			parseInt(this.configService.getOrThrow<string>('AUDIO_FILE_LIMIT'), 10)
		);
		validateImage(
			files.image[0],
			parseInt(this.configService.getOrThrow<string>('IMAGE_FILE_LIMIT'), 10)
		);

		return files;
	}
}

function validateAudio(audioFile: Express.Multer.File, audioFileLimit: number) {
	if (!audioFile) {
		throw new BadRequestException('Audio file is required');
	}

	const fileFormat = extname(audioFile.originalname).toLowerCase();
	if (!audioFormats.includes(fileFormat)) {
		throw new BadRequestException(
			`Supported formats for audio: ${audioFormats.join(', ')}`
		);
	}

	if (audioFile.size > audioFileLimit) {
		throw new BadRequestException(
			`Audio file is too large (max ${audioFileLimit / 1048576} MB)`
		);
	}
}

function validateImage(imageFile: Express.Multer.File, imageFileLimit: number) {
	if (!imageFile) {
		throw new BadRequestException('Image file is required');
	}

	const fileFormat = extname(imageFile.originalname).toLowerCase();
	if (!imageFormats.includes(fileFormat)) {
		throw new BadRequestException(
			`Supported formats for image: ${imageFormats.join(', ')}`
		);
	}

	if (imageFile.size > imageFileLimit) {
		throw new BadRequestException(
			`Image file is too large (max ${imageFileLimit / 1048576} MB)`
		);
	}
}
