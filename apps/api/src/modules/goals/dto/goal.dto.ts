import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Type(() => Number)
  targetAmount: number;

  @IsDateString()
  @IsOptional()
  targetDate?: string;
}

export class AddContributionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}