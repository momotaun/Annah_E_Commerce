import type { PrismaClient } from '@prisma/client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGE_URL_PATTERN } from '../common/product-image-url-pattern';
import {
  GALLERY_BUCKET_IMAGE_COUNT,
  PRODUCT_GALLERY_BUCKETS,
} from '../common/product-gallery-buckets';

// See prisma/seed-images/stock/ — three royalty-free stock photos per
// bucket, copied into every deploy image alongside the rest of prisma/.
const STOCK_IMAGES_DIR = join(
  process.cwd(),
  'prisma',
  'seed-images',
  'stock',
);

function buildClient(): S3Client | null {
  const endpoint = process.env.OBJECT_STORAGE_ENDPOINT;
  const accessKeyId = process.env.OBJECT_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;
  return new S3Client({
    endpoint,
    region: process.env.OBJECT_STORAGE_REGION ?? 'auto',
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === 'true',
  });
}

/**
 * Tops every catalogue product up to a real, non-placeholder gallery of at
 * least 3 images, for demo purposes — many seeded products previously had
 * only 1-2 images, or the generic "No Image Available" placeholder.
 *
 * Runs on every boot (see src/scripts/seed-site-content.ts). Idempotent and
 * cheap to repeat: it only queries products that still need fixing (fewer
 * than GALLERY_BUCKET_IMAGE_COUNT images, or still on the placeholder), and
 * uploads each bucket's stock photos to object storage at most once per
 * run (cached in-memory), skipping silently when object storage isn't
 * configured yet — matching backfillSeedImages' pattern.
 */
export async function backfillProductGalleryImages(
  prisma: PrismaClient,
): Promise<void> {
  const bucket = process.env.OBJECT_STORAGE_BUCKET;
  const publicUrlBase = process.env.OBJECT_STORAGE_PUBLIC_URL_BASE;
  const client = buildClient();
  if (!client || !bucket || !publicUrlBase) {
    return;
  }

  const candidates = await prisma.product.findMany({
    select: { id: true, name: true, imageUrl: true, images: true },
  });
  const needsFix = candidates.filter(
    (p) =>
      p.images.length < GALLERY_BUCKET_IMAGE_COUNT ||
      (p.imageUrl?.includes('placeholder-product') ?? false),
  );
  if (needsFix.length === 0) {
    return;
  }

  const uploadedByBucket = new Map<string, string[]>();

  async function resolveBucketUrls(
    galleryBucket: string,
  ): Promise<string[] | null> {
    const cached = uploadedByBucket.get(galleryBucket);
    if (cached) return cached;

    const urls: string[] = [];
    for (let i = 1; i <= GALLERY_BUCKET_IMAGE_COUNT; i++) {
      const filename = `${galleryBucket}-${i}.jpg`;
      const filePath = join(STOCK_IMAGES_DIR, filename);
      let fileBuffer: Buffer;
      try {
        fileBuffer = readFileSync(filePath);
      } catch {
        return null;
      }

      const key = `product-images/stock/${filename}`;
      // Non-null: this closure only ever runs after the guard above returns
      // early on a missing client/bucket/publicUrlBase, but TS doesn't carry
      // that narrowing into a nested function declaration.
      const url = `${publicUrlBase!.replace(/\/$/, '')}/${key}`;
      if (!PRODUCT_IMAGE_URL_PATTERN.test(url)) return null;

      await client!.send(
        new PutObjectCommand({
          Bucket: bucket!,
          Key: key,
          Body: fileBuffer,
          ContentType: 'image/jpeg',
        }),
      );
      urls.push(url);
    }

    uploadedByBucket.set(galleryBucket, urls);
    return urls;
  }

  let updated = 0;
  for (const product of needsFix) {
    const galleryBucket = PRODUCT_GALLERY_BUCKETS[product.name];
    if (!galleryBucket) continue;

    const stockUrls = await resolveBucketUrls(galleryBucket);
    if (!stockUrls) continue;

    const hasRealExistingImage =
      product.imageUrl != null &&
      !product.imageUrl.includes('placeholder-product');

    const images = hasRealExistingImage
      ? [product.imageUrl!, ...stockUrls].slice(0, GALLERY_BUCKET_IMAGE_COUNT)
      : stockUrls;

    await prisma.product.update({
      where: { id: product.id },
      data: { images, imageUrl: images[0] },
    });
    updated++;
  }

  console.log(
    `Product gallery backfill: topped up ${updated} product(s) to a real ${GALLERY_BUCKET_IMAGE_COUNT}-image gallery.`,
  );
}
