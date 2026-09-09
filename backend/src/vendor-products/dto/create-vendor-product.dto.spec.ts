import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateVendorProductDto } from './create-vendor-product.dto';

const baseProduct = {
  name: 'Apex Silk Pocket Square',
  sku: 'APEX-SILK-POCKET-SQUARE',
  price: 349,
  categoryId: 'cat-1',
};

async function validateImageUrl(imageUrl?: string) {
  const dto = plainToInstance(CreateVendorProductDto, {
    ...baseProduct,
    imageUrl,
  });
  const errors = await validate(dto);
  return errors.find((e) => e.property === 'imageUrl');
}

async function validateDto(overrides: Record<string, unknown>) {
  const dto = plainToInstance(CreateVendorProductDto, {
    ...baseProduct,
    ...overrides,
  });
  return validate(dto);
}

describe('CreateVendorProductDto imageUrl validation', () => {
  it('allows a missing imageUrl (optional field)', async () => {
    expect(await validateImageUrl(undefined)).toBeUndefined();
  });

  it('allows a local /images/... path', async () => {
    expect(
      await validateImageUrl('/images/apex-silk-pocket-square.jpg'),
    ).toBeUndefined();
  });

  it('allows a bucket.s3.amazonaws.com URL', async () => {
    expect(
      await validateImageUrl(
        'https://apex-products.s3.amazonaws.com/pocket-square.jpg',
      ),
    ).toBeUndefined();
  });

  it('allows a region-scoped bucket.s3.<region>.amazonaws.com URL', async () => {
    expect(
      await validateImageUrl(
        'https://apex-products.s3.eu-west-1.amazonaws.com/pocket-square.jpg',
      ),
    ).toBeUndefined();
  });

  it('allows a Neon Object Storage URL', async () => {
    expect(
      await validateImageUrl(
        'https://br-restless-pine-b2z7dew1.storage.c-6.eu-central-1.aws.neon.tech/product-images/pocket-square.jpg',
      ),
    ).toBeUndefined();
  });

  it('rejects an arbitrary external host', async () => {
    expect(
      await validateImageUrl('https://evil.example.com/tracking-pixel.jpg'),
    ).toBeDefined();
  });

  it('rejects a non-S3 AWS-lookalike host', async () => {
    expect(
      await validateImageUrl('https://s3.amazonaws.com.evil.com/x.jpg'),
    ).toBeDefined();
  });

  it('rejects a non-Neon aws.neon.tech-lookalike host', async () => {
    expect(
      await validateImageUrl(
        'https://x.storage.c-6.eu-central-1.aws.neon.tech.evil.com/y.jpg',
      ),
    ).toBeDefined();
  });

  it('rejects a local path outside /images/', async () => {
    expect(await validateImageUrl('/etc/passwd')).toBeDefined();
  });
});

describe('CreateVendorProductDto price', () => {
  it('allows a missing price — products can be saved unpriced', async () => {
    const errors = await validateDto({ price: undefined });
    expect(errors.find((e) => e.property === 'price')).toBeUndefined();
  });
});

describe('CreateVendorProductDto images', () => {
  it('allows a missing images array', async () => {
    const errors = await validateDto({ images: undefined });
    expect(errors.find((e) => e.property === 'images')).toBeUndefined();
  });

  it('allows up to 10 images', async () => {
    const errors = await validateDto({
      images: Array.from({ length: 10 }, (_, i) => `/images/photo-${i}.jpg`),
    });
    expect(errors.find((e) => e.property === 'images')).toBeUndefined();
  });

  it('rejects more than 10 images', async () => {
    const errors = await validateDto({
      images: Array.from({ length: 11 }, (_, i) => `/images/photo-${i}.jpg`),
    });
    expect(errors.find((e) => e.property === 'images')).toBeDefined();
  });

  it('rejects an image URL from a disallowed host', async () => {
    const errors = await validateDto({
      images: ['https://evil.example.com/tracking-pixel.jpg'],
    });
    expect(errors.find((e) => e.property === 'images')).toBeDefined();
  });
});

describe('CreateVendorProductDto status', () => {
  it('allows a missing status', async () => {
    const errors = await validateDto({ status: undefined });
    expect(errors.find((e) => e.property === 'status')).toBeUndefined();
  });

  it('allows DRAFT and PUBLISHED', async () => {
    for (const status of ['DRAFT', 'PUBLISHED']) {
      const errors = await validateDto({ status });
      expect(errors.find((e) => e.property === 'status')).toBeUndefined();
    }
  });

  it('rejects an unrecognized status', async () => {
    const errors = await validateDto({ status: 'ARCHIVED' });
    expect(errors.find((e) => e.property === 'status')).toBeDefined();
  });
});
