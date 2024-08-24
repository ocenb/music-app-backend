import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from 'config/multer.config';
import { FileController } from './file.controller';

@Module({
	controllers: [FileController],
	providers: [FileService],
	imports: [MulterModule.register(multerConfig)],
	exports: [FileService]
})
export class FileModule {}
