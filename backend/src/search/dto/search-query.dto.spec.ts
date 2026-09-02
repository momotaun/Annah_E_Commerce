// class-transformer's @Type() decorator reads TypeScript's emitted design
// type metadata, which requires this polyfill. Other spec files in this
// repo get it as a side effect of importing @nestjs/testing; this one
// tests the DTO standalone, so it needs the import directly.
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SearchQueryDto } from './search-query.dto';

describe('SearchQueryDto', () => {
  it('defaults to page 1, limit 20 when neither is provided', () => {
    const dto = plainToInstance(SearchQueryDto, { q: 'shirt' });

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('accepts a limit at the maximum', async () => {
    const dto = plainToInstance(SearchQueryDto, { q: 'shirt', limit: '100' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a limit above the maximum, so a client cannot request every match in one query', async () => {
    const dto = plainToInstance(SearchQueryDto, {
      q: 'shirt',
      limit: '999999',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });
});
