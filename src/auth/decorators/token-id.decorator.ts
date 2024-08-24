import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TokenId = createParamDecorator((data, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const tokenId: string = request.user.tokenId;
	return tokenId;
});
