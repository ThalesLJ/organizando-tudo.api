import { IsHexColor, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;
}
