import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGE_URL_PATTERN } from '../src/common/product-image-url-pattern';

const SEED_IMAGES_DIR = join(__dirname, 'seed-images');

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

let client: S3Client | undefined;

function getClient(): S3Client {
  if (client) return client;
  const endpoint = process.env.OBJECT_STORAGE_ENDPOINT;
  const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Seeding demo products requires object storage to be configured: set ' +
        'OBJECT_STORAGE_ENDPOINT, OBJECT_STORAGE_ACCESS_KEY_ID, and ' +
        'OBJECT_STORAGE_SECRET_ACCESS_KEY in backend/.env (e.g. from a Neon ' +
        'Object Storage bucket) — the demo catalogue images need a real, ' +
        'portable URL so they load in the mobile app too, not just the web ' +
        "app's own /images/ static folder.",
    );
  }
  client = new S3Client({
    endpoint,
    region: process.env.OBJECT_STORAGE_REGION ?? 'auto',
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === 'true',
  });
  return client;
}

const uploadedUrls = new Map<string, string>();

/**
 * Uploads a seed asset's local file (backend/prisma/seed-images/<file>,
 * duplicated from frontend/public/images since the backend and frontend
 * are separate deployable units with no shared filesystem) to the same
 * object storage bucket real vendor/admin uploads use. Seeded rows then
 * get a real absolute imageUrl instead of a "/images/<file>" path that only
 * the web app's own Next.js static folder can resolve — the mobile app has
 * no equivalent "own origin" to resolve a relative path against.
 *
 * Keyed deterministically by filename (unlike real uploads, which use a
 * random UUID) so re-running the seed overwrites the same object instead
 * of accumulating a new copy on every run. `keyPrefix` mirrors
 * ObjectStorageService's own prefixes ('product-images' vs 'site-assets')
 * so seeded objects sit alongside real uploads of the same kind.
 */
async function uploadSeedImage(
  relativePath: string,
  keyPrefix: 'product-images' | 'site-assets',
): Promise<string> {
  const filename = relativePath.replace(/^\/images\//, '');
  const cacheKey = `${keyPrefix}/${filename}`;
  const cached = uploadedUrls.get(cacheKey);
  if (cached) return cached;

  const bucket = process.env.OBJECT_STORAGE_BUCKET;
  const publicUrlBase = process.env.OBJECT_STORAGE_PUBLIC_URL_BASE;
  if (!bucket || !publicUrlBase) {
    throw new Error(
      'Seeding demo content requires OBJECT_STORAGE_BUCKET and ' +
        'OBJECT_STORAGE_PUBLIC_URL_BASE to be set in backend/.env.',
    );
  }

  const extension = filename.slice(filename.lastIndexOf('.'));
  const mimetype = MIME_TYPES[extension];
  if (!mimetype) {
    throw new Error(`Unsupported seed image extension: ${filename}`);
  }

  const body = readFileSync(join(SEED_IMAGES_DIR, filename));
  const key = `${keyPrefix}/seed/${filename}`;
  const url = `${publicUrlBase.replace(/\/$/, '')}/${key}`;

  // Fail loudly here rather than seed a row with an unusable imageUrl:
  // CreateVendorProductDto would reject this same shape far more
  // confusingly if it were ever re-submitted through that path.
  if (!PRODUCT_IMAGE_URL_PATTERN.test(url)) {
    throw new Error(
      `OBJECT_STORAGE_PUBLIC_URL_BASE ("${publicUrlBase}") doesn't produce a ` +
        'URL this app recognizes as a product image host — check the ' +
        'configured value.',
    );
  }

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: mimetype,
    }),
  );

  uploadedUrls.set(cacheKey, url);
  return url;
}

export function uploadSeedProductImage(relativePath: string): Promise<string> {
  return uploadSeedImage(relativePath, 'product-images');
}

export function uploadSeedSiteAsset(relativePath: string): Promise<string> {
  return uploadSeedImage(relativePath, 'site-assets');
}
