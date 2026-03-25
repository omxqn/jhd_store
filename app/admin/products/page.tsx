"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

import styles from "../admin.module.css";

const omr = COUNTRIES[0];

export default function AdminProductsPage() {
    const { lang, t, isRTL } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const load = (s = "") => {
        setLoading(true);
        fetch(`/api/admin/products${s ? `?search=${s}` : ""}`)
            .then(r => r.json())
            .then(d => setProducts(d.products || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm(lang === 'ar' ? "هل أنت متأكد من حذف هذا المنتج؟" : "Delete this product?")) return;
        setDeleting(id);
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success(lang === 'ar' ? "تم الحذف" : "Deleted"); load(search); }
        else toast.error(lang === 'ar' ? "فشل الحذف" : "Failed to delete");
        setDeleting(null);
    };

    const badgeStyle = (b: string) => {
        const map: Record<string, string> = { sale: "#ef4444", norefund: "#f59e0b", oos: "#64748b", new: "#22c55e" };
        const color = map[b] || "#8fa6c4";
        return { background: `${color}22`, color, padding: "6px 14px", borderRadius: "99px", fontSize: "1rem", fontWeight: 700, marginInlineEnd: 8 };
    };

    return (
        <div>
            <div className={styles.pageHeader} style={{ textAlign: isRTL ? 'right' : 'left', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div>
                    <h1 className={styles.pageTitle}>{lang === 'ar' ? "إدارة " : "Products "} <span>{lang === 'ar' ? "المنتجات" : "Management"}</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem" }}>{products.length} {lang === 'ar' ? "منتج إجمالي" : "products total"}</p>
                </div>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
                        <span style={{ position: "absolute", left: isRTL ? 'auto' : "16px", right: isRTL ? "16px" : 'auto', fontSize: "1.4rem", color: "var(--admin-text-muted)" }}>🔍</span>
                        <input className={styles.adminInput} style={{ paddingLeft: isRTL ? '16px' : "48px", paddingRight: isRTL ? '48px' : '16px', width: "400px", textAlign: isRTL ? 'right' : 'left' }}
                            placeholder={lang === 'ar' ? "ابحث عن منتج..." : "Search products…"} value={search}
                            onChange={e => { setSearch(e.target.value); load(e.target.value); }} />
                    </div>
                    <Link href="/admin/products/new" className={styles.adminBtn} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", fontSize: "1.5rem", padding: "1.255rem 2.5rem" }}>
                        ＋ {lang === 'ar' ? "إضافة منتج" : "Add Product"}
                    </Link>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            {[
                                lang === 'ar' ? "المعرف" : "ID",
                                lang === 'ar' ? "الاسم" : "Name",
                                lang === 'ar' ? "التصنيف" : "Category",
                                lang === 'ar' ? "السعر" : "Price",
                                lang === 'ar' ? "الأوسمة" : "Badges",
                                lang === 'ar' ? "الحالة" : "Status",
                                lang === 'ar' ? "المباع" : "Sold",
                                lang === 'ar' ? "الإجراءات" : "Actions"
                            ].map(h => (
                                <th key={h} style={{ whiteSpace: "nowrap", textAlign: isRTL ? 'right' : 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>{t('common.loading')}</td></tr>
                        ) : products.map(p => {
                            const badges = typeof p.badges === "string" ? JSON.parse(p.badges) : p.badges;
                            return (
                                <tr key={p.id}>
                                    <td style={{ color: "var(--admin-primary)", fontWeight: 700 }}>#{p.id}</td>
                                    <td style={{ fontWeight: 600, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                                    <td style={{ color: "var(--admin-text-muted)" }}>{p.category}</td>
                                    <td style={{ fontWeight: 700 }}>{formatPrice(p.price, omr)}</td>
                                    <td>{badges?.map((b: string) => <span key={b} style={badgeStyle(b)}>{b}</span>)}</td>
                                    <td>
                                        <span style={{ fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", color: p.availability === "available" ? "#22c55e" : "var(--admin-text-muted)" }}>
                                            {p.availability}
                                        </span>
                                    </td>
                                    <td style={{ color: "var(--admin-text-muted)" }}>{p.sold}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "1rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                            <Link href={`/admin/products/${p.id}/edit`}
                                                style={{ padding: ".75rem 1.25rem", borderRadius: ".75rem", background: "rgba(59,130,246,.1)", color: "#3b82f6", fontSize: "1.2rem", fontWeight: 700, textDecoration: "none" }}>{lang === 'ar' ? "✏️ تعديل" : "✏️ Edit"}</Link>
                                            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                                                style={{ padding: ".75rem 1.25rem", borderRadius: ".75rem", background: "rgba(239,68,68,.1)", color: "#ef4444", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit" }}>
                                                {deleting === p.id ? "…" : (lang === 'ar' ? "🗑️ حذف" : "🗑️ Del")}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
