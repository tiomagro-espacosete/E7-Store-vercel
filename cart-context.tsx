"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Cart } from "@/lib/types";

interface CartContextType {
  cart: Cart;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addItem = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev?.items?.find((i) => i?.productId === item?.productId);
      let items;
      if (existing) {
        items = prev.items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        items = [...(prev?.items ?? []), item];
      }
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, total };
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => {
      const items = prev?.items?.filter((i) => i?.productId !== productId) ?? [];
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, total };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId);
    setCart((prev) => {
      const items = prev?.items?.map((i) =>
        i?.productId === productId ? { ...i, quantity } : i
      ) ?? [];
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items, total };
    });
  };

  const clearCart = () => setCart({ items: [], total: 0 });

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
