import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';

const CONFIGURED_ENV = {
  OBJECT_STORAGE_ENDPOINT: 'https://storage.example.com',
  OBJECT_STORAGE_BUCKET: 'product-images',
  OBJECT_STORAGE_ACCESS_KEY_ID: 'test-access-key',
  OBJECT_STORAGE_SECRET_ACCESS_KEY: 'test-secret-key',
  OBJECT_STORAGE_PUBLIC_URL_BASE:
    'https://product-images.storage.c-1.eu-central-1.aws.neon.tech',
};

function makeFile(overrides: Partial<Express.Multer.File> = {}) {
  return {
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake image bytes'),
    ...overrides,
  } as Express.Multer.File;
}

describe('ObjectStorageService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('throws a clear "not configured" error when storage env vars are unset', async () => {
    delete process.env.OBJECT_STORAGE_ENDPOINT;
    delete process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    delete process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
    const service = new ObjectStorageService();

    await expect(service.uploadProductImage(makeFile())).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('rejects a file type that is not an allowed image format', async () => {
    Object.assign(process.env, CONFIGURED_ENV);
    const service = new ObjectStorageService();

    await expect(
      service.uploadProductImage(makeFile({ mimetype: 'application/pdf' })),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a file larger than the 5MB limit', async () => {
    Object.assign(process.env, CONFIGURED_ENV);
    const service = new ObjectStorageService();

    await expect(
      service.uploadProductImage(makeFile({ size: 6 * 1024 * 1024 })),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws if the bucket/public URL base are missing even with credentials set', async () => {
    Object.assign(process.env, CONFIGURED_ENV);
    delete process.env.OBJECT_STORAGE_BUCKET;
    const service = new ObjectStorageService();

    await expect(service.uploadProductImage(makeFile())).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it("throws if OBJECT_STORAGE_PUBLIC_URL_BASE doesn't match a recognized image host", async () => {
    Object.assign(process.env, CONFIGURED_ENV, {
      OBJECT_STORAGE_PUBLIC_URL_BASE: 'https://cdn.example.com',
    });
    const service = new ObjectStorageService();

    await expect(service.uploadProductImage(makeFile())).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
