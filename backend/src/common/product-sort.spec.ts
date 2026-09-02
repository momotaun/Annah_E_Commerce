import { getProductOrderBy } from './product-sort';

describe('getProductOrderBy', () => {
  it('defaults to newest-first when no sort is given', () => {
    expect(getProductOrderBy(undefined)).toEqual({ createdAt: 'desc' });
  });

  it('sorts price ascending', () => {
    expect(getProductOrderBy('price-asc')).toEqual({ price: 'asc' });
  });

  it('sorts price descending', () => {
    expect(getProductOrderBy('price-desc')).toEqual({ price: 'desc' });
  });

  it('treats "newest" explicitly the same as the default', () => {
    expect(getProductOrderBy('newest')).toEqual({ createdAt: 'desc' });
  });
});
