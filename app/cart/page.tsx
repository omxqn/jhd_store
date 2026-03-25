"use client";
import Link from "next/link";
import { useStore, formatPrice } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./page.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function CartPage() {
    const { cart, country, updateQty, removeFromCart } = useStore();
    const { lang, t, isRTL } = useLanguage();

    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);

    if (cart.length === 0) return (
        <div className={styles.emptyState}>
            <div className={styles.emptyIcon} style={{ fontSize: "5rem" }}>💼</div>
            <h2 className={styles.emptyTitle} style={{ fontSize: "2.5rem" }}>{t('cart.empty')}</h2>
            <p className={styles.emptyDesc} style={{ fontSize: "1.2rem" }}>{lang === 'ar' ? 'اكتشفي أحدث مجموعاتنا واعثري على المقاس المثالي لك.' : 'Discover our latest collection and find your perfect fit.'}</p>
            <Link href="/" className="btn btnPrimary btnLg" style={{ fontSize: "1.2rem", padding: "1rem 2.5rem" }}>{t('home.shop_now')}</Link>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title} style={{ fontSize: "2.5rem" }}>
                    {t('cart.title')} <span style={{ fontSize: "1.5rem" }}>({cart.length} {lang === 'ar' ? 'عناصر' : (cart.length === 1 ? 'item' : 'items')})</span>
                </h1>

                <div className={styles.layout}>
                    {/* Items */}
                    <div className={styles.itemsList}>
                        {cart.map((item, idx) => (
                            <div key={idx} className={styles.itemCard}>
                                <img src={item.image} alt={item.name} className={styles.itemImage} style={{ width: "120px", height: "auto" }} />
                                <div className={styles.itemInfo} style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                                    <div className={styles.itemHeader}>
                                        <div>
                                            <div className={styles.itemCode} style={{ fontSize: "1rem" }}>#{item.productId}</div>
                                            <h3 className={styles.itemName} style={{ fontSize: "1.4rem" }}>{item.name}</h3>
                                        </div>
                                        <button className={styles.removeBtn} onClick={() => { removeFromCart(item); toast(lang === 'ar' ? "تمت إزالة العنصر" : "Item removed"); }} style={{ fontSize: "1.1rem" }}>
                                            🗑 {lang === 'ar' ? 'إزالة' : 'Remove'}
                                        </button>
                                    </div>

                                    <div className={styles.itemOptions} style={{ fontSize: "1.1rem" }}>
                                        {!item.fabricType.includes("N/A") && <span className={styles.optionTag}>{item.fabricType}</span>}
                                        {item.size && <span className={styles.optionTag}>{t('product.size')}: {item.size}</span>}
                                        {item.color && <span className={styles.optionTag}>{t('product.color')}: {item.color}</span>}
                                        {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => (
                                            <span key={k} className={styles.optionTag}>{k}: {v}</span>
                                        ))}
                                        {!item.neckline.includes("N/A") && <span className={styles.optionTag}>{item.neckline}</span>}
                                        {item.stitch && <span className={`${styles.optionTag} ${styles.optionTagGold}`}>✂ {lang === 'ar' ? 'تفصيل مخصص' : 'Bespoke Tailored'}</span>}
                                        {item.accessories.filter(a => a !== "None").map(a => (
                                            <span key={a} className={styles.optionTag}>{a}</span>
                                        ))}
                                    </div>

                                    <div className={styles.itemFooter}>
                                        <div className={styles.qtyControls} style={{ fontSize: "1.2rem" }}>
                                            <button className={styles.qtyBtn} style={{ padding: "0 1rem", fontSize: "1.5rem" }} onClick={() => { updateQty(item, item.quantity - 1); }}>−</button>
                                            <span className={styles.qtyVal}>{item.quantity}</span>
                                            <button className={styles.qtyBtn} style={{ padding: "0 1rem", fontSize: "1.5rem" }} onClick={() => updateQty(item, item.quantity + 1)}>+</button>
                                        </div>
                                        <span className={styles.itemPrice} style={{ fontSize: "1.4rem" }}>{formatPrice(item.price * item.quantity, country)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className={styles.summaryCard}>
                        <h3 className={styles.summaryTitle} style={{ fontSize: "1.6rem" }}>{lang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h3>
                        <div className={styles.summaryRow} style={{ fontSize: "1.2rem" }}>
                            <span className={styles.summaryLabel}>{t('cart.subtotal')}</span>
                            <span className={styles.summaryVal}>{formatPrice(subtotal, country)}</span>
                        </div>
                        <div className={styles.summaryRow} style={{ fontSize: "1.2rem" }}>
                            <span className={styles.summaryLabel}>{lang === 'ar' ? 'الشحن المقدر' : 'Estimated Shipping'}</span>
                            <span className={styles.summaryVal} style={{ color: "var(--success)", fontSize: "1.1rem" }}>{lang === 'ar' ? 'يحدد عند إتمام الطلب' : 'TBD at Checkout'}</span>
                        </div>

                        <div className={styles.summaryTotal} style={{ fontSize: "1.6rem", marginTop: "1rem" }}>
                            <span className={styles.totalLabel}>{t('cart.total')}</span>
                            <span className={styles.totalVal}>{formatPrice(subtotal, country)}</span>
                        </div>

                        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <Link href="/checkout" className="btn btnPrimary btnLg btnBlock" style={{ fontSize: "1.3rem", padding: "1.2rem" }}>
                                {lang === 'ar' ? 'متابعة الدفع ○' : 'Continue to Checkout ○'}
                            </Link>
                            <Link href="/" className={styles.removeBtn} style={{ justifyContent: "center", width: "100%", fontSize: "1.2rem" }}>
                                {lang === 'ar' ? 'مواصلة التسوق' : 'Continue Shopping'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
