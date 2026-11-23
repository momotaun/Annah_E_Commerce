import { describe, it, expect } from 'vitest';
import { findCategoryById, findCategoryBySlug, flattenCategoryTree, getCategoryPath } from './categoryTree';
import type { Category } from './api-types';

const make = (id: string, slug: string, children: Category[] = []): Category => ({
  id, name: slug.toUpperCase(), slug, parentId: null, children,
});

const tree: Category[] = [
  make('1', 'fashion', [make('2', 'men', [make('3', 'men-tops')]), make('4', 'women')]),
  make('5', 'electronics', [make('6', 'audio')]),
];

describe('categoryTree', () => {
  it('finds a category at any depth by slug or id', () => {
    expect(findCategoryBySlug(tree, 'men-tops')?.id).toBe('3');
    expect(findCategoryById(tree, '6')?.slug).toBe('audio');
    expect(findCategoryBySlug(tree, 'nope')).toBeUndefined();
  });

  it('returns the root-to-node path', () => {
    expect(getCategoryPath(tree, 'men-tops').map((c) => c.slug)).toEqual(['fashion', 'men', 'men-tops']);
    expect(getCategoryPath(tree, 'fashion').map((c) => c.slug)).toEqual(['fashion']);
    expect(getCategoryPath(tree, 'nope')).toEqual([]);
  });

  it('flattens depth-first with path labels', () => {
    const flat = flattenCategoryTree(tree);
    expect(flat.map((f) => f.category.slug)).toEqual(['fashion', 'men', 'men-tops', 'women', 'electronics', 'audio']);
    expect(flat.find((f) => f.category.slug === 'men-tops')?.label).toBe('FASHION › MEN › MEN-TOPS');
    expect(flat.find((f) => f.category.slug === 'men-tops')?.depth).toBe(2);
  });

  it('can limit how many levels are flattened', () => {
    const flat = flattenCategoryTree(tree, { maxDepth: 2 });
    expect(flat.map((f) => f.category.slug)).toEqual(['fashion', 'men', 'women', 'electronics', 'audio']);
  });
});
