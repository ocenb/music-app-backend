import { BadRequestException } from '@nestjs/common';
import {
	isArray,
	registerDecorator,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator';
import { UploadTrackDto } from 'src/track/track.dto';

const regex = {
	title: /^[^\s][\s\S]*$/,
	password: /^[\w!@#$%^&*?-]*$/,
	username: /^[a-z0-9][a-z0-9_-]*$/,
	changeableId: /^[a-z0-9][a-z0-9_-]*$/
};
const messages = {
	title: 'Title cannot start with a space',
	password: 'Password can only contain letters, numbers and !@#$%^&*?-_',
	username:
		'username can only contain lowercase letters, numbers, hyphens, underscores and cannot start with a hyphen or underscore',
	changeableId:
		'changeableId can only contain lowercase letters, numbers, hyphens, underscores and cannot start with a hyphen or underscore'
};

export function Title(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'Title',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: string) {
					return regex.title.test(value);
				},
				defaultMessage() {
					return messages.title;
				}
			}
		});
	};
}

export function ChangeableId(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'ChangeableId',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: string) {
					return regex.changeableId.test(value);
				},
				defaultMessage() {
					return messages.changeableId;
				}
			}
		});
	};
}

export function Password(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'Password',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: string) {
					return regex.password.test(value);
				},
				defaultMessage() {
					return messages.password;
				}
			}
		});
	};
}

export function Username(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'Username',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: string) {
					return regex.username.test(value);
				},
				defaultMessage() {
					return messages.username;
				}
			}
		});
	};
}

@ValidatorConstraint()
export class IsTracksArray implements ValidatorConstraintInterface {
	public async validate(tracks: UploadTrackDto[]) {
		if (!isArray(tracks)) {
			throw new BadRequestException('tracks should be an array');
		}

		const errorMessages: string[] = [];
		const titles: string[] = [];
		const changeableIds: string[] = [];

		tracks.forEach((track, index) => {
			if (Object.keys(track).length !== 2) {
				errorMessages.push(
					`tracks.${index} object should have two properties: "title" and "changeableId"`
				);
			}

			if (track.title && typeof track.title !== 'string') {
				errorMessages.push(`tracks.${index} property "title" should be string`);
			}

			if (track.changeableId && typeof track.changeableId !== 'string') {
				errorMessages.push(
					`tracks.${index} property "changeableId" should be string`
				);
			}

			if (!track.title.length) {
				errorMessages.push(
					`tracks.${index} property "title" must be longer than or equal to 1 characters`
				);
			}

			if (track.title.length > 20) {
				errorMessages.push(
					`tracks.${index} property "title" must be shorter than or equal to 20 characters`
				);
			}

			if (!track.changeableId.length) {
				errorMessages.push(
					`tracks.${index} property "changeableId" must be longer than or equal to 1 characters`
				);
			}

			if (track.changeableId.length > 20) {
				errorMessages.push(
					`tracks.${index} property "changeableId" must be shorter than or equal to 20 characters`
				);
			}

			if (!regex.title.test(track.title)) {
				errorMessages.push(`${messages.title} (tracks.${index})`);
			}

			if (!regex.changeableId.test(track.changeableId)) {
				errorMessages.push(`${messages.changeableId} (tracks.${index})`);
			}

			if (track.title) {
				titles.push(track.title);
			}

			if (track.changeableId) {
				changeableIds.push(track.changeableId);
			}
		});

		if (
			new Set(titles).size !== titles.length ||
			new Set(changeableIds).size !== changeableIds.length
		) {
			errorMessages.push('Track titles and ids must be unique');
		}

		if (errorMessages.length) {
			throw new BadRequestException(errorMessages);
		}

		return true;
	}
}
