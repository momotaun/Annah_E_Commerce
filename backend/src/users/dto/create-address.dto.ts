import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  line1: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  province: string;

  @IsNotEmpty()
  postalCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}
