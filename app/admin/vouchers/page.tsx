"use client";
import React, { useEffect, useState, Fragment } from "react";
import { formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import toast from "react-hot-toast";

import styles from "../admin.module.css";
import { useLanguage } from "@/context/LanguageContext";

const omr = COUNTRIES[0];

export default function AdminVouchersPage() {
    const { lang, t, isRTL } = useLanguage();
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

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
            toast.success(lang === 'ar' ? "تم إنشاء القسيمة بنجاح ○" : "Voucher created successfully ○");
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
        else toast.error(lang === 'ar' ? "فشل إنشاء القسيمة" : "Failed to create voucher");
    };

    const deactivate = async (code: string) => {
        await fetch("/api/admin/vouchers", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
        });
        toast.success(lang === 'ar' ? "تم إبطال القسيمة" : "Voucher deactivated");
        load();
    };

    return (
        <div>
            <div className={styles.pageHeader} style={{ textAlign: isRTL ? 'right' : 'left', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div>
                    <h1 className={styles.pageTitle}>{lang === 'ar' ? "نظام " : "Vouchers "} <span>{lang === 'ar' ? "القسائم" : "System"}</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem" }}>{vouchers.length} {lang === 'ar' ? "إجمالي الحملات النشطة المتتبعة" : "active campaigns tracked total"}</p>
                </div>
                <button onClick={() => { generateRandomCode(); setIsModalOpen(true); }} className={styles.adminBtn} style={{ fontSize: "1.5rem", padding: "1.255rem 2.5rem" }}>
                    ✨ {lang === 'ar' ? "إصدار قسيمة جديدة" : "Issue New Voucher"}
                </button>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            {[
                                lang === 'ar' ? "الكود" : "Code",
                                lang === 'ar' ? "القيمة" : "Value",
                                lang === 'ar' ? "النوع" : "Type",
                                lang === 'ar' ? "المستهدف" : "Target",
                                lang === 'ar' ? "الاستخدام" : "Usage",
                                lang === 'ar' ? "تنتهي" : "Expires",
                                lang === 'ar' ? "الإجراء" : "Action"
                            ].map(h => (
                                <th key={h} style={{ whiteSpace: "nowrap", textAlign: isRTL ? 'right' : 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>{t('common.loading')}</td></tr>
                        ) : vouchers.map(v => {
                            const isExpired = v.expires_at && new Date(v.expires_at) < new Date();
                            const isExhausted = !v.is_public && v.use_count >= 1;
                            const isExpanded = !!expandedRows[v.code];

                            return (
                                <Fragment key={v.code}>
                                    <tr>
                                        <td style={{ fontWeight: 800, letterSpacing: "2px", color: "var(--admin-primary)", fontFamily: "monospace", fontSize: "1.3rem" }}>{v.code}</td>
                                        <td style={{ fontWeight: 800, fontSize: "1.4rem" }}>{v.discount_type === 'percentage' ? `${v.discount_amount}%` : formatPrice(v.discount_amount, omr)}</td>
                                        <td style={{ textTransform: "capitalize", fontSize: "1.25rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>{v.discount_type === 'fixed' ? (lang === 'ar' ? "ثابت" : "Fixed") : (lang === 'ar' ? "نسبة" : "Percentage")}</td>
                                        <td>
                                            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: v.new_user_only ? "var(--admin-primary)" : "var(--admin-text-muted)" }}>
                                                {v.new_user_only ? (lang === 'ar' ? "👤 عملاء جدد" : "👤 New Users") : (lang === 'ar' ? "🛡️ الجميع" : "🛡️ Everyone")}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                                                {v.use_count} {lang === 'ar' ? "استخدامات" : "Uses"}
                                            </div>
                                            <div style={{ fontSize: "1rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>
                                                {v.is_public ? (lang === 'ar' ? `الحد: ${v.max_uses_per_user ?? 1}x/للمستخدم` : `Limit: ${v.max_uses_per_user ?? 1}x/User`) : (lang === 'ar' ? "استخدام واحد فقط" : "Single Use Total")}
                                            </div>
                                        </td>
                                        <td style={{ color: isExpired ? "#ef4444" : "var(--admin-text-muted)", fontSize: "1.25rem", fontWeight: 600 }}>
                                            {isExpired ? (lang === 'ar' ? "🔴 منتهي" : "🔴 Expired") : (isExhausted ? (lang === 'ar' ? "🔴 مستخدم" : "🔴 Used") : (v.expires_at ? new Date(v.expires_at).toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-GB") : (lang === 'ar' ? "بدون انتهاء" : "No Expiry")))}
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                                {v.active && !isExpired && !isExhausted ? (
                                                    <button onClick={() => deactivate(v.code)} style={{ padding: ".75rem 1.25rem", borderRadius: "10px", background: "rgba(239,68,68,.1)", color: "#ef4444", fontSize: "1.2rem", fontWeight: 700, cursor: "pointer", border: "none" }}>
                                                        {lang === 'ar' ? "إبطال" : "Deactivate"}
                                                    </button>
                                                ) : <span style={{ color: "var(--admin-text-muted)", fontSize: "1.2rem", fontWeight: 700 }}>{lang === 'ar' ? "غير نشط" : "Inactive"}</span>}

                                                {v.redemptions?.length > 0 && (
                                                    <button
                                                        onClick={() => setExpandedRows(prev => ({ ...prev, [v.code]: !prev[v.code] }))}
                                                        style={{ background: "none", border: "none", color: "var(--admin-primary)", cursor: "pointer", fontSize: "1.25rem", fontWeight: 700, whiteSpace: "nowrap" }}
                                                    >
                                                        {isExpanded ? (lang === 'ar' ? "إخفاء السجلات ↑" : "Hide Logs ↑") : (lang === 'ar' ? "عرض السجلات ↓" : "View Logs ↓")}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && v.redemptions && (
                                        <tr>
                                            <td colSpan={7} style={{ background: "rgba(0,0,0,0.02)", padding: "1.5rem", textAlign: isRTL ? 'right' : 'left' }}>
                                                <div style={{ fontSize: "1.25rem" }}>
                                                    <div style={{ fontWeight: 800, marginBottom: "1rem", color: "var(--admin-primary)", fontSize: "1.4rem" }}>{lang === 'ar' ? "سجل الاستخدام (آخر 50)" : "Redemption History (Last 50)"}</div>
                                                    <div style={{ display: "grid", gap: "1rem" }}>
                                                        {v.redemptions.map((r: any, idx: number) => (
                                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "1.25rem", background: "white", borderRadius: "12px", border: "1px solid var(--admin-border)", alignItems: "center", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                                    <strong style={{ fontSize: "1.4rem" }}>{lang === 'ar' ? "طلب #" : "Order #"} {r.order_id}</strong> — {r.customer_name} ({r.customer_email})
                                                                </div>
                                                                <div style={{ color: "var(--admin-text-muted)", fontWeight: 600 }}>
                                                                    {new Date(r.redeemed_at).toLocaleString(lang === 'ar' ? "ar-SA" : "en-GB")}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Voucher Creation Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                        <div className={styles.modalContent} style={{ maxWidth: "800px", textAlign: isRTL ? 'right' : 'left' }}>
                        <div className={styles.modalHeader} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <h2 style={{ fontSize: "2.25rem", fontWeight: 700 }}>{lang === 'ar' ? "إصدار " : "Issue "} <span style={{ color: "var(--admin-primary)" }}>{lang === 'ar' ? "قسيمة" : "Voucher"}</span></h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: "3rem", cursor: "pointer", color: "var(--admin-text-muted)" }}>×</button>
                        </div>
                        <form onSubmit={create}>
                            <div className={styles.modalBody}>
                                <div className={styles.formSection}>
                                    <div className={styles.formGrid}>
                                        <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.75rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                <label className="formLabel" style={{ margin: 0, fontSize: "1.4rem" }}>{lang === 'ar' ? "كود القسيمة" : "Voucher Code"}</label>
                                                <button type="button" onClick={generateRandomCode} style={{ color: "var(--admin-primary)", background: "none", border: "none", fontSize: "1.2rem", fontWeight: 800, cursor: "pointer" }}>
                                                    {lang === 'ar' ? "إعادة توليد ↻" : "RE-GENERATE ↻"}
                                                </button>
                                            </div>
                                            <input
                                                className={styles.adminInput}
                                                style={{ fontFamily: "monospace", letterSpacing: "4px", fontWeight: 800, fontSize: "2rem", textAlign: "center", padding: "1.25rem" }}
                                                value={newVoucher.code}
                                                onChange={e => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                                            />
                                        </div>

                                        <div className="formGroup">
                                            <label className="formLabel">{lang === 'ar' ? "نوع الخصم" : "Discount Type"}</label>
                                            <select className={styles.adminInput} value={newVoucher.discount_type} onChange={e => setNewVoucher({ ...newVoucher, discount_type: e.target.value })} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                <option value="fixed">{lang === 'ar' ? "ثابت (ر.ع)" : "Fixed (OMR)"}</option>
                                                <option value="percentage">{lang === 'ar' ? "نسبة (%)" : "Percentage (%)"}</option>
                                            </select>
                                        </div>
                                        <div className="formGroup">
                                            <label className="formLabel">{lang === 'ar' ? "المبلغ" : "Amount"}</label>
                                            <input className={styles.adminInput} type="number" step="0.001" value={newVoucher.discount_amount} onChange={e => setNewVoucher({ ...newVoucher, discount_amount: e.target.value })} style={{ textAlign: isRTL ? 'right' : 'left' }} />
                                        </div>

                                        <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                            <label className="formLabel">{lang === 'ar' ? "تاريخ الانتهاء (اختياري)" : "Expiration Date (Optional)"}</label>
                                            <input className={styles.adminInput} type="datetime-local" value={newVoucher.expires_at} onChange={e => setNewVoucher({ ...newVoucher, expires_at: e.target.value })} style={{ textAlign: isRTL ? 'right' : 'left' }} />
                                        </div>

                                        <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                            <label className="formLabel" style={{ fontSize: "1.4rem" }}>{lang === 'ar' ? "أقصى عدد مرات استخدام للمستخدم" : "Max Redemptions Per User"}</label>
                                            <input
                                                className={styles.adminInput}
                                                type="number"
                                                min="1"
                                                value={newVoucher.max_uses_per_user}
                                                onChange={e => setNewVoucher({ ...newVoucher, max_uses_per_user: e.target.value })}
                                                style={{ fontSize: "1.5rem", textAlign: isRTL ? 'right' : 'left' }}
                                            />
                                            <div style={{ fontSize: "1.1rem", color: "var(--admin-text-muted)", marginTop: "0.5rem", fontWeight: 600 }}>{lang === 'ar' ? "إجمالي عدد المرات التي يمكن لكل مستخدم استرداد هذه القسيمة فيها." : "Total times each user can redeem this voucher."}</div>
                                        </div>

                                        <div style={{ gridColumn: "span 2", padding: "1.5rem", background: "rgba(0,0,0,0.02)", borderRadius: "1rem", display: "grid", gap: "1.5rem", border: "1px solid var(--admin-border)" }}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", fontSize: "1.3rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={newVoucher.new_user_only}
                                                    onChange={e => setNewVoucher({ ...newVoucher, new_user_only: e.target.checked })}
                                                    style={{ width: "24px", height: "24px", accentColor: "var(--admin-primary)" }}
                                                />
                                                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                    <div style={{ fontWeight: 800 }}>{lang === 'ar' ? "للعملاء الجدد فقط" : "New Customers Only"}</div>
                                                    <div style={{ fontSize: "1.1rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>{lang === 'ar' ? "قصر الاسترداد على المستخدمين الذين ليس لديهم طلبات سابقة." : "Restrict redemption to users with zero previous orders."}</div>
                                                </div>
                                            </label>

                                            <label style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer", fontSize: "1.3rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={newVoucher.is_public}
                                                    onChange={e => setNewVoucher({ ...newVoucher, is_public: e.target.checked })}
                                                    style={{ width: "24px", height: "24px", accentColor: "var(--admin-primary)" }}
                                                />
                                                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                                                    <div style={{ fontWeight: 800 }}>{lang === 'ar' ? "عام / متعدد المستخدمين" : "Public / Multi-user"}</div>
                                                    <div style={{ fontSize: "1.1rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>{lang === 'ar' ? "مفعل: استخدام واحد لكل مستخدم. غير مفعل: استخدام واحد إجمالي لجميع المتجر." : "Checked: 1 usage per user. Unchecked: Single-use total across store."}</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalFooter} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.adminBtnSecondary} style={{ padding: "1.25rem 2.5rem", fontSize: "1.4rem", borderRadius: "12px" }}>
                                    {lang === 'ar' ? "إلغاء وتجاهل" : "Discard"}
                                </button>
                                <button
                                    type="submit"
                                    className={styles.adminBtn}
                                    style={{ padding: "1.25rem 3rem", fontSize: "1.4rem" }}
                                >
                                    {lang === 'ar' ? "إصدار قسيمة ○" : "Issue Voucher ○"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
