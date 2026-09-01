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

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, itemCount, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}