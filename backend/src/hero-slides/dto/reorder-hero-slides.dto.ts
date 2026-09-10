import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderHeroSlidesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderedIds: string[];
}
