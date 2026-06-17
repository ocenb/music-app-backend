import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Query,
	Res,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger';
import { User as UserModel } from '@prisma/client';
import { Express, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { User } from 'src/auth/decorators/user.decorator';
import { ImageOptionalValidationPipe } from 'src/pipes/files-validation.pipe';
import { ParseIntOptionalPipe } from 'src/pipes/parse-int-optional.pipe';
import { type UpdateUserDto, UpdateUserDtoWithImage } from './user.dto';
import { UserPrivate, UserPublic } from './user.entities';
import { UserService } from './user.service';

@ApiTags('User')
@Auth()
@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService
	) {}

	@Get('current')
	@ApiOperation({ summary: 'Gets current user' })
	@ApiResponse({ status: 200, type: UserPrivate })
	async getCurrent(@User() user: UserModel) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userData } = user;
		return userData;
	}

	@Get('by-name/:username')
	@ApiOperation({ summary: 'Gets user by name' })
	@ApiResponse({ status: 200, type: UserPublic })
	async getByName(@Param('username') username: string) {
		return await this.userService.getByName(username);
	}

	@Get('recommended')
	@ApiOperation({ summary: 'Gets recommended users' })
	@ApiResponse({ status: 200, type: [UserPublic] })
	async getRecommended() {
		return await this.userService.getRecommended();
	}

	@Get()
	@ApiOperation({ summary: 'Gets multiple users' })
	@ApiResponse({ status: 200, type: [UserPublic] })
	async getMany(
		@Query('take', ParseIntOptionalPipe) take?: number,
		@Query('lastId', ParseIntOptionalPipe) lastId?: number
	) {
		return await this.userService.getMany(take, lastId);
	}

	@Patch()
	@HttpCode(204)
	@UseInterceptors(FileInterceptor('image'))
	@ApiOperation({ summary: 'Changes user info' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		type: UpdateUserDtoWithImage
	})
	@ApiResponse({ status: 204 })
	async update(
		@User() user: UserModel,
		@Body() updateUserDto: UpdateUserDto,
		@UploadedFile(ImageOptionalValidationPipe) image?: Express.Multer.File
	) {
		await this.userService.update(user, updateUserDto, image);
	}

	@Delete()
	@HttpCode(204)
	@ApiOperation({ summary: 'Deletes user' })
	@ApiResponse({ status: 204 })
	async delete(
		@User('id') userId: number,
		@Res({ passthrough: true }) res: Response
	) {
		await this.userService.delete(userId);
		this.authService.removeTokensFromResponse(res);
	}
}
