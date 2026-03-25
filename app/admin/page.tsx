"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore, formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

import styles from "./admin.module.css";

type Stats = {
    revenue: number; orders: number; users: number; products: number;
    recentOrders: any[]; topProducts: any[];
};

type AdvancedStats = {
    dailyRevenue: any[];
    categoryStats: any[];
    statusStats: any[];
};

const omr = COUNTRIES[0];

export default function AdminDashboard() {
    const { lang, t, isRTL } = useLanguage();
    const [stats, setStats] = useState<Stats | null>(null);
    const [advStats, setAdvStats] = useState<AdvancedStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = useStore.getState().token;
        const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {};
        
        Promise.all([
            fetch("/api/admin/stats", { headers }).then(r => r.json()),
            fetch("/api/admin/stats/advanced", { headers }).then(r => r.json())
        ]).then(([s, a]) => {
            setStats(s);
            setAdvStats(a);
        }).catch(err => console.error("Stats fetch error:", err))
          .finally(() => setLoading(false));
    }, []);

    const cards = [
        { icon: "💰", label: lang === 'ar' ? "إجمالي الإيرادات" : "Total Revenue", value: stats ? formatPrice(stats.revenue, omr) : "—", color: "var(--admin-primary)" },
        { icon: "📦", label: lang === 'ar' ? "إجمالي الطلبات" : "Total Orders", value: stats?.orders ?? "—", color: "#22c55e" },
        { icon: "👥", label: lang === 'ar' ? "العملاء" : "Customers", value: stats?.users ?? "—", color: "#3b82f6" },
        { icon: "🛍️", label: lang === 'ar' ? "المنتجات" : "Products", value: stats?.products ?? "—", color: "#a855f7" },
    ];

    const statusColor: Record<string, string> = {
        paid: "#3b82f6", processing: "#f59e0b", shipped: "#8fa6c4", delivered: "#22c55e", refunded: "#ef4444"
    };

    // Calculate max revenue for chart scaling
    const maxRev = advStats?.dailyRevenue?.reduce((max, curr) => Math.max(max, curr.revenue), 0) || 1;
    const maxCatRev = advStats?.categoryStats?.reduce((max, curr) => Math.max(max, curr.revenue), 0) || 1;

    return (
        <div>
            <div className={styles.pageHeader} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                <div>
                    <h1 className={styles.pageTitle}>
                        {lang === 'ar' ? "نظرة عامة على " : "Dashboard "} <span>{lang === 'ar' ? "لوحة المعلومات" : "Overview"}</span>
                    </h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem" }}>
                        {new Date().toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
                {cards.map(c => (
                    <div key={c.label} className={styles.card} style={{ padding: "2.5rem", textAlign: isRTL ? 'right' : 'left' }}>
                        <div style={{ fontSize: "3.125rem", marginBottom: "1rem" }}>{c.icon}</div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: c.color, marginBottom: ".5rem" }}>{loading ? "…" : c.value}</div>
                        <div style={{ fontSize: "1.375rem", color: "var(--admin-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Advanced Analytics Grid */}
            <div className={styles.statsGrid}>
                {/* Revenue Trend */}
                <div className={styles.card} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h2 className={styles.cardTitle}>{lang === 'ar' ? "اتجاه الإيرادات (30 يوم)" : "30-Day Revenue Trend"}</h2>
                    <div className={styles.chartContainer}>
                        {advStats?.dailyRevenue?.map((d, i) => (
                            <div
                                key={i}
                                className={styles.chartBar}
                                style={{ height: `${(d.revenue / maxRev) * 100}%` }}
                                title={`${d.date}: ${formatPrice(d.revenue, omr)}`}
                            />
                        ))}
                        {(!advStats?.dailyRevenue?.length) && <p style={{ width: '100%', textAlign: 'center', color: 'var(--admin-text-muted)' }}>{lang === 'ar' ? "لا توجد بيانات متاحة للمخططات" : "No data available for charts"}</p>}
                    </div>
                </div>

                {/* Category Performance */}
                <div className={styles.card} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h2 className={styles.cardTitle}>{lang === 'ar' ? "المبيعات حسب التصنيف" : "Sales by Category"}</h2>
                    <div style={{ marginTop: '1rem' }}>
                        {advStats?.categoryStats?.map((c, i) => (
                            <div key={i} className={styles.categoryItem}>
                                <div className={styles.categoryHeader} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <span>{c.category}</span>
                                    <span>{formatPrice(c.revenue, omr)}</span>
                                </div>
                                <div className={styles.progressWrapper}>
                                    <div
                                        className={styles.progressBar}
                                        style={{ width: `${(c.revenue / maxCatRev) * 100}%`, left: isRTL ? 'auto' : 0, right: isRTL ? 0 : 'auto' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className={styles.card} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h2 className={styles.cardTitle}>{lang === 'ar' ? "حالة الطلبات" : "Order Status"}</h2>
                    <div className={styles.statusDistribution} style={{ marginTop: '1rem' }}>
                        {advStats?.statusStats?.map((s, i) => (
                            <div key={i} className={styles.statusRow} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <div className={styles.statusColorBox} style={{ background: statusColor[s.status] || '#ccc' }} />
                                <div className={styles.statusLabel} style={{ marginLeft: isRTL ? 0 : '1rem', marginRight: isRTL ? '1rem' : 0 }}>{s.status}</div>
                                <div className={styles.statusValue}>{s.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.statsGrid} style={{ alignItems: "start" }}>
                {/* Recent Orders */}
                <div className={styles.tableWrapper}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2.5rem 2.5rem 0", marginBottom: "2rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>{lang === 'ar' ? "أحدث الطلبات" : "Recent Orders"}</h2>
                        <Link href="/admin/orders" style={{ fontSize: "1.4rem", color: "var(--admin-primary)", fontWeight: 800 }}>{lang === 'ar' ? "عرض الكل ←" : "View all →"}</Link>
                    </div>
                    {loading ? <p style={{ color: "var(--admin-text-muted)", padding: "1.25rem", textAlign: "center" }}>{t('common.loading')}</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                    {[
                                        lang === 'ar' ? "الطلب" : "Order",
                                        lang === 'ar' ? "العميل" : "Customer",
                                        lang === 'ar' ? "الإجمالي" : "Total",
                                        lang === 'ar' ? "الحالة" : "Status",
                                        lang === 'ar' ? "التاريخ" : "Date"
                                    ].map(h => (
                                        <th key={h} style={{ textAlign: isRTL ? 'right' : 'left' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentOrders?.map((o: any) => (
                                    <tr key={o.id}>
                                        <td style={{ color: "var(--admin-primary)", fontWeight: 600 }}>
                                            <Link href={`/admin/orders?id=${o.id}`} style={{ color: "inherit", textDecoration: "none" }}>#{o.id}</Link>
                                        </td>
                                        <td>{o.name}</td>
                                        <td style={{ fontWeight: 600 }}>{formatPrice(o.total, omr)}</td>
                                        <td>
                                            <span style={{ background: `${statusColor[o.status] || '#ccc'}22`, color: statusColor[o.status] || '#666', padding: "6px 16px", borderRadius: "9999px", fontSize: "1.1rem", fontWeight: 700 }}>{o.status}</span>
                                        </td>
                                        <td style={{ color: "var(--admin-text-muted)", textAlign: isRTL ? 'right' : 'left' }}>{new Date(o.created_at).toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-GB")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Top Products */}
                <div className={styles.card} style={{ padding: "2.5rem", textAlign: isRTL ? 'right' : 'left' }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>{lang === 'ar' ? "المنتجات الأكثر مبيعاً" : "Top Products"}</h2>
                        <Link href="/admin/products" style={{ fontSize: "1.4rem", color: "var(--admin-primary)", fontWeight: 800 }}>{lang === 'ar' ? "الكل ←" : "All →"}</Link>
                    </div>
                    {loading ? <p style={{ color: "var(--admin-text-muted)", textAlign: "center" }}>{t('common.loading')}</p> : stats?.topProducts?.map((p: any, i) => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.5rem 0", borderBottom: i < (stats.topProducts.length - 1) ? "1px solid var(--admin-border)" : "none", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <div style={{ width: 48, height: 48, background: "rgba(215, 79, 144, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 800, color: "var(--admin-primary)", flexShrink: 0 }}>
                                {i + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0, textAlign: isRTL ? 'right' : 'left' }}>
                                <div style={{ fontSize: "1.5rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--admin-text)" }}>{p.name}</div>
                                <div style={{ fontSize: "1.3rem", color: "var(--admin-text-muted)" }}>{p.sold} {lang === 'ar' ? "تم بيعها" : "sold"} · {formatPrice(p.price, omr)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
