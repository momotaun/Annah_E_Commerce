"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CartResponse } from "@/src/lib/api-types";
import { addToCart, getCart, updateCartItem, removeCartItem } from "@/src/lib/api/cart";

interface CartContextValue {
  cart: CartResponse | null;
  isLoading: boolean;
  itemCount: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  /** Sets a product's cart quantity directly — add/update/remove, whichever
      applies — for quantity-selector controls that don't track cart item ids. */
  setProductQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const SESSION_STORAGE_KEY = "apex_cart_session_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, restore any existing cart session from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!sessionId) {
        setIsLoading(false);
        return;
      }
      getCart(sessionId)
        .then(setCart)
        .catch(() => localStorage.removeItem(SESSION_STORAGE_KEY))
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function addItem(productId: string, quantity = 1) {
    const sessionId = cart?.sessionId ?? localStorage.getItem(SESSION_STORAGE_KEY) ?? undefined;
    const updated = await addToCart(productId, quantity, sessionId);
    localStorage.setItem(SESSION_STORAGE_KEY, updated.sessionId);
    setCart(updated);
  }

  async function updateItem(itemId: string, quantity: number) {
    if (!cart) return;
    const updated = await updateCartItem(cart.sessionId, itemId, quantity);
    setCart(updated);
  }

  async function removeItem(itemId: string) {
    if (!cart) return;
    const updated = await removeCartItem(cart.sessionId, itemId);
    setCart(updated);
  }

  async function setProductQuantity(productId: string, quantity: number) {
    const existing = cart?.items.find((item) => item.productId === productId);
    if (existing) {
      if (quantity <= 0) {
        await removeItem(existing.id);
      } else {
        await updateItem(existing.id, quantity);
      }
    } else if (quantity > 0) {
      await addItem(productId, quantity);
    }
  }

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, isLoading, itemCount, addItem, updateItem, removeItem, setProductQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}