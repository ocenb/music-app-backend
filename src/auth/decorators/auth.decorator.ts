import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function Auth() {
	return applyDecorators(
		UseGuards(AuthGuard('jwt')),
		ApiCookieAuth(),
		ApiUnauthorizedResponse({ description: 'Unauthorized' })
	);
}
