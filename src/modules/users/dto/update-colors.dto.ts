import { IsHexColor, IsOptional } from 'class-validator';

export class UpdateColorsDto {
  @IsOptional()
  @IsHexColor()
  backgroundPrimary?: string;

  @IsOptional()
  @IsHexColor()
  backgroundSecondary?: string;

  @IsOptional()
  @IsHexColor()
  textPrimary?: string;

  @IsOptional()
  @IsHexColor()
  textSecondary?: string;
}
