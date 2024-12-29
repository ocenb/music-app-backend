import {
	PipeTransform,
	Injectable,
	ArgumentMetadata,
	ParseIntPipe,
	BadRequestException
} from '@nestjs/common';

@Injectable()
export class ParseTakePipe
	implements PipeTransform<string | undefined, Promise<number | undefined>>
{
	private readonly parseIntPipe = new ParseIntPipe();

	async transform(
		value: string | undefined,
		metadata: ArgumentMetadata
	): Promise<number | undefined> {
		if (!value) {
			return undefined;
		}

		const parsedValue = await this.parseIntPipe.transform(value, metadata);

		if (parsedValue > 50) {
			throw new BadRequestException('Max take is 50');
		}

		return parsedValue;
	}
}
