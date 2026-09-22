import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistProvider, useWishlist } from './WishlistContext';
import * as wishlistApi from '@/src/lib/api/wishlist';

const mockPush = vi.fn();
let mockUser: { id: string } | null = null;

vi.mock('@/src/lib/api/wishlist');
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/products/test-product',
}));
vi.mock('./AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const product = {
  id: 'product-1',
  name: 'Test Product',
  slug: 'test-product',
  sku: 'SKU-1',
  description: null,
  price: '100.00',
  compareAtPrice: null,
  imageUrl: null,
  images: [],
  averageRating: null,
  deliveryOption: null,
  segment: null,
  options: [],
  categoryId: 'cat-1',
  vendorId: null,
  vendor: null,
};

function TestConsumer() {
  const { items, isLoading, isWishlisted, toggleWishlist } = useWishlist();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="count">{items.length}</span>
      <span data-testid="has-product-1">{isWishlisted('product-1') ? 'yes' : 'no'}</span>
      <button onClick={() => toggleWishlist('product-1')}>Toggle</button>
    </div>
  );
}

describe('WishlistContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  it('stays empty and does not call the API when logged out', async () => {
    render(
      <WishlistProvider>
        <TestConsumer />
      </WishlistProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(wishlistApi.getWishlist).not.toHaveBeenCalled();
  });

  it('redirects to login instead of calling the API when toggling while logged out', async () => {
    const user = userEvent.setup();
    render(
      <WishlistProvider>
        <TestConsumer />
      </WishlistProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    await user.click(screen.getByText('Toggle'));

    expect(mockPush).toHaveBeenCalledWith('/login?redirect=%2Fproducts%2Ftest-product');
    expect(wishlistApi.addToWishlist).not.toHaveBeenCalled();
  });

  it('loads the wishlist when a user is present', async () => {
    mockUser = { id: 'user-1' };
    vi.mocked(wishlistApi.getWishlist).mockResolvedValue([
      { id: 'w1', productId: 'product-1', product, createdAt: '2026-01-01' },
    ]);

    render(
      <WishlistProvider>
        <TestConsumer />
      </WishlistProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    expect(screen.getByTestId('has-product-1')).toHaveTextContent('yes');
  });

  it('toggling an already-saved product removes it optimistically', async () => {
    mockUser = { id: 'user-1' };
    vi.mocked(wishlistApi.getWishlist).mockResolvedValue([
      { id: 'w1', productId: 'product-1', product, createdAt: '2026-01-01' },
    ]);
    vi.mocked(wishlistApi.removeFromWishlist).mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(
      <WishlistProvider>
        <TestConsumer />
      </WishlistProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    await user.click(screen.getByText('Toggle'));

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'));
    expect(wishlistApi.removeFromWishlist).toHaveBeenCalledWith('product-1');
  });

  it('toggling a new product adds it and refetches the full list', async () => {
    mockUser = { id: 'user-1' };
    vi.mocked(wishlistApi.getWishlist)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: 'w1', productId: 'product-1', product, createdAt: '2026-01-01' },
      ]);
    vi.mocked(wishlistApi.addToWishlist).mockResolvedValue({
      id: 'w1',
      productId: 'product-1',
      createdAt: '2026-01-01',
    });

    const user = userEvent.setup();
    render(
      <WishlistProvider>
        <TestConsumer />
      </WishlistProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'));
    await user.click(screen.getByText('Toggle'));

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    expect(wishlistApi.addToWishlist).toHaveBeenCalledWith('product-1');
  });
});
