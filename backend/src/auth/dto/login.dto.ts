import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  // Matches RegisterDto's normalization — email lookups must be
  // case-insensitive since that's how accounts are created.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
