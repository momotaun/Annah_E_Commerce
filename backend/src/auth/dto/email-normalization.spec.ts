import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { PasswordResetDto } from './password-reset.dto';

describe('email normalization', () => {
  const cases: Array<{
    name: string;
    dtoClass: typeof RegisterDto | typeof LoginDto | typeof PasswordResetDto;
    extraFields: Record<string, unknown>;
  }> = [
    {
      name: 'RegisterDto',
      dtoClass: RegisterDto,
      extraFields: {
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Dlamini',
      },
    },
    {
      name: 'LoginDto',
      dtoClass: LoginDto,
      extraFields: { password: 'password123' },
    },
    {
      name: 'PasswordResetDto',
      dtoClass: PasswordResetDto,
      extraFields: {},
    },
  ];

  for (const { name, dtoClass, extraFields } of cases) {
    describe(name, () => {
      it('lowercases and trims a mixed-case email', () => {
        const dto = plainToInstance(dtoClass, {
          email: '  Jane@Example.CO.za  ',
          ...extraFields,
        });

        expect(dto.email).toBe('jane@example.co.za');
      });

      it('still fails validation for a genuinely invalid email', async () => {
        const dto = plainToInstance(dtoClass, {
          email: 'not-an-email',
          ...extraFields,
        });

        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'email')).toBe(true);
      });
    });
  }
});
