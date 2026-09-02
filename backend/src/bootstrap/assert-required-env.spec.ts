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

  it('does not require FRONTEND_URL outside production', () => {
    const exit = jest.fn();

    assertRequiredEnvVars(
      {
        DATABASE_URL: 'postgresql://localhost/db',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        // FRONTEND_URL missing, NODE_ENV unset — falls back to the
        // localhost default everywhere it's read, which is correct here.
      },
      exit,
    );

    expect(exit).not.toHaveBeenCalled();
  });

  it('exits when NODE_ENV=production and FRONTEND_URL is missing', () => {
    const exit = jest.fn();

    assertRequiredEnvVars(
      {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://localhost/db',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        // FRONTEND_URL missing — would silently break CORS and reset
        // links against the real frontend with no error at boot.
      },
      exit,
    );

    expect(exit).toHaveBeenCalledWith(1);
  });

  it('does not exit when NODE_ENV=production and every required variable, including FRONTEND_URL, is set', () => {
    const exit = jest.fn();

    assertRequiredEnvVars(
      {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://localhost/db',
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        FRONTEND_URL: 'https://apex-marketplace.example.com',
      },
      exit,
    );

    expect(exit).not.toHaveBeenCalled();
  });
});
