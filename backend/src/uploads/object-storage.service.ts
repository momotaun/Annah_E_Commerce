import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { PRODUCT_IMAGE_URL_PATTERN } from '../common/product-image-url-pattern';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class ObjectStorageService {
  // Lazy, not built in the constructor: mirrors ResendMailer.getClient() —
  // this class is always instantiated, even on a machine with no object
  // storage configured at all. Throwing here instead of in the
  // constructor keeps that default, not-yet-configured case bootable.
  private getClient(): S3Client {
    const endpoint = process.env.OBJECT_STORAGE_ENDPOINT;
    const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
    const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException(
        'Image uploads are not configured: set OBJECT_STORAGE_ENDPOINT, ' +
          'OBJECT_STORAGE_ACCESS_KEY_ID, and OBJECT_STORAGE_SECRET_ACCESS_KEY ' +
          '(e.g. from a Neon Object Storage or S3 bucket).',
      );
    }
    return new S3Client({
      endpoint,
      region: process.env.OBJECT_STORAGE_REGION ?? 'auto',
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === 'true',
    });
  }

  async uploadProductImage(file: Express.Multer.File): Promise<string> {
    return this.uploadImage(file, 'product-images');
  }

  // Site-wide branding assets (logo, hero slide backgrounds) — same
  // storage/validation, a different key prefix so they're easy to tell
  // apart from vendor-owned product images in the bucket.
  async uploadSiteAsset(file: Express.Multer.File): Promise<string> {
    return this.uploadImage(file, 'site-assets');
  }

  private async uploadImage(
    file: Express.Multer.File,
    keyPrefix: string,
  ): Promise<string> {
    const extension = ALLOWED_MIME_TYPES[file.mimetype];
    if (!extension) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, and GIF images are allowed',
      );
    }
    if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Images must be 5MB or smaller');
    }

    const bucket = process.env.OBJECT_STORAGE_BUCKET;
    const publicUrlBase = process.env.OBJECT_STORAGE_PUBLIC_URL_BASE;
    if (!bucket || !publicUrlBase) {
      throw new InternalServerErrorException(
        'Image uploads are not configured: set OBJECT_STORAGE_BUCKET and ' +
          'OBJECT_STORAGE_PUBLIC_URL_BASE.',
      );
    }

    const key = `${keyPrefix}/${randomUUID()}.${extension}`;
    const url = `${publicUrlBase.replace(/\/$/, '')}/${key}`;

    // Fail loudly here rather than let a misconfigured public URL base
    // produce an uploaded-but-unusable image: CreateVendorProductDto
    // would reject this same URL later with a far more confusing error.
    if (!PRODUCT_IMAGE_URL_PATTERN.test(url)) {
      throw new InternalServerErrorException(
        `OBJECT_STORAGE_PUBLIC_URL_BASE ("${publicUrlBase}") doesn't produce ` +
          'a URL this app recognizes as a product image host (S3 or Neon ' +
          'Object Storage) — check the configured value.',
      );
    }

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return url;
  }
}
