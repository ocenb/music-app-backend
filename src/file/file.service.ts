import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	StreamableFile
} from '@nestjs/common';
import { extname, join } from 'path';
import { createReadStream, statSync, promises as fs } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

type FileCategory = 'audio' | 'images';
ffmpeg.setFfprobePath('C:\\Program files\\ffmpeg\\bin\\ffprobe.exe'); //

@Injectable()
export class FileService {
	streamAudio(fileName: string) {
		const filePath = join(
			__dirname,
			'..',
			'..',
			'..',
			'static',
			'audio',
			fileName
		);
		const file = createReadStream(filePath);
		const size = statSync(filePath).size;
		return { streamableFile: new StreamableFile(file), size };
	}

	// async getAudioDuration(audio: Express.Multer.File) {
	// 	const fileFormat = extname(audio.originalname).toLowerCase();
	// 	const fileName = uuidv4() + fileFormat;
	// 	const filePath = join(
	// 		__dirname,
	// 		'..',
	// 		'..',
	// 		'..',
	// 		'static',
	// 		'audio',
	// 		fileName
	// 	);
	// 	await this.writeFile(filePath, audio.buffer);
	// 	const duration = await this.getTrackDuration(filePath);
	// 	await this.deleteFileByPath(filePath);
	// 	return duration;
	// }

	async saveAudio(file: Express.Multer.File): Promise<Express.Multer.File> {
		const fileFormat = extname(file.originalname).toLowerCase();
		const fileDestination = join(
			__dirname,
			'..',
			'..',
			'..',
			'static',
			'audio'
		);
		const uuid = uuidv4();
		const fileName = uuid + fileFormat;
		const filePath = join(fileDestination, fileName);
		const outputFileName = uuid + '.webm';
		const outputFilePath = join(fileDestination, outputFileName);
		await this.writeFile(filePath, file.buffer);
		if (fileFormat !== '.webm') {
			return new Promise((resolve, reject) => {
				ffmpeg(filePath)
					.toFormat('webm')
					.audioCodec('libvorbis')
					.on('end', () => {
						this.deleteFileByPath(filePath);
						file.filename = outputFileName;
						file.path = outputFilePath;
						resolve(file);
					})
					.on('error', () => {
						this.deleteFileByPath(filePath);
						reject(
							new InternalServerErrorException('Error while converting file')
						);
					})
					.save(outputFilePath);
			});
		} else {
			file.filename = fileName;
			file.path = filePath;
			return file;
		}
	}

	async saveImage(file: Express.Multer.File) {
		const fileName = uuidv4();
		const filePath = join(
			__dirname,
			'..',
			'..',
			'..',
			'static',
			'images',
			fileName
		);
		const filePath250 = `${filePath}_250x250.jpg`;
		const filePath50 = `${filePath}_50x50.jpg`;

		await sharp(file.buffer)
			.resize(250, 250, { fit: 'cover', position: 'center' })
			.toFile(filePath250);
		await sharp(file.buffer)
			.resize(50, 50, { fit: 'cover', position: 'center' })
			.toFile(filePath50);

		file.filename = fileName;
		file.path = filePath;
		return file;
	}

	async deleteFileByPath(filePath: string) {
		await this.checkIsFileExists(filePath);
		try {
			await fs.rm(filePath);
		} catch (err) {
			throw new InternalServerErrorException('Error while deleting file');
		}
	}

	async deleteFileByName(fileName: string, category: FileCategory) {
		const filePath = join(
			__dirname,
			'..',
			'..',
			'..',
			'static',
			category,
			fileName
		);
		if (category === 'images') {
			await this.deleteFileByPath(`${filePath}_250x250.jpg`);
			await this.deleteFileByPath(`${filePath}_50x50.jpg`);
		} else {
			await this.deleteFileByPath(filePath);
		}
	}

	async getTrackDuration(audioPath: string): Promise<number> {
		return new Promise((resolve, reject) => {
			ffmpeg.ffprobe(audioPath, (err, metadata) => {
				if (err) {
					return reject(err);
				}
				const duration = metadata.format.duration;
				resolve(Math.round(duration));
			});
		});
	}

	private async writeFile(filePath: string, fileBuffer: Buffer) {
		try {
			await fs.writeFile(filePath, fileBuffer);
		} catch (err) {
			throw new InternalServerErrorException('Error while writing file');
		}
	}

	private async checkIsFileExists(filePath: string): Promise<void> {
		try {
			await fs.access(filePath, fs.constants.F_OK);
		} catch (err) {
			throw new NotFoundException("File doesn't exists");
		}
	}
}
