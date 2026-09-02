import { assertSafeToSeed } from './assert-safe-to-seed';

describe('assertSafeToSeed', () => {
  it('does not exit when NODE_ENV is unset (local development)', () => {
    const exit = jest.fn();

    assertSafeToSeed({}, exit);

    expect(exit).not.toHaveBeenCalled();
  });

  it('does not exit when NODE_ENV is development', () => {
    const exit = jest.fn();

    assertSafeToSeed({ NODE_ENV: 'development' }, exit);

    expect(exit).not.toHaveBeenCalled();
  });

  it('exits with code 1 when NODE_ENV is production', () => {
    const exit = jest.fn();

    assertSafeToSeed({ NODE_ENV: 'production' }, exit);

    expect(exit).toHaveBeenCalledWith(1);
  });

  it('does not exit when NODE_ENV is production but explicitly allowed', () => {
    const exit = jest.fn();

    assertSafeToSeed(
      { NODE_ENV: 'production', ALLOW_SEED_IN_PRODUCTION: 'true' },
      exit,
    );

    expect(exit).not.toHaveBeenCalled();
  });

  it('still exits if ALLOW_SEED_IN_PRODUCTION is set to anything other than the literal string "true"', () => {
    const exit = jest.fn();

    assertSafeToSeed(
      { NODE_ENV: 'production', ALLOW_SEED_IN_PRODUCTION: '1' },
      exit,
    );

    expect(exit).toHaveBeenCalledWith(1);
  });
});
