export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export class AddressResponseDto {
  id: string;
  line1: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}
