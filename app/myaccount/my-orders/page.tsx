"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore, formatPrice } from "@/lib/store";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function MyOrdersPage() {
    const { country, authUser } = useStore();
    const { lang, t, isRTL } = useLanguage();

    const STATUS_ORDER = ["paid", "processing", "shipped", "delivered"];
    const STEPS = [
        { key: "paid", label: lang === 'ar' ? "تم الدفع" : "Paid", icon: "💳" },
        { key: "processing", label: lang === 'ar' ? "قيد التنفيذ" : "Processing", icon: "🧵" },
        { key: "shipped", label: lang === 'ar' ? "تم الشحن" : "Shipped", icon: "🚚" },
        { key: "delivered", label: lang === 'ar' ? "تم التوصيل" : "Delivered", icon: "🏠" },
    ];
    
    const statusMap: Record<string, { color: string; label: string; bg: string }> = {
        paid: { color: "#3B82F6", label: lang === 'ar' ? "تم الدفع" : "Paid", bg: "rgba(59, 130, 246, 0.1)" },
        processing: { color: "#D97706", label: lang === 'ar' ? "قيد التنفيذ" : "Processing", bg: "rgba(217, 119, 6, 0.1)" },
        shipped: { color: "#7C3AED", label: lang === 'ar' ? "تم الشحن" : "Shipped", bg: "rgba(124, 58, 237, 0.1)" },
        delivered: { color: "#059669", label: lang === 'ar' ? "تم التوصيل" : "Delivered", bg: "rgba(5, 150, 105, 0.1)" },
        refunded: { color: "#EF4444", label: lang === 'ar' ? "تم الاسترداد" : "Refunded", bg: "rgba(239, 68, 68, 0.1)" },
    };
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            if (!authUser) {
                setError(lang === 'ar' ? "يرجى تسجيل الدخول لعرض طلباتك." : "Please sign in to view your orders.");
                setLoading(false);
                return;
            }

            const token = useStore.getState().token;
            try {
                const res = await fetch("/api/orders", {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (!res.ok) {
                    if (res.status === 401) { setError(lang === 'ar' ? "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى." : "Session expired, please login again."); return; }
                    throw new Error("Failed to fetch");
                }
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (e) {
                setError(lang === 'ar' ? "عذراً، لم نتمكن من تحميل الطلبات." : "Sorry, we couldn't load your orders.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [authUser]);

    if (loading) return (
        <div className={styles.loadingContainer}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className={styles.loader}
            />
            <p>جاري استرجاع تفاصيل طلباتك...</p>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.header}
                >
                    <div className={styles.badge}>{lang === 'ar' ? "تتبع المشتريات" : "Follow Purchases"}</div>
                    <h1 className={styles.title}>{t('account.my_orders')} <span>{lang === 'ar' ? "الخاصة" : "History"}</span></h1>
                    <p className={styles.subtitle}>{lang === 'ar' ? `لديك ${orders.length} طلبات مسجلة في حسابك` : `You have ${orders.length} orders registered in your account`}</p>
                </motion.div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.emptyState}
                    >
                        <div className={styles.emptyIcon}>📦</div>
                        <h2>{lang === 'ar' ? "لا توجد طلبات بعد" : "No orders yet"}</h2>
                        <p>{lang === 'ar' ? "ابدأ رحلة التسوق الآن واصنع ذكرياتك الخاصة مع تصاميمنا" : "Start your shopping journey now and create your own memories with our designs"}</p>
                        <Link href="/" className="btn btnPrimary">{t('home.shop_now')} ○</Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className={styles.ordersList}
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                    >
                        {orders.map(order => {
                            const s = statusMap[order.status] ?? { color: "#1A1A1A", label: order.status, bg: "rgba(0,0,0,0.05)" };
                            return (
                                <motion.div
                                    key={order.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 }
                                    }}
                                >
                                    <Link href={`/myaccount/order-detail?id=${order.id}`} className={styles.orderCard}>
                                        <div className={styles.orderHeader}>
                                            <div className={styles.idGroup}>
                                                <span className={styles.orderId}>{lang === 'ar' ? "طلب رقم" : "Order #"}#{order.id}</span>
                                                <span className={styles.orderDate}>
                                                    {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
                                                </span>
                                            </div>
                                            <div className={styles.statusGroup}>
                                                <span className={styles.statusBadge} style={{ color: s.color, background: s.bg }}>
                                                    {s.label}
                                                </span>
                                                <div className={styles.orderTotal}>{formatPrice(order.total, country)}</div>
                                            </div>
                                        </div>

                                        <div className={styles.itemsPreview}>
                                            {order.items?.map((item: any, i: number) => (
                                                <div key={i} className={styles.previewItem}>
                                                    {item.name} <span className={styles.qty}>×{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {order.status !== "refunded" && (
                                            <div className={styles.miniTracker}>
                                                {STEPS.map((step, i) => {
                                                    const stepIdx = STATUS_ORDER.indexOf(step.key);
                                                    const currentIdx = STATUS_ORDER.indexOf(order.status);
                                                    const isDone = stepIdx <= currentIdx;
                                                    const isActive = stepIdx === currentIdx;
                                                    return (
                                                        <div key={step.key} className={`${styles.miniStep} ${isDone ? styles.stepDone : ""}`}>
                                                            <div className={styles.stepIcon}>{step.icon}</div>
                                                            <div className={styles.miniBar} />
                                                            {isActive && <div className={styles.activePulse} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {order.status === "refunded" && (
                                            <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "8px", fontSize: "0.8rem", color: "#EF4444", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                                <span>↩️</span> {lang === 'ar' ? "تم استرداد مبالغ هذا الطلب. لمزيد من التفاصيل يرجى الاطلاع على صفحة الطلب." : "This order has been refunded. For more details, please see the order page."}
                                            </div>
                                        )}

                                        <div className={styles.cardFooter}>
                                            <span className={styles.detailsLink}>{lang === 'ar' ? "عرض التفاصيل وتتبع الشحنة ←" : "View Details & Track Shipment →"}</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
