import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryTree from './CategoryTree';
import type { Category } from '@/src/lib/api-types';

const categories = [
  {
    id: '1', name: 'Electronics', slug: 'electronics', parentId: null,
    children: [
      { id: '2', name: 'Audio', slug: 'audio', parentId: '1', children: [] },
      { id: '3', name: 'Computing', slug: 'computing', parentId: '1', children: [] },
    ],
  },
  { id: '4', name: 'Fashion', slug: 'fashion', parentId: null, children: [] },
] as unknown as Category[];

describe('CategoryTree', () => {
  it('lists the top-level categories as links', () => {
    render(<CategoryTree categories={categories} activeSlug="fashion" />);
    expect(screen.getByRole('link', { name: 'Fashion' })).toHaveAttribute('href', '/categories/fashion');
    expect(screen.getByRole('link', { name: 'Electronics' })).toHaveAttribute('href', '/categories/electronics');
  });

  it('keeps sub-categories collapsed for branches you are not viewing', () => {
    render(<CategoryTree categories={categories} activeSlug="fashion" />);
    expect(screen.queryByRole('link', { name: 'Audio' })).not.toBeInTheDocument();
  });

  it('expands every level down to a deeply nested active category', () => {
    const deep = [
      {
        id: '1', name: 'Fashion', slug: 'fashion', parentId: null,
        children: [
          {
            id: '2', name: 'Men', slug: 'men', parentId: '1',
            children: [{ id: '3', name: 'Tops', slug: 'men-tops', parentId: '2', children: [] }],
          },
          { id: '4', name: 'Women', slug: 'women', parentId: '1', children: [
            { id: '5', name: 'Shoes', slug: 'women-shoes', parentId: '4', children: [] },
          ] },
        ],
      },
    ] as unknown as Category[];
    render(<CategoryTree categories={deep} activeSlug="men-tops" />);
    expect(screen.getByRole('link', { name: 'Tops' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Women' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Shoes' })).not.toBeInTheDocument();
  });

  it('expands the active branch and marks the current page', () => {
    render(<CategoryTree categories={categories} activeSlug="audio" />);
    expect(screen.getByRole('link', { name: 'Audio' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Computing' })).toBeInTheDocument();
  });
});
