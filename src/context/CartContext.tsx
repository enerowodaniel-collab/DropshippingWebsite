import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { applyStorefrontCartOverride } from '@/lib/storefrontCatalog';
import type { CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantValue?: string) => void;
  updateQuantity: (productId: string, variantValue: string | undefined, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'novashop-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]).map(applyStorefrontCartOverride) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    const currentItem = applyStorefrontCartOverride(item);
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === currentItem.productId && i.variantValue === currentItem.variantValue
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === currentItem.productId && i.variantValue === currentItem.variantValue
            ? { ...currentItem, quantity: i.quantity + currentItem.quantity }
            : i
        );
      }
      return [...prev, currentItem];
    });
  }, []);

  const removeItem = useCallback((productId: string, variantValue?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantValue === variantValue))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantValue: string | undefined, quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variantValue === variantValue
            ? { ...i, quantity }
            : i
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.variantPriceAdjustment
      ? item.price + item.variantPriceAdjustment
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
