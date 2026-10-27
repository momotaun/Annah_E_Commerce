import { expandToDescendantSlugs, CategoryNode } from './category-tree';

const tree: CategoryNode[] = [
  { id: '1', slug: 'fashion', parentId: null },
  { id: '2', slug: 'men', parentId: '1' },
  { id: '3', slug: 'men-tops', parentId: '2' },
  { id: '4', slug: 'women', parentId: '1' },
  { id: '5', slug: 'electronics', parentId: null },
];

describe('expandToDescendantSlugs', () => {
  it('includes every level below a top-level category', () => {
    expect(expandToDescendantSlugs(tree, ['fashion']).sort()).toEqual(
      ['fashion', 'men', 'men-tops', 'women'].sort(),
    );
  });

  it('includes children of a mid-level category but not its siblings', () => {
    expect(expandToDescendantSlugs(tree, ['men']).sort()).toEqual(
      ['men', 'men-tops'].sort(),
    );
  });

  it('returns just the slug for a leaf', () => {
    expect(expandToDescendantSlugs(tree, ['men-tops'])).toEqual(['men-tops']);
  });

  it('merges several requested slugs without duplicates', () => {
    expect(
      expandToDescendantSlugs(tree, ['men', 'men-tops', 'electronics']).sort(),
    ).toEqual(['electronics', 'men', 'men-tops']);
  });

  it('passes unknown slugs through so they still match nothing', () => {
    expect(expandToDescendantSlugs(tree, ['ghost'])).toEqual(['ghost']);
  });
});
