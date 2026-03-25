"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

import styles from "../admin.module.css";

const omr = COUNTRIES[0];
const STATUSES = ["all", "paid", "processing", "shipped", "delivered", "refunded"];
const statusColor: Record<string, string> = { paid: "#3b82f6", processing: "#f59e0b", shipped: "#8fa6c4", delivered: "#22c55e" };

export default function AdminOrdersPage() {
    const { lang, t, isRTL } = useLanguage();
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
        if (res.ok) { toast.success(lang === 'ar' ? "تم تحديث الحالة" : "Status updated"); load(filter); }
        else toast.error(lang === 'ar' ? "فشل التحديث" : "Failed to update");
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
            toast.error(lang === 'ar' ? "فشل تحميل التفاصيل" : "Failed to load details");
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
                toast.success(lang === 'ar' ? "تم حفظ التغييرات ○" : "Changes saved ○");
                setEditingOrder(null);
                load(filter);
            } else {
                const data = await res.json();
                throw new Error(data.error || (lang === 'ar' ? "فشل الحفظ" : "Save failed"));
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdating(null);
        }
    };

    const handleQuickRefund = async () => {
        const amountStr = prompt(lang === 'ar' ? "أدخل مبلغ الاسترجاع (ر.ع):" : "Enter Refund Amount (OMR):", "0");
        if (amountStr === null) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 0) return toast.error(lang === 'ar' ? "مبلغ غير صحيح" : "Invalid amount");

        setUpdating(editingOrder.id);
        try {
            const res = await fetch(`/api/admin/orders/${editingOrder.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refunded_amount: amount }),
            });
            if (res.ok) {
                toast.success(lang === 'ar' ? "تمت عملية الاسترجاع وتعديل الحالة إلى مسترجع" : "Refund processed and status set to REFUNDED");
                setEditingOrder(null);
                load(filter);
            } else {
                const data = await res.json();
                throw new Error(data.error || (lang === 'ar' ? "فشل الاسترجاع" : "Refund failed"));
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div>
            <div className={styles.pageHeader} style={{ textAlign: isRTL ? 'right' : 'left', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div>
                    <h1 className={styles.pageTitle}>{lang === 'ar' ? "إدارة " : "Orders "} <span>{lang === 'ar' ? "الطلبات" : "Management"}</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem" }}>{orders.length} {lang === 'ar' ? "طلب تحت المتابعة" : "orders tracked total"}</p>
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => { setFilter(s); load(s); }}
                            style={{ padding: ".75rem 1.5rem", borderRadius: "9999px", border: `1px solid ${filter === s ? "var(--admin-primary)" : "var(--admin-border)"}`, background: filter === s ? "rgba(215, 79, 144, 0.1)" : "var(--admin-surface)", color: filter === s ? "var(--admin-primary)" : "var(--admin-text-muted)", fontSize: "1.25rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize", transition: "all 200ms ease" }}>
                            {lang === 'ar' ? (s === 'all' ? 'الكل' : s) : s}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            {[
                                lang === 'ar' ? "رقم الطلب #" : "Order #",
                                lang === 'ar' ? "العميل" : "Customer",
                                lang === 'ar' ? "الإجمالي" : "Total",
                                lang === 'ar' ? "المسترجع" : "Refunded",
                                lang === 'ar' ? "الحالة" : "Status",
                                lang === 'ar' ? "الإجراءات" : "Actions",
                                lang === 'ar' ? "التاريخ" : "Date"
                            ].map(h => (
                                <th key={h} style={{ whiteSpace: "nowrap", textAlign: isRTL ? 'right' : 'left' }}>{h}</th>
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
                                    <div style={{ color: "var(--admin-text-muted)", fontSize: "1.25rem" }}>{o.email}</div>
                                </td>
                                <td style={{ fontWeight: 700 }}>{formatPrice(o.total, omr)}</td>
                                <td style={{ color: Number(o.refunded_amount) > 0 ? "#ef4444" : "inherit", fontWeight: Number(o.refunded_amount) > 0 ? 700 : 400 }}>
                                    {o.refunded_amount > 0 ? `-${formatPrice(o.refunded_amount, omr)}` : "—"}
                                </td>
                                <td>
                                    <span style={{ background: `${statusColor[o.status]}22`, color: statusColor[o.status], padding: "6px 16px", borderRadius: "9999px", fontSize: "1.1rem", fontWeight: 700 }}>{o.status}</span>
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div style={{ display: "flex", gap: "1rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                        <button
                                            onClick={() => handleEditClick(o)}
                                            disabled={updating === o.id}
                                            className={styles.adminBtnSecondary}
                                            style={{ padding: ".75rem 1.25rem", fontSize: "1.2rem", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
                                        >
                                            {updating === o.id ? "..." : (lang === 'ar' ? "التفاصيل / الاسترجاع" : "Details/Refund")}
                                        </button>
                                        <select
                                            className={styles.adminInput}
                                            value={o.status}
                                            disabled={updating === o.id}
                                            onChange={e => updateStatus(o.id, e.target.value)}
                                            style={{ fontSize: "1.2rem", padding: ".7rem 1.25rem", width: "auto" }}>
                                            <option value="paid">paid</option>
                                            <option value="processing">processing</option>
                                            <option value="shipped">shipped</option>
                                            <option value="delivered">delivered</option>
                                            <option value="refunded">refunded</option>
                                        </select>
                                    </div>
                                </td>
                                <td style={{ color: "var(--admin-text-muted)", fontSize: "1.3rem", textAlign: isRTL ? 'right' : 'left' }}>{new Date(o.created_at).toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-GB")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Editor Modal */}
            {editingOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: "800px" }}>
                        <div className={styles.modalHeader} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <h2 style={{ fontSize: "2.25rem", fontWeight: 700 }}>{lang === 'ar' ? "الطلب" : "Order"} <span style={{ color: "var(--admin-primary)" }}>#{editingOrder.id}</span></h2>
                            <button onClick={() => setEditingOrder(null)} style={{ background: "none", border: "none", fontSize: "3rem", cursor: "pointer", color: "var(--admin-text-muted)" }}>×</button>
                        </div>
                        <div className={styles.modalBody} style={{ textAlign: isRTL ? 'right' : 'left' }}>

                            {/* Items Section */}
                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>{lang === 'ar' ? "منتجات الطلب" : "Order Items"} ({editingOrder.items?.length || 0})</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {editingOrder.items?.map((item: any, idx: number) => (
                                        <div key={idx} style={{ padding: "1.5rem", background: "rgba(255,255,255,0.5)", borderRadius: "12px", border: "1px solid var(--admin-border)", display: "flex", gap: "1.5rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                            <img src={item.image} style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }} alt="" />
                                            <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                                                <div style={{ fontWeight: 700, fontSize: "1.5rem" }}>{item.name}</div>
                                                <div style={{ fontSize: "1.3rem", color: "var(--admin-text-muted)", marginTop: ".5rem" }}>
                                                    {item.fabric_type} | {item.neckline} {item.stitch ? (lang === 'ar' ? "| خياطة بريميوم" : "| Premium Stitch") : ""}
                                                </div>
                                                {item.tailor_measurements && (
                                                    <div style={{ fontSize: "1.2rem", background: "#eee", padding: "8px", borderRadius: "8px", marginTop: "10px" }}>
                                                        <strong>{lang === 'ar' ? "المقاسات:" : "Measurements:"}</strong> {Object.entries(typeof item.tailor_measurements === 'string' ? JSON.parse(item.tailor_measurements) : item.tailor_measurements).map(([k, v]) => `${k}: ${v}`).join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ textAlign: isRTL ? 'left' : "right" }}>
                                                <div style={{ fontWeight: 700, fontSize: "1.5rem" }}>{formatPrice(item.price, omr)}</div>
                                                <div style={{ fontSize: "1.3rem" }}>{lang === 'ar' ? "الكمية:" : "Qty:"} {item.quantity}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <h3 className={styles.formSectionTitle}>{lang === 'ar' ? "التعديلات المالية" : "Financial Adjustments"}</h3>
                                    {!isSuper && <span style={{ fontSize: "1.1rem", color: "#666", background: "#eee", padding: "4px 10px", borderRadius: "6px" }}>{lang === 'ar' ? "المسؤولون مقيدون بالاسترجاع فقط" : "Admins restricted to Refunds"}</span>}
                                </div>
                                <div className={styles.formGrid}>

                                    <div className="formGroup">
                                        <label className="formLabel">Refunded Amount (OMR)</label>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <input
                                                type="number" step="0.001" className={styles.adminInput}
                                                value={editForm.refunded_amount}
                                                readOnly={false}
                                                onChange={e => setEditForm({ ...editForm, refunded_amount: parseFloat(e.target.value) })}
                                                style={{ borderColor: "#ef4444", fontSize: "1.5rem" }}
                                            />
                                            <button
                                                onClick={handleQuickRefund}
                                                className={styles.adminBtn}
                                                style={{ background: "#ef4444", fontSize: "1.2rem", padding: "0.5rem 1.5rem", whiteSpace: "nowrap" }}
                                            >
                                                Issue Refund
                                            </button>
                                        </div>
                                    </div>

                                    {editingOrder.voucher_code && (
                                        <div className="formGroup">
                                            <label className="formLabel">Applied Voucher</label>
                                            <div style={{ 
                                                padding: "1.5rem", 
                                                background: "rgba(215, 79, 144, 0.05)", 
                                                border: "2px dashed var(--admin-primary)", 
                                                borderRadius: "12px",
                                                color: "var(--admin-primary)",
                                                fontWeight: 800,
                                                fontSize: "1.5rem",
                                                letterSpacing: "2px",
                                                textAlign: "center"
                                            }}>
                                                {editingOrder.voucher_code}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>{lang === 'ar' ? "تفاصيل الوجهة" : "Destination Details"}</h3>
                                <div className={styles.formGrid}>
                                    <div className="formGroup">
                                        <label className="formLabel">{lang === 'ar' ? "اسم العميل" : "Customer Name"}</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                                        />
                                    </div>
                                    <div className="formGroup">
                                        <label className="formLabel">{lang === 'ar' ? "رقم الهاتف" : "Direct Phone"}</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.phone}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                                        />
                                    </div>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">{lang === 'ar' ? "بريد الشحن" : "Shipping Email"}</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                                        />
                                    </div>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">{lang === 'ar' ? "عنوان الوجهة الكامل" : "Full Destination Address"}</label>
                                        <textarea
                                            className={styles.adminInput}
                                            value={editForm.address}
                                            onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                            style={{ minHeight: "80px", textAlign: isRTL ? 'right' : 'left' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <button onClick={() => setEditingOrder(null)} className={styles.adminBtnSecondary} style={{ padding: "1.25rem 2.5rem", fontSize: "1.4rem", borderRadius: "12px", cursor: "pointer" }}>
                                {lang === 'ar' ? "إلغاء" : "Discard"}
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className={styles.adminBtn}
                                disabled={updating === editingOrder.id}
                                style={{ padding: "1.25rem 3rem" }}
                            >
                                {updating === editingOrder.id ? (lang === 'ar' ? "جاري الحفظ..." : "Preserving…") : (lang === 'ar' ? "حفظ التغييرات ○" : "Save Changes ○")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
