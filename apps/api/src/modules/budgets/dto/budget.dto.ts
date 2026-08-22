import { IsInt, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetCategoryItemDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  allocated: number;
}

export class CreateBudgetDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;

  @ValidateNested({ each: true })
  @Type(() => BudgetCategoryItemDto)
  @ArrayMinSize(1)
  categories: BudgetCategoryItemDto[];
}