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

  @IsOptional()
  @IsHexColor()
  borderColor?: string;

  @IsOptional()
  @IsHexColor()
  inputBackground?: string;

  @IsOptional()
  @IsHexColor()
  headerBackground?: string;

  @IsOptional()
  @IsHexColor()
  headerText?: string;

  @IsOptional()
  @IsHexColor()
  primaryButtonBackground?: string;

  @IsOptional()
  @IsHexColor()
  primaryButtonText?: string;

  @IsOptional()
  @IsHexColor()
  secondaryButtonBackground?: string;

  @IsOptional()
  @IsHexColor()
  secondaryButtonText?: string;

  @IsOptional()
  @IsHexColor()
  languageSwitcherBackground?: string;

  @IsOptional()
  @IsHexColor()
  languageSwitcherText?: string;

  @IsOptional()
  @IsHexColor()
  languageSwitcherBorder?: string;
}
