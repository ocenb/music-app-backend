import { IsNumber, Min } from 'class-validator';

export class UpdateTrackPositionDto {
	@IsNumber()
	@Min(1)
	position: number;
}
