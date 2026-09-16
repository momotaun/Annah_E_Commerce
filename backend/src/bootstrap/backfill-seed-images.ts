import type { PrismaClient } from '@prisma/client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PRODUCT_IMAGE_URL_PATTERN } from '../common/product-image-url-pattern';

// prisma/ is copied into every deploy image alongside dist/ (see
// Dockerfile) purely so `prisma migrate deploy` has the schema/migrations
// available — its seed-images/ subfolder rides along as a side effect,
// which this reuses rather than duplicating the files under src/.
const SEED_IMAGES_DIR = join(process.cwd(), 'prisma', 'seed-images');

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

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
 * Some environments' Product/HeroSlide rows still carry a bare
 * "/images/<file>" path meant to resolve against the web app's own
 * Next.js static folder — broken for any other client (the mobile app has
 * no equivalent origin to resolve a relative path against). Where a local
 * copy of that file exists in prisma/seed-images/, uploads it to object
 * storage and repoints the row at a real absolute URL instead.
 *
 * Runs on every boot (see src/scripts/seed-site-content.ts) but is cheap
 * and safe to repeat: it silently does nothing when object storage isn't
 * configured yet, and only ever queries for rows still on the stale
 * relative path, so once a row is fixed it's never touched again.
 */
export async function backfillSeedImages(prisma: PrismaClient): Promise<void> {
  const bucket = process.env.OBJECT_STORAGE_BUCKET;
  const publicUrlBase = process.env.OBJECT_STORAGE_PUBLIC_URL_BASE;
  const client = buildClient();
  if (!client || !bucket || !publicUrlBase) {
    return;
  }

  const [staleProducts, staleSlides] = await Promise.all([
    prisma.product.findMany({
      where: { imageUrl: { startsWith: '/images/' } },
      select: { id: true, imageUrl: true },
    }),
    prisma.heroSlide.findMany({
      where: { imageUrl: { startsWith: '/images/' } },
      select: { id: true, imageUrl: true },
    }),
  ]);

  if (staleProducts.length === 0 && staleSlides.length === 0) {
    return;
  }

  const resolvedUrls = new Map<string, string>();

  async function resolve(
    relativePath: string,
    keyPrefix: 'product-images' | 'site-assets',
  ): Promise<string | null> {
    const filename = relativePath.replace(/^\/images\//, '');
    const cacheKey = `${keyPrefix}/${filename}`;
    const cached = resolvedUrls.get(cacheKey);
    if (cached) return cached;

    const filePath = join(SEED_IMAGES_DIR, filename);
    if (!existsSync(filePath)) return null;

    const extension = filename.slice(filename.lastIndexOf('.'));
    const mimetype = MIME_TYPES[extension];
    if (!mimetype) return null;

    const key = `${keyPrefix}/seed/${filename}`;
    // Non-null: this closure only ever runs after the guard above returns
    // early on a missing client/bucket/publicUrlBase, but TS doesn't carry
    // that narrowing into a nested function declaration.
    const url = `${publicUrlBase!.replace(/\/$/, '')}/${key}`;
    if (!PRODUCT_IMAGE_URL_PATTERN.test(url)) return null;

    await client!.send(
      new PutObjectCommand({
        Bucket: bucket!,
        Key: key,
        Body: readFileSync(filePath),
        ContentType: mimetype,
      }),
    );
    resolvedUrls.set(cacheKey, url);
    return url;
  }

  let updated = 0;
  for (const product of staleProducts) {
    const url = await resolve(product.imageUrl as string, 'product-images');
    if (url) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: url },
      });
      updated++;
    }
  }
  for (const slide of staleSlides) {
    const url = await resolve(slide.imageUrl, 'site-assets');
    if (url) {
      await prisma.heroSlide.update({
        where: { id: slide.id },
        data: { imageUrl: url },
      });
      updated++;
    }
  }

  console.log(
    `Seed image backfill: repointed ${updated} row(s) from local /images/ paths to object storage URLs.`,
  );
}
