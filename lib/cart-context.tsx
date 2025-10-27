"use client";
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; quantity: number }
  | { type: "CLEAR" };

const initialState: CartState = { items: [] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find((it) => it.id === action.item.id);
      if (existing) {
        return {
          items: state.items.map((it) =>
            it.id === action.item.id
              ? { ...it, quantity: it.quantity + (action.quantity ?? 1) }
              : it
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...action.item, quantity: action.quantity ?? 1 },
        ],
      };
    }
    case "REMOVE":
      return { items: state.items.filter((it) => it.id !== action.id) };
    case "SET_QTY":
      return {
        items: state.items
          .map((it) => (it.id === action.id ? { ...it, quantity: action.quantity } : it))
          .filter((it) => it.quantity > 0),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    if (typeof window === "undefined") return init;
    try {
      const raw = localStorage.getItem("cart:v1");
      return raw ? (JSON.parse(raw) as CartState) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart:v1", JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    return {
      items: state.items,
      subtotal,
      addToCart: (item, quantity) => dispatch({ type: "ADD", item, quantity }),
      removeFromCart: (id) => dispatch({ type: "REMOVE", id }),
      setQuantity: (id, quantity) => dispatch({ type: "SET_QTY", id, quantity }),
      clearCart: () => dispatch({ type: "CLEAR" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


