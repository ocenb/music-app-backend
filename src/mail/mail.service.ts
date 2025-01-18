import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
	private transporter: nodemailer.Transporter;

	constructor(private readonly configService: ConfigService) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.getOrThrow<string>('SMTP_HOST'),
			port: parseInt(this.configService.getOrThrow<string>('SMTP_PORT'), 10),
			secure: false
		});
	}

	async sendVerificationMail(to: string, verificationToken: string) {
		const verificationLink = `${this.configService.getOrThrow<string>('DOMAIN')}/verify?token=${verificationToken}`;

		await this.sendMail(
			to,
			'Verification',
			`Please confirm your registration by clicking this link: ${verificationLink}`,
			`<p>Please confirm your registration by clicking this link:</p><a href="${verificationLink}">Confirm</a>`
		);
	}

	private async sendMail(
		to: string,
		subject: string,
		text: string,
		html?: string
	) {
		await this.transporter.sendMail({
			from: '"Music app" <your-email@example.com>',
			to,
			subject,
			text,
			html
		});
	}
}
