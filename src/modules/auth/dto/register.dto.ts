import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
