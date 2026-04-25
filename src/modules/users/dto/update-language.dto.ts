import { IsIn, IsString } from 'class-validator';

export class UpdateLanguageDto {
  @IsString()
  @IsIn(['en', 'pt', 'es'])
  language!: string;
}
