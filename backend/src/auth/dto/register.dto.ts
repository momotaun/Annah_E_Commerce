import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  // Emails are matched case-insensitively everywhere (login, the User.email
  // unique constraint, password reset) — normalize once here so "Jane@x.com"
  // and "jane@x.com" can never become two accounts.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;
}
