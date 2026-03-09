import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: number;
  title: string;
  price: number; 
  priceStr: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== id);
      }
      return prev.map((i) => (i.id === id ? { ...i, quantity } : i));
    });
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}
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
