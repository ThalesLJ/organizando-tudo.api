import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;
}
