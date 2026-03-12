"use client";
import Link from "next/link";
import { useStore, formatPrice } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./page.module.css";

export default function CartPage() {
    const { cart, country, updateQty, removeFromCart } = useStore();

    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    if (cart.length === 0) return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💼</div>
            <h2 className={styles.emptyTitle}>Your Bag is Empty</h2>
            <p className={styles.emptyDesc}>Discover our latest collection and find your perfect fit.</p>
            <Link href="/" className="btn btnPrimary btnLg">Start Shopping</Link>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>
                    Shopping Bag <span>({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                </h1>

                <div className={styles.layout}>
                    {/* Items */}
                    <div className={styles.itemsList}>
                        {cart.map((item, idx) => (
                            <div key={idx} className={styles.itemCard}>
                                <img src={item.image} alt={item.name} className={styles.itemImage} />
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemHeader}>
                                        <div>
                                            <div className={styles.itemCode}>#{item.productId}</div>
                                            <h3 className={styles.itemName}>{item.name}</h3>
                                        </div>
                                        <button className={styles.removeBtn} onClick={() => { removeFromCart(item); toast("Item removed"); }}>
                                            🗑 Remove
                                        </button>
                                    </div>

                                    <div className={styles.itemOptions}>
                                        {!item.fabricType.includes("N/A") && <span className={styles.optionTag}>{item.fabricType}</span>}
                                        {item.size && <span className={styles.optionTag}>Size: {item.size}</span>}
                                        {item.color && <span className={styles.optionTag}>Color: {item.color}</span>}
                                        {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                            <span key={k} className={styles.optionTag}>{k}: {v}</span>
                                        ))}
                                        {!item.neckline.includes("N/A") && <span className={styles.optionTag}>{item.neckline}</span>}
                                        {item.stitch && <span className={`${styles.optionTag} ${styles.optionTagGold}`}>✂ Bespoke Tailored</span>}
                                        {item.accessories.filter(a => a !== "None").map(a => (
                                            <span key={a} className={styles.optionTag}>{a}</span>
                                        ))}
                                    </div>

                                    <div className={styles.itemFooter}>
                                        <div className={styles.qtyControls}>
                                            <button className={styles.qtyBtn} onClick={() => { updateQty(item, item.quantity - 1); }}>−</button>
                                            <span className={styles.qtyVal}>{item.quantity}</span>
                                            <button className={styles.qtyBtn} onClick={() => updateQty(item, item.quantity + 1)}>+</button>
                                        </div>
                                        <span className={styles.itemPrice}>{formatPrice(item.price * item.quantity, country)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className={styles.summaryCard}>
                        <h3 className={styles.summaryTitle}>Order Summary</h3>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Bag Subtotal</span>
                            <span className={styles.summaryVal}>{formatPrice(subtotal, country)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span className={styles.summaryLabel}>Estimated Shipping</span>
                            <span className={styles.summaryVal} style={{ color: "var(--success)" }}>TBD at Checkout</span>
                        </div>

                        <div className={styles.summaryTotal}>
                            <span className={styles.totalLabel}>Estimated Total</span>
                            <span className={styles.totalVal}>{formatPrice(subtotal, country)}</span>
                        </div>

                        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <Link href="/checkout" className="btn btnPrimary btnLg btnBlock">
                                Continue to Checkout ○
                            </Link>
                            <Link href="/" className={styles.removeBtn} style={{ justifyContent: "center", width: "100%" }}>
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
