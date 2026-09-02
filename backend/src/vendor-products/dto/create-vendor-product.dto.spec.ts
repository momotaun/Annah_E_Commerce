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

  it('rejects a local path outside /images/', async () => {
    expect(await validateImageUrl('/etc/passwd')).toBeDefined();
  });
});
