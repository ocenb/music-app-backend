import {
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { User } from 'src/auth/decorators/user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Notification } from './notification.entities';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Notification')
@Auth()
@Controller('notification')
export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	@Get()
	@ApiOperation({ summary: 'Gets all notifications' })
	@ApiResponse({ status: 200, type: [Notification] })
	async getAll(@User('id') userId: number) {
		return await this.notificationService.getAll(userId);
	}

	@Delete(':notificationId')
	@HttpCode(204)
	@ApiOperation({ summary: 'Deletes notification' })
	@ApiResponse({ status: 204 })
	async delete(
		@User('id') userId: number,
		@Param('notificationId', ParseIntPipe) notificationId: number
	) {
		await this.notificationService.delete(userId, notificationId);
	}

	@Delete('all')
	@HttpCode(204)
	@ApiOperation({ summary: 'Deletes all notifications' })
	@ApiResponse({ status: 204 })
	async deleteAll(@User('id') userId: number) {
		await this.notificationService.deleteAll(userId);
	}
}
