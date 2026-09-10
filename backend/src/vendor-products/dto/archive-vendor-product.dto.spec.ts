import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ArchiveVendorProductDto } from './archive-vendor-product.dto';

async function validateDto(overrides: Record<string, unknown>) {
  const dto = plainToInstance(ArchiveVendorProductDto, overrides);
  return validate(dto);
}

describe('ArchiveVendorProductDto', () => {
  it('rejects a missing reason', async () => {
    const errors = await validateDto({});
    expect(errors.find((e) => e.property === 'reason')).toBeDefined();
  });

  it('rejects an unrecognized reason', async () => {
    const errors = await validateDto({ reason: 'BECAUSE' });
    expect(errors.find((e) => e.property === 'reason')).toBeDefined();
  });

  it('allows each real reason with no description', async () => {
    for (const reason of [
      'TEMPORARY',
      'OUT_OF_STOCK',
      'PRODUCT_PROBLEM',
      'DAMAGES',
    ]) {
      const errors = await validateDto({ reason });
      expect(errors).toHaveLength(0);
    }
  });

  it('allows a long-text description', async () => {
    const errors = await validateDto({
      reason: 'PRODUCT_PROBLEM',
      description: 'A '.repeat(500) + 'very long explanation.',
    });
    expect(errors).toHaveLength(0);
  });
});
