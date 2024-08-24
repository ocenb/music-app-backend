import { PartialType } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateTrackPositionDto {
	@IsNumber()
	@Min(1)
	position: number;
}

export class AddTrackDto extends PartialType(UpdateTrackPositionDto) {}
