import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ConfirmPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @MinLength(8)
  newPassword: string;
}
