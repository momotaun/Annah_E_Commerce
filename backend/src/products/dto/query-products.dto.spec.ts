// class-transformer's @Type() decorator reads TypeScript's emitted design
// type metadata, which requires this polyfill. Other spec files in this
// repo get it as a side effect of importing @nestjs/testing; this one
// tests the DTO standalone, so it needs the import directly.
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryProductsDto } from './query-products.dto';

describe('QueryProductsDto', () => {
  it('defaults to page 1, limit 20 when neither is provided', () => {
    const dto = plainToInstance(QueryProductsDto, {});

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('accepts a limit at the maximum', async () => {
    const dto = plainToInstance(QueryProductsDto, { limit: '100' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a limit above the maximum, so a client cannot request the whole catalogue in one query', async () => {
    const dto = plainToInstance(QueryProductsDto, { limit: '999999' });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('leaves minPrice/maxPrice undefined when neither is provided', () => {
    const dto = plainToInstance(QueryProductsDto, {});

    expect(dto.minPrice).toBeUndefined();
    expect(dto.maxPrice).toBeUndefined();
  });

  it('coerces minPrice/maxPrice query strings to numbers', () => {
    const dto = plainToInstance(QueryProductsDto, {
      minPrice: '100',
      maxPrice: '500',
    });

    expect(dto.minPrice).toBe(100);
    expect(dto.maxPrice).toBe(500);
  });

  it('accepts a minPrice of 0', async () => {
    const dto = plainToInstance(QueryProductsDto, { minPrice: '0' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a negative minPrice or maxPrice', async () => {
    const dto = plainToInstance(QueryProductsDto, {
      minPrice: '-10',
      maxPrice: '-1',
    });

    const errors = await validate(dto);
    const invalidProperties = errors.map((e) => e.property);
    expect(invalidProperties).toEqual(
      expect.arrayContaining(['minPrice', 'maxPrice']),
    );
  });

  it('rejects a non-numeric price', async () => {
    const dto = plainToInstance(QueryProductsDto, { minPrice: 'not-a-number' });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'minPrice')).toBe(true);
  });
});
