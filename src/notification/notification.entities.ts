import { ApiDate } from 'src/decorators/api.decorator';

export class Notification {
	notification: NotificationInfo;
}

class NotificationInfo {
	id: number;
	message: string;
	link: string;
	@ApiDate()
	createdAt: string;
}
