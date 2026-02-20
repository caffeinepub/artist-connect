import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    type: 'product' | 'gig' | 'music';
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    artist?: string;
    subcategory?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getCartItemCount: () => number;
    getCartTotal: () => number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) =>
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === item.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            )
                        };
                    }
                    return { items: [...state.items, { ...item, quantity: 1 }] };
                }),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id)
                })),
            updateQuantity: (id, quantity) =>
                set((state) => ({
                    items:
                        quantity <= 0
                            ? state.items.filter((item) => item.id !== id)
                            : state.items.map((item) => (item.id === id ? { ...item, quantity } : item))
                })),
            clearCart: () => set({ items: [] }),
            getCartItemCount: () => {
                const state = get();
                return state.items.reduce((total, item) => total + item.quantity, 0);
            },
            getCartTotal: () => {
                const state = get();
                return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
            }
        }),
        {
            name: 'artist-connect-cart'
        }
    )
);
