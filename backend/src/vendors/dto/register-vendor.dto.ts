import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterVendorDto {
  @IsNotEmpty()
  businessName: string;

  @IsEmail()
  contactEmail: string;
}
