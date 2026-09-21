import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
} from 'class-validator';
import { ProductOptionType } from '@prisma/client';

export class ProductOptionInputDto {
  @IsEnum(ProductOptionType)
  type: ProductOptionType;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  values: string[];
}
