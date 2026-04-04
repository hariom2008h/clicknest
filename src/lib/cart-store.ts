import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  cover_image_url: string | null;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      if (state.items.find((i) => i.id === item.id)) return state;
      return { items: [...state.items, item] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  isInCart: (id) => get().items.some((i) => i.id === id),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));
