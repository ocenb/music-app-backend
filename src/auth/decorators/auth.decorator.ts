import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth() {
	return applyDecorators(
		UseGuards(AuthGuard('jwt')),
		ApiUnauthorizedResponse({ description: 'Unauthorized' })
	);
}
