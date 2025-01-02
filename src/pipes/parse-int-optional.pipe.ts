import {
	PipeTransform,
	Injectable,
	ArgumentMetadata,
	ParseIntPipe
} from '@nestjs/common';

@Injectable()
export class ParseIntOptionalPipe
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

		return await this.parseIntPipe.transform(value, metadata);
	}
}
