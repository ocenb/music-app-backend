import { ApiProperty } from '@nestjs/swagger';

export function ApiFile() {
	return ApiProperty({
		format: 'binary',
		description: 'File'
	});
}

export function ApiDate() {
	return ApiProperty({
		example: '2024-01-01T00:00:00.000Z'
	});
}
