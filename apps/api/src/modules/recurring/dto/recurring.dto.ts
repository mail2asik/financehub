import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { RecurrenceFrequency, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateRecurringDto {
  @IsString()
  @IsNotEmpty()
  accountId!: string;

  @IsString()
  @IsOptional()
  toAccountId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(RecurrenceFrequency as object)
  frequency!: RecurrenceFrequency;

  @IsDateString()
  startDate!: string;
}
