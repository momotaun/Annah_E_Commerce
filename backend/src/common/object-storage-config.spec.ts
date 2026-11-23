import { shouldForcePathStyle } from './object-storage-config';

describe('shouldForcePathStyle', () => {
  const originalForcePathStyle = process.env.OBJECT_STORAGE_FORCE_PATH_STYLE;

  afterEach(() => {
    if (originalForcePathStyle === undefined) {
      delete process.env.OBJECT_STORAGE_FORCE_PATH_STYLE;
    } else {
      process.env.OBJECT_STORAGE_FORCE_PATH_STYLE = originalForcePathStyle;
    }
  });

  it('uses path-style addressing for Neon Object Storage endpoints', () => {
    process.env.OBJECT_STORAGE_FORCE_PATH_STYLE = 'false';

    expect(
      shouldForcePathStyle(
        'https://br-restless-pine-b2z7dew1.storage.c-6.eu-central-1.aws.neon.tech',
      ),
    ).toBe(true);
  });

  it('uses path-style addressing when explicitly enabled for other providers', () => {
    process.env.OBJECT_STORAGE_FORCE_PATH_STYLE = 'true';

    expect(shouldForcePathStyle('https://storage.example.com')).toBe(true);
  });

  it('keeps virtual-host-style addressing for other providers by default', () => {
    delete process.env.OBJECT_STORAGE_FORCE_PATH_STYLE;

    expect(shouldForcePathStyle('https://storage.example.com')).toBe(false);
  });
});
