import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
