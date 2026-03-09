'use client';

import { create } from 'zustand';
import type { SnackProduct, CartItem, SaleRecord } from '@/lib/types';

// ============================================
// DEMO SNACK PRODUCTS
// ============================================
const initialSnacks: SnackProduct[] = [
    { id: 'a1', name: 'Çikolata', price: 25, image_url: '/snacks/cikolata.png', category: 'atistirmalik', stock: 0 },
    { id: 'a2', name: 'Bisküvi', price: 15, image_url: '/snacks/biskuvi.png', category: 'atistirmalik', stock: 0 },
    { id: 'a3', name: 'Çubuk Kraker', price: 12, image_url: '/snacks/kraker.png', category: 'atistirmalik', stock: 0 },
    { id: 'a4', name: 'Su (500ml)', price: 8, image_url: '/snacks/su.png', category: 'icecek', stock: 0 },
    { id: 'a5', name: 'Çay', price: 10, image_url: '/snacks/cay.png', category: 'icecek', stock: 0 },
    { id: 'a6', name: 'Türk Kahvesi', price: 20, image_url: '/snacks/kahve.png', category: 'icecek', stock: 0 },
];

// ============================================
// MARKET STORE (Zustand)
// ============================================
interface MarketState {
    snacks: SnackProduct[];
    cart: CartItem[];
    salesHistory: SaleRecord[];

    // Muavin (Steward) actions
    addStock: (productId: string) => void;
    removeStock: (productId: string) => void;

    // Yolcu (Passenger) actions
    addToCart: (productId: string) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;

    // Helpers
    getCartTotal: () => number;
    getCartItemCount: () => number;
    getSalesHistory: () => SaleRecord[];
}

export const useMarketStore = create<MarketState>((set, get) => ({
    snacks: initialSnacks,
    cart: [],
    salesHistory: [],

    // ── Muavin: stok artır ──
    addStock: (productId) =>
        set((state) => ({
            snacks: state.snacks.map((s) =>
                s.id === productId ? { ...s, stock: s.stock + 1 } : s
            ),
        })),

    // ── Muavin: stok azalt ──
    removeStock: (productId) =>
        set((state) => ({
            snacks: state.snacks.map((s) =>
                s.id === productId && s.stock > 0 ? { ...s, stock: s.stock - 1 } : s
            ),
        })),

    // ── Yolcu: sepete ekle ──
    addToCart: (productId) =>
        set((state) => {
            const product = state.snacks.find((s) => s.id === productId);
            if (!product || product.stock <= 0) return state;

            const existingItem = state.cart.find((c) => c.product.id === productId);
            const newSnacks = state.snacks.map((s) =>
                s.id === productId ? { ...s, stock: s.stock - 1 } : s
            );

            // Record sale
            const sale: SaleRecord = {
                id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                productId: product.id,
                productName: product.name,
                quantity: 1,
                unitPrice: product.price,
                totalPrice: product.price,
                companyId: 'c1', // default, set by context
                date: new Date().toISOString(),
            };

            if (existingItem) {
                return {
                    snacks: newSnacks,
                    salesHistory: [...state.salesHistory, sale],
                    cart: state.cart.map((c) =>
                        c.product.id === productId
                            ? { ...c, quantity: c.quantity + 1, product: { ...c.product, stock: c.product.stock - 1 } }
                            : c
                    ),
                };
            }

            return {
                snacks: newSnacks,
                salesHistory: [...state.salesHistory, sale],
                cart: [...state.cart, { product: { ...product, stock: product.stock - 1 }, quantity: 1 }],
            };
        }),

    // ── Yolcu: sepetten çıkar ──
    removeFromCart: (productId) =>
        set((state) => {
            const cartItem = state.cart.find((c) => c.product.id === productId);
            if (!cartItem) return state;

            const newSnacks = state.snacks.map((s) =>
                s.id === productId ? { ...s, stock: s.stock + 1 } : s
            );

            if (cartItem.quantity <= 1) {
                return {
                    snacks: newSnacks,
                    cart: state.cart.filter((c) => c.product.id !== productId),
                };
            }

            return {
                snacks: newSnacks,
                cart: state.cart.map((c) =>
                    c.product.id === productId ? { ...c, quantity: c.quantity - 1 } : c
                ),
            };
        }),

    clearCart: () => set({ cart: [] }),

    getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    },

    getCartItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    getSalesHistory: () => {
        return get().salesHistory;
    },
}));
