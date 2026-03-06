"use client";
import Link from "next/link";
import { Product } from "@/lib/data";
import { useStore, formatPrice } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./QuickViewModal.module.css";

function StarRating({ rating }: { rating: number }) {
    return (
        <span style={{ color: "var(--primary)", fontSize: ".8rem" }}>
            {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ opacity: i <= Math.round(rating) ? 1 : .25 }}>★</span>)}
        </span>
    );
}

export function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const { country, addToCart, toggleWishlist, wishlist } = useStore();
    const isWishlisted = wishlist.includes(product.id);

    const handleAdd = () => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            fabricType: product.fabricTypes[0],
            neckline: product.necklineShapes[0]?.name ?? "Classic Round",
            stitch: false,
            stitchPrice: 0,
            accessories: ["None"],
            image: product.images[0],
        });
        toast.success("Added to cart! 💼");
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
                            <div style={{ fontSize: ".65rem", color: "var(--text-faint)", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".5rem" }}>#{product.id}</div>
                            <h3 style={{ fontFamily: "var(--ff-serif)", fontSize: "2rem", color: "var(--secondary)", fontWeight: 500, lineHeight: 1.2 }}>{product.name}</h3>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                            <StarRating rating={product.rating} />
                            <span style={{ fontSize: ".75rem", color: "var(--text-faint)" }}>{product.reviews} reviews</span>
                        </div>

                        <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--secondary)" }}>
                            {formatPrice(product.price, country)}
                            {product.oldPrice && (
                                <span style={{ fontSize: ".9rem", color: "var(--text-faint)", textDecoration: "line-through", marginLeft: ".75rem", fontWeight: 400 }}>
                                    {formatPrice(product.oldPrice, country)}
                                </span>
                            )}
                        </div>

                        <p style={{ fontSize: ".95rem", color: "var(--text-muted)", lineHeight: 1.8, fontWeight: 300 }}>{product.description}</p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                            <button onClick={handleAdd} className="btn btnPrimary btnBlock btnLg" style={{ gap: "0.75rem" }}>
                                💼 Add to Shopping Bag
                            </button>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button onClick={() => { toggleWishlist(product.id); toast(isWishlisted ? "Removed from wishlist" : "♥ Added to wishlist"); }} style={{
                                    flex: 1, padding: "1rem", borderRadius: "9999px",
                                    background: "transparent", border: "1px solid var(--border)",
                                    color: isWishlisted ? "var(--danger)" : "var(--secondary)",
                                    cursor: "pointer", fontWeight: 700, fontSize: ".75rem",
                                    textTransform: "uppercase", letterSpacing: ".1em", transition: "all 200ms ease",
                                }}>
                                    {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
                                </button>
                                <Link href={`/product/${product.id}`} onClick={onClose} style={{
                                    flex: 1, padding: "1rem", borderRadius: "9999px",
                                    background: "var(--surface-2)", border: "none", color: "var(--secondary)",
                                    fontWeight: 700, fontSize: ".75rem", textTransform: "uppercase",
                                    letterSpacing: ".1em", display: "flex", alignItems: "center", justifyContent: "center",
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
