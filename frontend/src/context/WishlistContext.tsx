"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { withLoginRedirect } from "@/src/lib/loginRedirect";
import {
  WishlistItem,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/src/lib/api/wishlist";

interface WishlistContextValue {
  items: WishlistItem[];
  isLoading: boolean;
  isWishlisted: (productId: string) => boolean;
  /** Adds or removes a product depending on its current state. Redirects a
      logged-out visitor to login (returning here afterwards) instead of
      calling the API, since the wishlist is always tied to an account. */
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setItems([]);
        setIsLoading(false);
        return;
      }
      getWishlist()
        .then(setItems)
        .catch(() => setItems([]))
        .finally(() => setIsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  function isWishlisted(productId: string) {
    return items.some((item) => item.productId === productId);
  }

  async function toggleWishlist(productId: string) {
    if (!user) {
      router.push(withLoginRedirect(pathname));
      return;
    }

    const existing = items.find((item) => item.productId === productId);
    if (existing) {
      // Optimistic: drop it immediately, restore on failure rather than
      // leaving the UI stuck showing a state the server never confirmed.
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      try {
        await removeFromWishlist(productId);
      } catch {
        setItems((prev) => [...prev, existing]);
      }
    } else {
      try {
        // addToWishlist's response omits the nested product, so refetch
        // the full list rather than trying to assemble a partial item.
        await addToWishlist(productId);
        const refreshed = await getWishlist();
        setItems(refreshed);
      } catch {
        // Nothing to roll back — the item was never added to state.
      }
    }
  }

  return (
    <WishlistContext.Provider value={{ items, isLoading, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
