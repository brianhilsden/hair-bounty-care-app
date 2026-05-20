import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  productId: string;
  name: string;
  price: number;       // in KES
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  deliveryAddress: string;
  deliveryNotes: string;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryNotes: (notes: string) => void;
  clear: () => void;

  // Derived
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryAddress: '',
      deliveryNotes: '',

      addItem: (item) => {
        const existing = get().items.find(i => i.productId === item.productId);
        if (existing) {
          set({
            items: get().items.map(i =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter(i => i.productId !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
      setDeliveryNotes: (deliveryNotes) => set({ deliveryNotes }),

      clear: () => set({ items: [], deliveryAddress: '', deliveryNotes: '' }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist derived functions — only data
      partialize: (state) => ({
        items: state.items,
        deliveryAddress: state.deliveryAddress,
        deliveryNotes: state.deliveryNotes,
      }),
    }
  )
);
