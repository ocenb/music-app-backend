import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
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
const audioFileLimit = parseInt(process.env.AUDIO_FILE_LIMIT);
const imageFileLimit = parseInt(process.env.IMAGE_FILE_LIMIT);

@Injectable()
export class AudioValidationPipe implements PipeTransform {
	transform(audio: Express.Multer.File) {
		validateAudio(audio);
		return audio;
	}
}

@Injectable()
export class ImageAndAudiosValidationPipe implements PipeTransform {
	transform(files: {
		image: [Express.Multer.File];
		audios: Express.Multer.File[];
	}) {
		validateImage(files.image[0]);
		files.audios.forEach((audio) => validateAudio(audio));
		return files;
	}
}

@Injectable()
export class ImageValidationPipe implements PipeTransform {
	transform(image: Express.Multer.File) {
		validateImage(image);
		return image;
	}
}

@Injectable()
export class ImageOptionalValidationPipe implements PipeTransform {
	transform(image: Express.Multer.File) {
		if (image) {
			validateImage(image);
		}
		return image;
	}
}

@Injectable()
export class AudioImageValidationPipe implements PipeTransform {
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
		validateAudio(files.audio[0]);
		validateImage(files.image[0]);
		return files;
	}
}

function validateAudio(audioFile: Express.Multer.File) {
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

function validateImage(imageFile: Express.Multer.File) {
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
