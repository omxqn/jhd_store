import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/data";
import { useStore, formatPrice } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./QuickViewModal.module.css";

function StarRating({ rating }: { rating: number }) {
    return (
        <span style={{ color: "var(--primary)", fontSize: "1.15rem" }}>
            {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : .25 }}>★</span>)}
        </span>
    );
}

export function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const { country, addToCart, toggleWishlist, wishlist } = useStore();
    const isWishlisted = wishlist.includes(product.id);
    const router = useRouter();

    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");

    const handleAdd = () => {
        // Redirect if product requires selection:
        // 1. Not pre-made (requires tailoring options)
        // 2. Has custom option groups
        const needsComplexSelection = !product.isPremade || 
                                     (product.options && product.options.length > 0) ||
                                     (product.fabricTypes && product.fabricTypes.length > 0) ||
                                     (product.necklineShapes && product.necklineShapes.length > 0);

        if (needsComplexSelection) {
            toast("Please configure your tailored options 🎀");
            router.push(`/product/${product.id}`);
            onClose();
            return;
        }

        if (product.sizes?.length > 0 && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        if (product.colors?.length > 0 && !selectedColor) {
            toast.error("Please select a color");
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
            size: selectedSize,
            color: selectedColor,
        });
        toast.success("Added to cart! 🛒");
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.closeBtn}>✕</button>

                <div className={styles.grid}>
                    {/* Image */}
                    <div className={styles.imageWrap}>
                        <img src={product.images[0]} alt={product.name} className={styles.image} />
                    </div>

                    {/* Info */}
                    <div className={styles.infoCol}>
                        <div>
                            <div style={{ fontSize: "1.15rem", color: "var(--text-faint)", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: ".75rem" }}>#{product.id}</div>
                            <h3 style={{ fontFamily: "var(--ff-serif)", fontSize: "3rem", color: "var(--secondary)", fontWeight: 700, lineHeight: 1.2 }}>{product.name}</h3>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <StarRating rating={product.rating} />
                            <span style={{ fontSize: "1.15rem", color: "var(--text-faint)", fontWeight: 500 }}>{product.reviews} reviews</span>
                        </div>

                        <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--secondary)", marginBlock: ".5rem" }}>
                            {formatPrice(product.price, country)}
                            {product.oldPrice && (
                                <span style={{ fontSize: "1.6rem", color: "var(--text-faint)", textDecoration: "line-through", marginLeft: "1rem", fontWeight: 500 }}>
                                    {formatPrice(product.oldPrice, country)}
                                </span>
                            )}
                        </div>

                        <p style={{ fontSize: "1.4rem", color: "var(--text-muted)", lineHeight: 1.6, fontWeight: 400, maxWidth: "600px" }}>{product.description}</p>

                        {/* Options Selection */}
                        <div className={styles.optionsWrap}>
                            {product.sizes?.length > 0 && (
                                <div className={styles.optionGroup}>
                                    <div className={styles.optionLabel}>Size: <span>{selectedSize}</span></div>
                                    <div className={styles.pillGrid}>
                                        {product.sizes.map(s => (
                                            <button 
                                                key={s} 
                                                className={`${styles.optionPill} ${selectedSize === s ? styles.pillActive : ""}`}
                                                onClick={() => setSelectedSize(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.colors?.length > 0 && (
                                <div className={styles.optionGroup}>
                                    <div className={styles.optionLabel}>Color: <span>{selectedColor}</span></div>
                                    <div className={styles.pillGrid}>
                                        {product.colors.map(c => (
                                            <button 
                                                key={c} 
                                                className={`${styles.optionPill} ${selectedColor === c ? styles.pillActive : ""}`}
                                                onClick={() => setSelectedColor(c)}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                            <button onClick={handleAdd} className="btn btnPrimary btnBlock btnLg" style={{ gap: "0.75rem", background: "var(--primary)" }}>
                                💼 Add to Shopping Bag
                            </button>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button onClick={() => { toggleWishlist(product.id); toast(isWishlisted ? "Removed from wishlist" : "♥ Added to wishlist"); }} style={{
                                    flex: 1, padding: "1.25rem", borderRadius: "9999px",
                                    background: "transparent", border: "2px solid var(--border)",
                                    color: isWishlisted ? "var(--danger)" : "var(--secondary)",
                                    cursor: "pointer", fontWeight: 800, fontSize: "1.1rem",
                                    textTransform: "uppercase", letterSpacing: ".12em", transition: "all 200ms ease",
                                }}>
                                    {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
                                </button>
                                <Link href={`/product/${product.id}`} onClick={onClose} style={{
                                    flex: 1, padding: "1.25rem", borderRadius: "9999px",
                                    background: "var(--surface-2)", border: "none", color: "var(--secondary)",
                                    fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase",
                                    letterSpacing: ".12em", display: "flex", alignItems: "center", justifyContent: "center",
                                    textDecoration: "none", transition: "all 200ms ease",
                                }}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
