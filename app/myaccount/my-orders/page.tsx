"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore, formatPrice } from "@/lib/store";
import styles from "./page.module.css";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_ORDER = ["paid", "processing", "shipped", "delivered"];
const STEPS = [
    { key: "paid", label: "تم الدفع", icon: "💳" },
    { key: "processing", label: "قيد التنفيذ", icon: "🧵" },
    { key: "shipped", label: "تم الشحن", icon: "🚚" },
    { key: "delivered", label: "تم التوصيل", icon: "🏠" },
];

const statusMap: Record<string, { color: string; label: string; bg: string }> = {
    paid: { color: "#3B82F6", label: "تم الدفع", bg: "rgba(59, 130, 246, 0.1)" },
    processing: { color: "#D97706", label: "قيد التنفيذ", bg: "rgba(217, 119, 6, 0.1)" },
    shipped: { color: "#7C3AED", label: "تم الشحن", bg: "rgba(124, 58, 237, 0.1)" },
    delivered: { color: "#059669", label: "تم التوصيل", bg: "rgba(5, 150, 105, 0.1)" },
    refunded: { color: "#EF4444", label: "تم الاسترداد", bg: "rgba(239, 68, 68, 0.1)" },
};

export default function MyOrdersPage() {
    const { country, authUser } = useStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const url = authUser
                    ? "/api/orders"
                    : `/api/orders?email=${encodeURIComponent(localStorage.getItem("guestEmail") || "")}`;

                const res = await fetch(url);
                if (!res.ok) {
                    if (res.status === 401) { setError("يرجى تسجيل الدخول لعرض طلباتك."); return; }
                    throw new Error("Failed to fetch");
                }
                const data = await res.json();
                setOrders(data.orders || []);
            } catch (e) {
                setError("عذراً، لم نتمكن من تحميل الطلبات.");
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
                    <div className={styles.badge}>تتبع المشتريات</div>
                    <h1 className={styles.title}>طلباتي <span>الخاصة</span></h1>
                    <p className={styles.subtitle}>لديك {orders.length} طلبات مسجلة في حسابك</p>
                </motion.div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.emptyState}
                    >
                        <div className={styles.emptyIcon}>📦</div>
                        <h2>لا توجد طلبات بعد</h2>
                        <p>ابدأ رحلة التسوق الآن واصنع ذكرياتك الخاصة مع تصاميمنا</p>
                        <Link href="/" className="btn btnPrimary">ابدأ التسوق ○</Link>
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
                                                <span className={styles.orderId}>طلب رقم #{order.id}</span>
                                                <span className={styles.orderDate}>
                                                    {new Date(order.created_at).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
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
                                                <span>↩️</span> تم استرداد مبالغ هذا الطلب. لمزيد من التفاصيل يرجى الاطلاع على صفحة الطلب.
                                            </div>
                                        )}

                                        <div className={styles.cardFooter}>
                                            <span className={styles.detailsLink}>عرض التفاصيل وتتبع الشحنة ←</span>
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
