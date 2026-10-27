import { resolveOptionTypesForCategory } from './product-option-types';

describe('resolveOptionTypesForCategory', () => {
  const categories: Record<string, { slug: string; parentId: string | null }> =
    {
      'cat-fashion': { slug: 'fashion', parentId: null },
      'cat-men': { slug: 'men', parentId: 'cat-fashion' },
      'cat-misc': { slug: 'misc', parentId: null },
    };
  const loadParent = (id: string) => Promise.resolve(categories[id] ?? null);

  it('uses a category’s own entry when it has one', async () => {
    const types = await resolveOptionTypesForCategory(
      { slug: 'fashion', parentId: null },
      loadParent,
    );
    expect(types.map((t) => t.type)).toEqual(['COLOR', 'SIZE']);
  });

  it('inherits from the nearest ancestor with an entry', async () => {
    const types = await resolveOptionTypesForCategory(
      { slug: 'men-tops', parentId: 'cat-men' },
      loadParent,
    );
    expect(types.map((t) => t.type)).toEqual(['COLOR', 'SIZE']);
  });

  it('returns no options when nothing in the chain defines any', async () => {
    const types = await resolveOptionTypesForCategory(
      { slug: 'misc-thing', parentId: 'cat-misc' },
      loadParent,
    );
    expect(types).toEqual([]);
  });
});
