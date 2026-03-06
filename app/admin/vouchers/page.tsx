"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import toast from "react-hot-toast";

import styles from "../admin.module.css";

const omr = COUNTRIES[0];

export default function AdminVouchersPage() {
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Voucher State
    const [newVoucher, setNewVoucher] = useState({
        code: "",
        discount_amount: "",
        discount_type: "fixed",
        expires_at: "",
        new_user_only: false,
        is_public: true,
        max_uses_per_user: "1",
    });

    const generateRandomCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 12; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewVoucher(prev => ({ ...prev, code: result }));
    };

    const load = () => {
        setLoading(true);
        fetch("/api/admin/vouchers").then(r => r.json()).then(d => setVouchers(d.vouchers || [])).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVoucher.code || !newVoucher.discount_amount) return;
        const res = await fetch("/api/admin/vouchers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...newVoucher,
                discount_amount: parseFloat(newVoucher.discount_amount),
                expires_at: newVoucher.expires_at || null
            }),
        });
        if (res.ok) {
            toast.success("Voucher created successfully ○");
            setNewVoucher({
                code: "",
                discount_amount: "",
                discount_type: "fixed",
                expires_at: "",
                new_user_only: false,
                is_public: true,
                max_uses_per_user: "1",
            });
            setIsModalOpen(false);
            load();
        }
        else toast.error("Failed to create voucher");
    };

    const deactivate = async (code: string) => {
        await fetch("/api/admin/vouchers", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
        toast.success("Voucher deactivated");
        load();
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Vouchers <span>System</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: ".875rem" }}>{vouchers.length} total active campaigns</p>
                </div>
                <button onClick={() => { generateRandomCode(); setIsModalOpen(true); }} className={styles.adminBtn}>
                    ✨ Issue New Voucher
                </button>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {["Code", "Value", "Type", "Target", "Usage", "Expires", "Action"].map(h => (
                                <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>Loading directory…</td></tr>
                        ) : vouchers.map(v => {
                            const isExpired = v.expires_at && new Date(v.expires_at) < new Date();
                            return (
                                <tr key={v.code}>
                                    <td style={{ fontWeight: 800, letterSpacing: ".05em", color: "var(--admin-primary)", fontFamily: "monospace" }}>{v.code}</td>
                                    <td style={{ fontWeight: 700 }}>{v.discount_type === 'percentage' ? `${v.discount_amount}%` : formatPrice(v.discount_amount, omr)}</td>
                                    <td style={{ textTransform: "capitalize", fontSize: "0.8rem", color: "var(--admin-text-muted)" }}>{v.discount_type}</td>
                                    <td>
                                        <span style={{ fontSize: ".75rem", color: v.new_user_only ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                                            {v.new_user_only ? "👤 New Users" : "🛡️ Everyone"}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: ".75rem" }}>
                                            {v.is_public ? `🌍 Public (${v.max_uses_per_user ?? 1}x/User)` : "🔒 Private (Single Use)"}
                                        </span>
                                    </td>
                                    <td style={{ color: isExpired ? "#ef4444" : "var(--admin-text-muted)", fontSize: ".8rem" }}>
                                        {v.expires_at ? new Date(v.expires_at).toLocaleDateString() : "No Expiry"}
                                    </td>
                                    <td>
                                        {v.active ? (
                                            <button onClick={() => deactivate(v.code)} style={{ padding: ".35rem .75rem", borderRadius: ".5rem", background: "rgba(239,68,68,.1)", color: "#ef4444", fontSize: ".75rem", fontWeight: 600, cursor: "pointer", border: "none" }}>
                                                Deactivate
                                            </button>
                                        ) : <span style={{ color: "var(--admin-text-muted)", fontSize: ".75rem" }}>Closed</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Voucher Creation Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: "600px" }}>
                        <div className={styles.modalHeader}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Configure Boutique Voucher</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
                        </div>
                        <form onSubmit={create}>
                            <div className={styles.modalBody}>
                                <div className={styles.formSection}>
                                    <div className={styles.formGrid}>
                                        <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: ".5rem" }}>
                                                <label className="formLabel" style={{ margin: 0 }}>Voucher Code</label>
                                                <button type="button" onClick={generateRandomCode} style={{ color: "var(--admin-primary)", background: "none", border: "none", fontSize: ".7rem", fontWeight: 700, cursor: "pointer" }}>
                                                    RE-GENERATE ↻
                                                </button>
                                            </div>
                                            <input
                                                className={styles.adminInput}
                                                style={{ fontFamily: "monospace", letterSpacing: "2px", fontWeight: 700 }}
                                                value={newVoucher.code}
                                                onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label className="formLabel">Discount Type</label>
                                            <select className={styles.adminInput} value={newVoucher.discount_type} onChange={e => setNewVoucher({ ...newVoucher, discount_type: e.target.value })}>
                                                <option value="fixed">Fixed (OMR)</option>
                                                <option value="percentage">Percentage (%)</option>
                                            </select>
                                        </div>
                                        <div className="formGroup">
                                            <label className="formLabel">Amount</label>
                                            <input className={styles.adminInput} type="number" step="0.001" value={newVoucher.discount_amount} onChange={e => setNewVoucher({ ...newVoucher, discount_amount: e.target.value })} />
                                        </div>

                                        <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                            <label className="formLabel">Expiration Date (Optional)</label>
                                            <input className={styles.adminInput} type="datetime-local" value={newVoucher.expires_at} onChange={e => setNewVoucher({ ...newVoucher, expires_at: e.target.value })} />
                                        </div>

                                        <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                            <label className="formLabel">Max Uses Per User</label>
                                            <input
                                                className={styles.adminInput}
                                                type="number"
                                                min="1"
                                                value={newVoucher.max_uses_per_user}
                                                onChange={e => setNewVoucher({ ...newVoucher, max_uses_per_user: e.target.value })}
                                            />
                                            <div style={{ fontSize: ".7rem", color: "var(--admin-text-muted)", marginTop: "0.3rem" }}>Times each user can redeem this voucher (public vouchers only)</div>
                                        </div>

                                        <div style={{ gridColumn: "span 2", padding: "1rem", background: "rgba(0,0,0,0.02)", borderRadius: ".75rem", display: "grid", gap: "1rem" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: ".9rem" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={newVoucher.new_user_only}
                                                    onChange={e => setNewVoucher({ ...newVoucher, new_user_only: e.target.checked })}
                                                    style={{ width: "18px", height: "18px", accentColor: "var(--admin-primary)" }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>New Customers Only</div>
                                                    <div style={{ fontSize: ".75rem", color: "var(--admin-text-muted)" }}>Restrict to users with zero previous orders.</div>
                                                </div>
                                            </label>

                                            <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: ".9rem" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={newVoucher.is_public}
                                                    onChange={e => setNewVoucher({ ...newVoucher, is_public: e.target.checked })}
                                                    style={{ width: "18px", height: "18px", accentColor: "var(--admin-primary)" }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>Public / Multi-user</div>
                                                    <div style={{ fontSize: ".75rem", color: "var(--admin-text-muted)" }}>Checked: 1 usage per user. Unchecked: 1 usage total across store.</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.adminBtnSecondary} style={{ padding: "0.75rem 1.5rem" }}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.adminBtn}
                                    style={{ padding: "0.75rem 2rem" }}
                                >
                                    Issue Voucher ○
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
