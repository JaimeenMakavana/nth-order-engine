// Zustand store for client-side cart state
import { create } from "zustand";
import type { CartItem, Product } from "@/types/ecommerce";

interface CartStore {
  items: CartItem[];
  products: Product[]; // Cache of products for display
  addItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setProducts: (products: Product[]) => void;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  products: [],

  addItem: (productId: string, quantity: number) => {
    const state = get();
    const existingItem = state.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      set({
        items: state.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        items: [...state.items, { productId, quantity }],
      });
    }
  },

  removeItem: (productId: string) => {
    set({
      items: get().items.filter((item) => item.productId !== productId),
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  setProducts: (products: Product[]) => {
    set({ products });
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
