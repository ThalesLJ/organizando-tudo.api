import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsBoolean()
  keepLoggedIn?: boolean;
}
