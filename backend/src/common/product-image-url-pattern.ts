// Accepts a local /images/... asset (what the seed data uses), an S3
// virtual-hosted-style URL (bucket.s3.amazonaws.com or
// bucket.s3.<region>.amazonaws.com), or a Neon Object Storage URL
// (<branch>.storage.<compute>.<region>.aws.neon.tech) — the only image
// hosts this app actually integrates with. Anything else is rejected here
// rather than left to break at render time: next/image throws for any
// remote host that isn't in next.config.ts's images.remotePatterns.
//
// Shared by CreateVendorProductDto (validates incoming imageUrl/images)
// and ObjectStorageService (validates its own constructed upload URL
// against the same rule, so a misconfigured OBJECT_STORAGE_PUBLIC_URL_BASE
// fails loudly at upload time instead of silently at product-create time).
export const PRODUCT_IMAGE_URL_PATTERN =
  /^(\/images\/[\w.-]+\.(?:jpg|jpeg|png|webp|gif)|https:\/\/[a-z0-9.-]+\.s3(?:\.[a-z0-9-]+)?\.amazonaws\.com\/.+|https:\/\/[a-z0-9.-]+\.storage\.[a-z0-9.-]+\.aws\.neon\.tech\/.+)$/i;
