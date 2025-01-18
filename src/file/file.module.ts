import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
	providers: [FileService, CloudinaryProvider],
	imports: [MulterModule.register(multerConfig)],
	exports: [FileService]
})
export class FileModule {}
