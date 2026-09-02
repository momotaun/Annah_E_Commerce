import { isPinoPrettyAvailable } from './is-pino-pretty-available';

describe('isPinoPrettyAvailable', () => {
  it('returns true when resolve() finds the package', () => {
    const resolve = jest
      .fn()
      .mockReturnValue('/some/path/pino-pretty/index.js');

    expect(isPinoPrettyAvailable(resolve)).toBe(true);
  });

  it('returns false when resolve() throws (package not installed)', () => {
    const resolve = jest.fn(() => {
      throw new Error("Cannot find module 'pino-pretty'");
    });

    expect(isPinoPrettyAvailable(resolve)).toBe(false);
  });

  it('resolves the real pino-pretty package by default, since it is installed here', () => {
    // No injected resolver — exercises the actual require.resolve default,
    // matching this dev/CI environment where pino-pretty is a real
    // devDependency. The production Docker image is what omits it; that
    // case is what the two tests above model.
    expect(isPinoPrettyAvailable()).toBe(true);
  });
});
