import { IsHexColor, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  icon!: string;

  @IsString()
  @IsHexColor()
  color!: string;
}
