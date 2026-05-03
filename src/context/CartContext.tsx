import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: number | string;
  title: string;
  price: number;
  priceStr: string;
  image: string;
  quantity: number;
  addOns?: { name: string, price: number }[];
  availableAddOns?: { name: string, price: number }[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  toggleAddOn: (itemId: number | string, addon: { name: string, price: number }) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          return JSON.parse(savedCart);
        } catch (e) {
          console.error("Failed to parse cart from local storage", e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const qtyToAdd = item.quantity || 1;

      if (existing) {
        toast.success(qtyToAdd > 1 ? `Added ${qtyToAdd} ${item.title} to cart` : `Increased ${item.title} quantity in cart`);
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i
        );
      }
      toast.success(qtyToAdd > 1 ? `Added ${qtyToAdd} ${item.title} to cart` : `Added ${item.title} to cart`);
      return [...prev, { ...item, quantity: qtyToAdd }];
    });
  };

  const removeFromCart = (id: number | string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number | string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== id);
      }
      return prev.map((i) => (String(i.id) === String(id) ? { ...i, quantity } : i));
    });
  };

  const toggleAddOn = (itemId: number | string, addon: { name: string, price: number }) => {
    setCart((prev) => prev.map((item) => {
      if (String(item.id) !== String(itemId)) return item;

      const currentAddOns = item.addOns || [];
      const hasAddon = currentAddOns.some(a => a.name === addon.name);

      let newAddOns;
      let newPrice = item.price;

      if (hasAddon) {
        newAddOns = currentAddOns.filter(a => a.name !== addon.name);
        newPrice -= addon.price;
      } else {
        newAddOns = [...currentAddOns, addon];
        newPrice += addon.price;
      }

      return { ...item, addOns: newAddOns, price: newPrice };
    }));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, toggleAddOn, clearCart, totalItems, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
