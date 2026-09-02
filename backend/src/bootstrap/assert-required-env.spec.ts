import { assertRequiredEnvVars } from './assert-required-env';

describe('assertRequiredEnvVars', () => {
  it('does not exit when every required variable is set', () => {
    const exit = jest.fn();

    assertRequiredEnvVars(
      {
        DATABASE_URL: 'postgresql://localhost/db',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
      },
      exit,
    );

    expect(exit).not.toHaveBeenCalled();
  });

  it('exits with code 1 when a required variable is missing', () => {
    const exit = jest.fn();

    assertRequiredEnvVars(
      {
        DATABASE_URL: 'postgresql://localhost/db',
        // JWT_ACCESS_SECRET missing
        JWT_REFRESH_SECRET: 'refresh-secret',
      },
      exit,
    );

    expect(exit).toHaveBeenCalledWith(1);
  });

  it('exits when every required variable is missing', () => {
    const exit = jest.fn();

    assertRequiredEnvVars({}, exit);

    expect(exit).toHaveBeenCalledWith(1);
  });

  it('treats an empty string as missing, not merely unset', () => {
    const exit = jest.fn();

    assertRequiredEnvVars(
      {
        DATABASE_URL: 'postgresql://localhost/db',
        JWT_ACCESS_SECRET: '',
        JWT_REFRESH_SECRET: 'refresh-secret',
      },
      exit,
    );

    expect(exit).toHaveBeenCalledWith(1);
  });
});
