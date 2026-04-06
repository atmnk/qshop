"use client";

import React, { createContext, useContext, useEffect, useReducer } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QTY"; id: string; quantity: number }
  | { type: "CLEAR" };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) return { items: state.items.filter((i) => i.id !== action.id) };
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] }, (init) => {
    if (typeof window === "undefined") return init;
    try {
      const stored = localStorage.getItem(`${process.env.NEXT_PUBLIC_APP_NAME}_cart`);
      return stored ? JSON.parse(stored) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem(`${process.env.NEXT_PUBLIC_APP_NAME}_cart`, JSON.stringify(state));
  }, [state]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalPrice,
        addItem: (item) => dispatch({ type: "ADD", item }),
        removeItem: (id) => dispatch({ type: "REMOVE", id }),
        updateQty: (id, quantity) => dispatch({ type: "UPDATE_QTY", id, quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
