import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class PasswordResetDto {
  // Matches RegisterDto's normalization — the lookup below must be
  // case-insensitive since that's how accounts are created.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsEmail()
  email: string;
}
