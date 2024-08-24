import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileService } from './file.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('File')
@Auth()
@Controller('file')
export class FileController {
	constructor(private readonly fileService: FileService) {}

	@Get(':fileName')
	@ApiOperation({ summary: 'Gets an audio file' })
	@ApiResponse({ status: 200, type: StreamableFile })
	async getAudio(@Param('fileName') fileName: string) {
		return await this.fileService.getAudio(fileName);
	}
}
