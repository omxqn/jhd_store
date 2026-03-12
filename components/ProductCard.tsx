"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/data";
import { useStore, formatPrice } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./ProductCard.module.css";
import { QuickViewModal } from "@/components/QuickViewModal";
import Portal from "@/components/Portal";

function renderBadge(badge: string) {
    const map: Record<string, { label: string; cls: string }> = {
        sale: { label: "On Sale", cls: styles.badgeSale },
        norefund: { label: "No Refund/Replacement", cls: styles.badgeNoref },
        oos: { label: "Out of Stock", cls: styles.badgeOos },
        new: { label: "New", cls: styles.badgeNew },
    };
    const b = map[badge];
    return b ? <span key={badge} className={`${styles.badge} ${b.cls}`}>{b.label}</span> : null;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : 0.25 }}>★</span>
            ))}
        </div>
    );
}

export function ProductCard({ product }: { product: Product }) {
    const router = useRouter();
    const { country, toggleWishlist, wishlist, addToCart } = useStore();
    const [quickViewOpen, setQuickViewOpen] = useState(false);
    const isWishlisted = wishlist.includes(product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();

        // Redirect if product requires selection:
        // 1. Not pre-made (requires tailoring options)
        // 2. Has custom option groups
        // 3. Has specific sizes or colors
        const needsSelection = !product.isPremade || 
                               (product.options && product.options.length > 0) ||
                               (product.sizes && product.sizes.length > 0) ||
                               (product.colors && product.colors.length > 0);

        if (needsSelection) {
            toast("Please select your options 🎀");
            router.push(`/product/${product.id}`);
            return;
        }

        const hasOptions =
            (product.fabricTypes && product.fabricTypes.length > 0) ||
            (product.necklineShapes && product.necklineShapes.length > 0) ||
            (product.sizes && product.sizes.length > 0) ||
            (product.colors && product.colors.length > 0);

        if (hasOptions) {
            toast("Please select your options on the product page 🎀");
            router.push(`/product/${product.id}`);
            return;
        }

        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            fabricType: "Default",
            neckline: "Default",
            stitch: false,
            stitchPrice: 0,
            accessories: ["None"],
            image: product.images[0],
            shippingCost: product.shippingCost || 2,
        });
        toast.success(`${product.name} added to cart! 🛒`);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleWishlist(product.id);
        toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
    };

    return (
        <>
            <div className={styles.card}>
                <Link href={`/product/${product.id}`} className={styles.imageWrap}>
                    <img src={product.images[0]} alt={product.name} className={styles.image} />

                    {/* Tags / Badges */}
                    {product.badges && product.badges.length > 0 && (
                        <div className={styles.badges}>
                            {product.badges.map(b => renderBadge(b))}
                        </div>
                    )}

                    {/* Floating Heart Action Top Left */}
                    <button
                        className={`${styles.actionBtn} ${isWishlisted ? styles.wishlisted : ""}`}
                        onClick={handleWishlist}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </button>

                    {/* Hover Actions: Quick View & Add to Cart */}
                    <div className={styles.hoverActions}>
                        <button
                            className={`${styles.hoverBtn} ${styles.btnQuickView}`}
                            data-no-loader="true"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setQuickViewOpen(true);
                            }}
                            title="Quick View"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button
                            className={`${styles.hoverBtn} ${styles.btnAddCart}`}
                            onClick={handleAddToCart}
                            title="Add to Cart"
                        >
                            <span className={styles.iconSvg}>💼</span>
                        </button>
                    </div>
                </Link>

                <div className={styles.info}>
                    <Link href={`/product/${product.id}`} className={styles.name}>{product.name}</Link>
                    <div className={styles.priceRow}>
                        <span className={styles.priceCurrent}>{formatPrice(product.price, country)}</span>
                        {product.oldPrice && (
                            <span className={styles.priceOld}>{formatPrice(product.oldPrice, country)}</span>
                        )}
                    </div>
                </div>
            </div>

            {quickViewOpen && (
                <Portal>
                    <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />
                </Portal>
            )}
        </>
    );
}
