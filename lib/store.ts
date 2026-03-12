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
    shippingCost: number;
    size?: string;
    color?: string;
    selectedOptions?: Record<string, string>;
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
    updateQty: (item: CartItem, qty: number) => void;
    removeFromCart: (item: CartItem) => void;
    clearCart: () => void;

    wishlist: string[];
    toggleWishlist: (id: string) => void;

    authUser: AuthUser | null;
    token: string | null;
    setAuthUser: (u: AuthUser | null, t?: string | null) => void;
    clearAuth: () => void;
    verifyAuth: () => Promise<void>;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
};

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            isLoading: false,
            setIsLoading: (val) => set({ isLoading: val }),
            country: COUNTRIES[0],
            setCountry: (c) => set({ country: c }),

            cart: [],
            addToCart: (item) => {
                const existing = get().cart.find((i) => compareItems(i, item));
                if (existing) {
                    set({ cart: get().cart.map((i) => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i) });
                } else {
                    set({ cart: [...get().cart, item] });
                }
            },
            updateQty: (item, qty) =>
                set({
                    cart: qty <= 0
                        ? get().cart.filter((i) => !compareItems(i, item))
                        : get().cart.map((i) => compareItems(i, item) ? { ...i, quantity: qty } : i)
                }),
            removeFromCart: (item) =>
                set({ cart: get().cart.filter((i) => !compareItems(i, item)) }),
            clearCart: () => set({ cart: [] }),

            wishlist: [],
            toggleWishlist: (id) => {
                const wl = get().wishlist;
                set({ wishlist: wl.includes(id) ? wl.filter((w) => w !== id) : [...wl, id] });
            },

            authUser: null,
            token: null,
            setAuthUser: (u, t) => set({
                authUser: u,
                ...(t !== undefined ? { token: t } : {})
            }),
            clearAuth: () => set({ authUser: null, token: null }),
            verifyAuth: async () => {
                const { token } = get();
                try {
                    const res = await fetch("/api/auth/me", {
                        headers: token ? { "Authorization": `Bearer ${token}` } : {}
                    });
                    if (res.ok) {
                        const data = await res.json();
                        set({ authUser: data.user });
                    } else {
                        set({ authUser: null, token: null });
                    }
                } catch {
                    set({ authUser: null, token: null });
                }
            },
        }),
        {
            name: "jihad-store-state",
            partialize: (state) => ({
                country: state.country,
                cart: state.cart,
                wishlist: state.wishlist,
                token: state.token,
            }),
        }
    )
);

// ── Currency helper ──────────────────────────────────
export function formatPrice(omrAmount: number, country: Country): string {
    const converted = omrAmount * country.rate;
    return `${country.symbol} ${converted.toFixed(2)}`;
}

// ── Item comparison helper ────────────────────────────
function compareItems(a: CartItem, b: CartItem): boolean {
    return (
        a.productId === b.productId &&
        a.fabricType === b.fabricType &&
        a.neckline === b.neckline &&
        a.stitch === b.stitch &&
        a.size === b.size &&
        a.color === b.color &&
        JSON.stringify(a.accessories.sort()) === JSON.stringify(b.accessories.sort()) &&
        JSON.stringify(a.selectedOptions) === JSON.stringify(b.selectedOptions)
    );
}
