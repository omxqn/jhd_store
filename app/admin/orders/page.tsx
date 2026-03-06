"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import toast from "react-hot-toast";

import styles from "../admin.module.css";

const omr = COUNTRIES[0];
const STATUSES = ["all", "paid", "processing", "shipped", "delivered", "refunded"];
const statusColor: Record<string, string> = { paid: "#3b82f6", processing: "#f59e0b", shipped: "#8fa6c4", delivered: "#22c55e" };

export default function AdminOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

    // Modal State
    const [editingOrder, setEditingOrder] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const { authUser } = useStore();
    const isSuper = authUser?.role === "super_admin";

    const load = (f = "all") => {
        setLoading(true);
        fetch(`/api/admin/orders${f !== "all" ? `?status=${f}` : ""}`)
            .then(r => r.json())
            .then(d => setOrders(d.orders || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (id: number, status: string) => {
        setUpdating(id);
        const res = await fetch(`/api/admin/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        if (res.ok) { toast.success("Status updated"); load(filter); }
        else toast.error("Failed to update");
        setUpdating(null);
    };

    const handleEditClick = async (order: any) => {
        setUpdating(order.id);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`);
            const data = await res.json();
            if (data.order) {
                setEditingOrder(data.order);
                setEditForm({ ...data.order });
            }
        } catch (err) {
            toast.error("Failed to load details");
        } finally {
            setUpdating(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingOrder) return;
        setUpdating(editingOrder.id);
        try {
            const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                toast.success("Changes saved ○");
                setEditingOrder(null);
                load(filter);
            } else {
                const data = await res.json();
                throw new Error(data.error || "Save failed");
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdating(null);
        }
    };

    const handleQuickRefund = async () => {
        const amountStr = prompt("Enter Refund Amount (OMR):", "0");
        if (amountStr === null) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 0) return toast.error("Invalid amount");

        setUpdating(editingOrder.id);
        try {
            const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refunded_amount: amount }),
            });
            if (res.ok) {
                toast.success("Refund processed and status set to REFUNDED");
                setEditingOrder(null);
                load(filter);
            } else {
                const data = await res.json();
                throw new Error(data.error || "Refund failed");
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Orders <span>Management</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: ".875rem" }}>{orders.length} orders tracked</p>
                </div>
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => { setFilter(s); load(s); }}
                            style={{ padding: ".35rem .875rem", borderRadius: "9999px", border: `1px solid ${filter === s ? "var(--admin-primary)" : "var(--admin-border)"}`, background: filter === s ? "rgba(215, 79, 144, 0.1)" : "var(--admin-surface)", color: filter === s ? "var(--admin-primary)" : "var(--admin-text-muted)", fontSize: ".75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize", transition: "all 200ms ease" }}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {["Order #", "Customer", "Total", "Refunded", "Status", "Actions", "Date"].map(h => (
                                <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>Loading…</td></tr>
                        ) : orders.map(o => (
                            <tr
                                key={o.id}
                                className={styles.clickableRow}
                                onClick={() => router.push(`/myaccount/order-detail?id=${o.id}`)}
                            >
                                <td style={{ fontWeight: 700 }}>
                                    <Link
                                        href={`/myaccount/order-detail?id=${o.id}`}
                                        style={{ color: "var(--admin-primary)", textDecoration: "none" }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        #{o.id}
                                    </Link>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{o.name}</div>
                                    <div style={{ color: "var(--admin-text-muted)", fontSize: ".75rem" }}>{o.email}</div>
                                </td>
                                <td style={{ fontWeight: 700 }}>{formatPrice(o.total, omr)}</td>
                                <td style={{ color: Number(o.refunded_amount) > 0 ? "#ef4444" : "inherit", fontWeight: Number(o.refunded_amount) > 0 ? 700 : 400 }}>
                                    {o.refunded_amount > 0 ? `-${formatPrice(o.refunded_amount, omr)}` : "—"}
                                </td>
                                <td>
                                    <span style={{ background: `${statusColor[o.status]}22`, color: statusColor[o.status], padding: "3px 8px", borderRadius: "9999px", fontSize: ".7rem", fontWeight: 700 }}>{o.status}</span>
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: "flex", gap: ".5rem" }}>
                                        <button
                                            onClick={() => handleEditClick(o)}
                                            disabled={updating === o.id}
                                            className={styles.adminBtnSecondary}
                                            style={{ padding: "4px 8px", fontSize: "0.7rem", borderRadius: "6px" }}
                                        >
                                            {updating === o.id ? "..." : "Details/Refund"}
                                        </button>
                                        <select
                                            className={styles.adminInput}
                                            value={o.status}
                                            disabled={updating === o.id}
                                            onChange={e => updateStatus(o.id, e.target.value)}
                                            style={{ fontSize: ".75rem", padding: ".3rem .5rem", width: "auto" }}>
                                            <option value="paid">paid</option>
                                            <option value="processing">processing</option>
                                            <option value="shipped">shipped</option>
                                            <option value="delivered">delivered</option>
                                            <option value="refunded">refunded</option>
                                        </select>
                                    </div>
                                </td>
                                <td style={{ color: "var(--admin-text-muted)", fontSize: ".8rem" }}>{new Date(o.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Editor Modal */}
            {editingOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: "800px" }}>
                        <div className={styles.modalHeader}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Order <span style={{ color: "var(--admin-primary)" }}>#{editingOrder.id}</span></h2>
                            <button onClick={() => setEditingOrder(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
                        </div>
                        <div className={styles.modalBody}>

                            {/* Items Section */}
                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>Order Items ({editingOrder.items?.length || 0})</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {editingOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} style={{ padding: "1rem", background: "rgba(255,255,255,0.5)", borderRadius: "8px", border: "1px solid var(--admin-border)", display: "flex", gap: "1rem" }}>
                                            <img src={item.image} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} alt="" />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{item.name}</div>
                                                <div style={{ fontSize: ".75rem", color: "var(--admin-text-muted)", marginTop: ".25rem" }}>
                                                    {item.fabric_type} | {item.neckline} {item.stitch ? "| Premium Stitch" : ""}
                                                </div>
                                                {item.tailor_measurements && (
                                                    <div style={{ fontSize: ".7rem", background: "#eee", padding: "4px", borderRadius: "4px", marginTop: "4px" }}>
                                                        <strong>Measurements:</strong> {Object.entries(typeof item.tailor_measurements === 'string' ? JSON.parse(item.tailor_measurements) : item.tailor_measurements).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontWeight: 700 }}>{formatPrice(item.price, omr)}</div>
                                                <div style={{ fontSize: ".75rem" }}>Qty: {item.quantity}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <h3 className={styles.formSectionTitle}>Financial Adjustments</h3>
                                    {!isSuper && <span style={{ fontSize: ".7rem", color: "#666", background: "#eee", padding: "2px 6px", borderRadius: "4px" }}>Admins can only adjust Refunds</span>}
                                </div>
                                <div className={styles.formGrid}>

                                    <div className="formGroup">
                                        <label className="formLabel">Refunded Amount (OMR)</label>
                                        <div style={{ display: "flex", gap: ".5rem" }}>
                                            <input
                                                type="number" step="0.001" className={styles.adminInput}
                                                value={editForm.refunded_amount}
                                                readOnly={false}
                                                onChange={e => setEditForm({ ...editForm, refunded_amount: parseFloat(e.target.value) })}
                                                style={{ borderColor: "#ef4444" }}
                                            />
                                            <button
                                                onClick={handleQuickRefund}
                                                className={styles.adminBtn}
                                                style={{ background: "#ef4444", fontSize: ".7rem", padding: "5px 10px", whiteSpace: "nowrap" }}
                                            >
                                                Issue Refund
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>Destination Details</h3>
                                <div className={styles.formGrid}>
                                    <div className="formGroup">
                                        <label className="formLabel">Customer Name</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="formGroup">
                                        <label className="formLabel">Direct Phone</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.phone}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">Shipping Email</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">Full Destination Address</label>
                                        <textarea
                                            className={styles.adminInput}
                                            value={editForm.address}
                                            onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                            style={{ minHeight: "80px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setEditingOrder(null)} className={styles.adminBtnSecondary} style={{ padding: "0.75rem 1.5rem" }}>
                                Discard
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className={styles.adminBtn}
                                disabled={updating === editingOrder.id}
                                style={{ padding: "0.75rem 2rem" }}
                            >
                                {updating === editingOrder.id ? "Preserving…" : "Save Changes ○"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
