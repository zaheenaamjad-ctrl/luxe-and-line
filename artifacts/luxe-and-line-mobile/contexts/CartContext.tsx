import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, size?: string | null) => void;
  updateQuantity: (productId: number, size: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "luxe_mobile_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((v) => {
      if (v) {
        try { setItems(JSON.parse(v)); } catch {}
      }
    });
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );
      let next: CartItem[];
      if (idx >= 0) {
        next = prev.map((i, index) =>
          index === idx ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        next = [...prev, item];
      }
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: number, size?: string | null) => {
    setItems((prev) => {
      const next = prev.filter(
        (i) => !(i.productId === productId && i.size === size)
      );
      AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: number, size: string | null | undefined, quantity: number) => {
      setItems((prev) => {
        let next: CartItem[];
        if (quantity <= 0) {
          next = prev.filter(
            (i) => !(i.productId === productId && i.size === size)
          );
        } else {
          next = prev.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity }
              : i
          );
        }
        AsyncStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
