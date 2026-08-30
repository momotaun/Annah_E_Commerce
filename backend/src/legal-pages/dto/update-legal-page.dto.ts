import { Type } from 'class-transformer';
import { IsArray, IsString, MinLength, ValidateNested } from 'class-validator';

export class UpdateLegalPageSectionDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  body: string;
}

export class UpdateLegalPageDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateLegalPageSectionDto)
  sections: UpdateLegalPageSectionDto[];
}
