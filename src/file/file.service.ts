import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { extname, join } from 'path';
import { promises as fs } from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary, UploadApiErrorResponse } from 'cloudinary';
import * as sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
import { Express } from 'express';

type FileCategory = 'audio' | 'images';

@Injectable()
export class FileService {
	constructor(private readonly configService: ConfigService) {
		ffmpeg.setFfprobePath(configService.getOrThrow<string>('FFPROBE_PATH'));
	}

	async saveAudio(
		file: Express.Multer.File
	): Promise<{ fileName: string; duration: number }> {
		const fileFormat = extname(file.originalname).toLowerCase();
		const fileDestination = join(__dirname, '..', '..', 'temp');
		const fileName = uuidv4();

		const tempFileName = `${fileName}_temp${fileFormat}`;
		const tempFilePath = join(fileDestination, tempFileName);

		const outputFileName = `${fileName}.webm`;
		const outputFilePath = join(fileDestination, outputFileName);

		await this.writeFile(tempFilePath, file.buffer);

		if (fileFormat !== '.webm') {
			return new Promise((resolve, reject) => {
				ffmpeg(tempFilePath)
					.toFormat('webm')
					.audioCodec('libvorbis')
					.audioFilters('dynaudnorm')
					.on('end', async () => {
						const duration = await this.getTrackDuration(outputFilePath);

						try {
							await this.uploadToCloudinary(outputFilePath, fileName, 'audio');

							this.deleteFileByPathIfExists(tempFilePath);
							this.deleteFileByPathIfExists(outputFilePath);

							resolve({ fileName, duration });
						} catch {
							this.deleteFileByPathIfExists(tempFilePath);
							this.deleteFileByPathIfExists(outputFilePath);
							reject(
								new InternalServerErrorException(
									'Error uploading to Cloudinary'
								)
							);
						}
					})
					.on('error', () => {
						this.deleteFileByPathIfExists(tempFilePath);
						this.deleteFileByPathIfExists(outputFilePath);

						reject(
							new InternalServerErrorException('Error while converting file')
						);
					})
					.save(outputFilePath);
			});
		} else {
			return new Promise((resolve, reject) => {
				ffmpeg(tempFilePath)
					.audioFilters('dynaudnorm')
					.on('end', async () => {
						const duration = await this.getTrackDuration(outputFilePath);

						try {
							await this.uploadToCloudinary(outputFilePath, fileName, 'audio');

							this.deleteFileByPathIfExists(tempFilePath);
							this.deleteFileByPathIfExists(outputFilePath);

							resolve({ fileName, duration });
						} catch {
							this.deleteFileByPathIfExists(tempFilePath);
							this.deleteFileByPathIfExists(outputFilePath);

							reject(
								new InternalServerErrorException(
									'Error uploading to Cloudinary'
								)
							);
						}
					})
					.on('error', () => {
						this.deleteFileByPathIfExists(tempFilePath);
						this.deleteFileByPathIfExists(outputFilePath);

						reject(
							new InternalServerErrorException(
								'Error during audio file normalization'
							)
						);
					})
					.save(outputFilePath);
			});
		}
	}

	async saveImage(file: Express.Multer.File) {
		const fileName = uuidv4();
		const fileName250 = `${fileName}_250x250`;
		const fileName50 = `${fileName}_50x50`;
		const filePath250 = join(
			__dirname,
			'..',
			'..',
			'temp',
			`${fileName250}.jpg`
		);
		const filePath50 = join(__dirname, '..', '..', 'temp', `${fileName50}.jpg`);

		await sharp(file.buffer)
			.resize(250, 250, { fit: 'cover', position: 'center' })
			.toFile(filePath250);
		await sharp(file.buffer)
			.resize(50, 50, { fit: 'cover', position: 'center' })
			.toFile(filePath50);

		await this.uploadToCloudinary(filePath250, fileName250, 'images');
		await this.uploadToCloudinary(filePath50, fileName50, 'images');

		this.deleteFileByPathIfExists(filePath250);
		this.deleteFileByPathIfExists(filePath50);

		return fileName;
	}

	async deleteFileByName(fileName: string, category: FileCategory) {
		if (category === 'images') {
			await new Promise((resolve, reject) => {
				cloudinary.uploader.destroy(
					`images/${fileName}_250x250`,
					{ resource_type: 'image' },
					(error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
						if (error) return reject(error);
						resolve(result);
					}
				);
			});
			await new Promise((resolve, reject) => {
				cloudinary.uploader.destroy(
					`images/${fileName}_50x50`,
					{ resource_type: 'image' },
					(error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
						if (error) return reject(error);
						resolve(result);
					}
				);
			});
		} else {
			await new Promise((resolve, reject) => {
				cloudinary.uploader.destroy(
					`audio/${fileName}`,
					{ resource_type: 'raw' },
					(error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
						if (error) return reject(error);
						resolve(result);
					}
				);
			});
		}
	}

	private async uploadToCloudinary(
		filePath: string,
		fileName: string,
		category: FileCategory
	): Promise<UploadApiResponse> {
		const resource_type = category === 'audio' ? 'raw' : 'image';

		return new Promise((resolve, reject) => {
			cloudinary.uploader.upload(
				filePath,
				{ resource_type, public_id: fileName, folder: category },
				(error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
					if (error) return reject(error);
					resolve(result);
				}
			);
		});
	}

	private async getTrackDuration(audioPath: string): Promise<number> {
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

	private async deleteFileByPathIfExists(filePath: string) {
		const isFileExists = await this.checkIsFileExists(filePath);

		if (isFileExists) {
			try {
				await fs.rm(filePath);
			} catch {
				throw new InternalServerErrorException('Error while deleting file');
			}
		}
	}

	private async writeFile(filePath: string, fileBuffer: Buffer) {
		try {
			await fs.writeFile(filePath, fileBuffer);
		} catch {
			throw new InternalServerErrorException('Error while writing file');
		}
	}

	private async checkIsFileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath, fs.constants.F_OK);
			return true;
		} catch {
			return false;
		}
	}
}
