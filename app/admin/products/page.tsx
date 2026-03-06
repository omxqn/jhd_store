"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import toast from "react-hot-toast";

import styles from "../admin.module.css";

const omr = COUNTRIES[0];

export default function AdminProductsPage() {
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
        if (!confirm("Delete this product?")) return;
        setDeleting(id);
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Deleted"); load(search); }
        else toast.error("Failed to delete");
        setDeleting(null);
    };

    const badgeStyle = (b: string) => {
        const map: Record<string, string> = { sale: "#ef4444", norefund: "#f59e0b", oos: "#64748b", new: "#22c55e" };
        const color = map[b] || "#8fa6c4";
        return { background: `${color}22`, color, padding: "3px 8px", borderRadius: "9999px", fontSize: ".65rem", fontWeight: 700, marginRight: 4 };
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Products <span>Management</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: ".875rem" }}>{products.length} products</p>
                </div>
                <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", position: "relative" }}>
                        <span style={{ position: "absolute", left: "12px", color: "var(--admin-text-muted)" }}>🔍</span>
                        <input className={styles.adminInput} style={{ paddingLeft: "36px", width: "220px" }}
                            placeholder="Search products…" value={search}
                            onChange={e => { setSearch(e.target.value); load(e.target.value); }} />
                    </div>
                    <Link href="/admin/products/new" className={styles.adminBtn} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        ＋ Add Product
                    </Link>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {["ID", "Name", "Category", "Price", "Badges", "Status", "Sold", "Actions"].map(h => (
                                <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>Loading…</td></tr>
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
                                        <span style={{ fontSize: ".75rem", fontWeight: 600, color: p.availability === "available" ? "#22c55e" : "var(--admin-text-muted)" }}>
                                            {p.availability}
                                        </span>
                                    </td>
                                    <td style={{ color: "var(--admin-text-muted)" }}>{p.sold}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: ".5rem" }}>
                                            <Link href={`/admin/products/${p.id}/edit`}
                                                style={{ padding: ".35rem .75rem", borderRadius: ".5rem", background: "rgba(59,130,246,.1)", color: "#3b82f6", fontSize: ".75rem", fontWeight: 600, textDecoration: "none" }}>✏️ Edit</Link>
                                            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                                                style={{ padding: ".35rem .75rem", borderRadius: ".5rem", background: "rgba(239,68,68,.1)", color: "#ef4444", fontSize: ".75rem", fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "inherit" }}>
                                                {deleting === p.id ? "…" : "🗑️ Del"}
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
