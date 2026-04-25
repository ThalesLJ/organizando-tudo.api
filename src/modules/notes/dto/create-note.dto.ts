import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
