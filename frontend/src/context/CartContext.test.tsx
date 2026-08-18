import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';
import * as cartApi from '@/src/lib/api/cart';

vi.mock('@/src/lib/api/cart');

function TestConsumer() {
  const { cart, itemCount, isLoading, addItem, updateItem, removeItem } = useCart();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="cart-id">{cart?.id ?? 'no-cart'}</span>
      <button onClick={() => addItem('product-1', 1)}>Add</button>
      {cart?.items.map((item) => (
        <div key={item.id}>
          <span data-testid={`qty-${item.id}`}>{item.quantity}</span>
          <button onClick={() => updateItem(item.id, 5)}>Update {item.id}</button>
          <button onClick={() => removeItem(item.id)}>Remove {item.id}</button>
        </div>
      ))}
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with no cart and isLoading false when localStorage has no session', async () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(screen.getByTestId('cart-id')).toHaveTextContent('no-cart');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('restores an existing cart from a stored sessionId on mount', async () => {
    localStorage.setItem('apex_cart_session_id', 'existing-session');
    vi.mocked(cartApi.getCart).mockResolvedValue({
      id: 'cart-1',
      sessionId: 'existing-session',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 2,
          product: { id: 'product-1', name: 'Test Product', price: '50.00', imageUrl: null },
          lineTotal: '100.00',
        },
      ],
      subtotal: '100.00',
    });

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('cart-id')).toHaveTextContent('cart-1'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(cartApi.getCart).toHaveBeenCalledWith('existing-session');
  });

  it('clears the stored sessionId if restoring the cart fails (stale/invalid session)', async () => {
    localStorage.setItem('apex_cart_session_id', 'stale-session');
    vi.mocked(cartApi.getCart).mockRejectedValue(new Error('404'));

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    expect(localStorage.getItem('apex_cart_session_id')).toBeNull();
  });

  it('addItem stores the returned sessionId and updates cart state', async () => {
    vi.mocked(cartApi.addToCart).mockResolvedValue({
      id: 'cart-1',
      sessionId: 'new-session',
      items: [
        {
          id: 'item-1',
          productId: 'product-1',
          quantity: 1,
          product: { id: 'product-1', name: 'Test', price: '50.00', imageUrl: null },
          lineTotal: '50.00',
        },
      ],
      subtotal: '50.00',
    });

    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('ready'));
    await user.click(screen.getByText('Add'));

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'));
    expect(localStorage.getItem('apex_cart_session_id')).toBe('new-session');
  });

  it('itemCount sums quantities across multiple line items, not just item count', async () => {
    localStorage.setItem('apex_cart_session_id', 'session-1');
    vi.mocked(cartApi.getCart).mockResolvedValue({
      id: 'cart-1',
      sessionId: 'session-1',
      items: [
        { id: 'item-1', productId: 'p1', quantity: 3, product: { id: 'p1', name: 'A', price: '10', imageUrl: null }, lineTotal: '30.00' },
        { id: 'item-2', productId: 'p2', quantity: 2, product: { id: 'p2', name: 'B', price: '20', imageUrl: null }, lineTotal: '40.00' },
      ],
      subtotal: '70.00',
    });

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>,
    );

    // 3 + 2 = 5, not 2 (item count) — confirms itemCount sums quantities correctly
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('5'));
  });
});