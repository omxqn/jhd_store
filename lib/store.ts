"use client";
// =====================================================
// ZUSTAND GLOBAL STORE — Jihad Store
// =====================================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COUNTRIES, Country } from "./data";

export type CartItem = {
    productId: string;
    name: string;
    price: number;          // base price + stitch + accessories in OMR
    quantity: number;
    fabricType: string;
    fabricLength?: string;
    neckSize?: string;
    neckline: string;
    stitch: boolean;
    stitchPrice: number;
    accessoriesPrice?: number;
    tailorMeasurements?: Record<string, string>;
    accessories: string[];
    image: string;
};

export type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: "customer" | "admin" | "super_admin";
    phone?: string;
    address?: string;
    city?: string;
};

type StoreState = {
    country: Country;
    setCountry: (c: Country) => void;

    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    updateQty: (productId: string, qty: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;

    wishlist: string[];
    toggleWishlist: (id: string) => void;

    authUser: AuthUser | null;
    setAuthUser: (u: AuthUser | null) => void;
    clearAuth: () => void;
    verifyAuth: () => Promise<void>;
};

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            country: COUNTRIES[0],
            setCountry: (c) => set({ country: c }),

            cart: [],
            addToCart: (item) => {
                const existing = get().cart.find((i) =>
                    i.productId === item.productId &&
                    i.fabricType === item.fabricType &&
                    i.neckline === item.neckline &&
                    i.stitch === item.stitch
                );
                if (existing) {
                    set({ cart: get().cart.map((i) => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i) });
                } else {
                    set({ cart: [...get().cart, item] });
                }
            },
            updateQty: (productId, qty) =>
                set({
                    cart: qty <= 0
                        ? get().cart.filter((i) => i.productId !== productId)
                        : get().cart.map((i) => i.productId === productId ? { ...i, quantity: qty } : i)
                }),
            removeFromCart: (productId) =>
                set({ cart: get().cart.filter((i) => i.productId !== productId) }),
            clearCart: () => set({ cart: [] }),

            wishlist: [],
            toggleWishlist: (id) => {
                const wl = get().wishlist;
                set({ wishlist: wl.includes(id) ? wl.filter((w) => w !== id) : [...wl, id] });
            },

            authUser: null,
            setAuthUser: (u) => set({ authUser: u }),
            clearAuth: () => set({ authUser: null }),
            verifyAuth: async () => {
                try {
                    const res = await fetch("/api/auth/me");
                    if (res.ok) {
                        const data = await res.json();
                        set({ authUser: data.user });
                    } else {
                        set({ authUser: null });
                    }
                } catch {
                    set({ authUser: null });
                }
            },
        }),
        { name: "jihad-store-state" }
    )
);

// ── Currency helper ──────────────────────────────────
export function formatPrice(omrAmount: number, country: Country): string {
    const converted = omrAmount * country.rate;
    return `${country.symbol} ${converted.toFixed(2)}`;
}
