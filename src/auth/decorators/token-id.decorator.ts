import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const TokenId = createParamDecorator((_data, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const tokenId: string = request.user.tokenId;

	return tokenId;
});
