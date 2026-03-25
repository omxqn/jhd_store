"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "../admin.module.css";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/context/LanguageContext";

export default function SuperAdminUsersPage() {
    const { lang, t, isRTL } = useLanguage();
    const { authUser } = useStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<number | null>(null);

    // Modal State
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const loadUsers = () => {
        setLoading(true);
        fetch("/api/admin/users")
            .then(r => r.json())
            .then(d => setUsers(d.users || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (authUser?.role === "super_admin") {
            loadUsers();
        }
    }, [authUser]);

    if (authUser?.role !== "super_admin") {
        return <div style={{ padding: "2rem", textAlign: "center" }}>{lang === 'ar' ? "وصول مرفوض: للمسؤولين فقط" : "Access Denied: Super Admin Only"}</div>;
    }

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setEditForm({ ...user });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setUpdating(editingUser.id);
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                toast.success(lang === 'ar' ? "تم تحديث المستخدم بنجاح" : "User updated successfully");
                setEditingUser(null);
                loadUsers();
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

    return (
        <div>
            <div className={styles.pageHeader} style={{ textAlign: isRTL ? 'right' : 'left', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div>
                    <h1 className={styles.pageTitle}>{lang === 'ar' ? "إدارة " : "User "} <span>{lang === 'ar' ? "المستخدمين" : "Concierge"}</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem" }}>{users.length} {lang === 'ar' ? "إجمالي المستخدمين المسجلين في المتجر" : "total users registered in boutique"}</p>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            {[
                                lang === 'ar' ? "المعرف" : "ID",
                                lang === 'ar' ? "الاسم" : "Name",
                                lang === 'ar' ? "الإيميل" : "Email",
                                lang === 'ar' ? "الهاتف" : "Phone",
                                lang === 'ar' ? "الدور" : "Role",
                                lang === 'ar' ? "انضم" : "Joined",
                                lang === 'ar' ? "الإجراءات" : "Actions"
                            ].map(h => (
                                <th key={h} style={{ textAlign: isRTL ? 'right' : 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>{lang === 'ar' ? "جاري تحميل دليل المستخدمين..." : "Loading User Directory…"}</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td style={{ color: "var(--admin-text-muted)", fontSize: "1.1rem", fontWeight: 600 }}>#{u.id}</td>
                                <td style={{ fontWeight: 800, fontSize: "1.4rem" }}>{u.name}</td>
                                <td style={{ fontSize: "1.25rem", fontWeight: 600 }}>{u.email}</td>
                                <td style={{ color: "var(--admin-text-muted)", fontSize: "1.2rem", fontWeight: 600 }}>{u.phone || "—"}</td>
                                <td>
                                    <span style={{
                                        background: u.role === 'super_admin' ? '#d74f9022' : u.role === 'admin' ? '#3b82f622' : '#eee',
                                        color: u.role === 'super_admin' ? '#d74f90' : u.role === 'admin' ? '#3b82f6' : '#666',
                                        padding: "6px 14px", borderRadius: "9999px", fontSize: "1.1rem", fontWeight: 800
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ color: "var(--admin-text-muted)", fontSize: "1.2rem", fontWeight: 600 }}>{new Date(u.created_at).toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-GB")}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditClick(u)}
                                        className={styles.adminBtnSecondary}
                                        style={{ padding: "0.75rem 1.25rem", fontSize: "1.2rem", borderRadius: "10px", fontWeight: 700 }}
                                    >
                                        {lang === 'ar' ? "تعديل الملف" : "Modify Profile"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Editor Modal */}
            {editingUser && (
                <div className={styles.modalOverlay}>
                        <div className={styles.modalContent} style={{ maxWidth: "800px" }}>
                        <div className={styles.modalHeader} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <h2 style={{ fontSize: "2.25rem", fontWeight: 700 }}>{lang === 'ar' ? "تعديل الملف:" : "Modify Profile:"} <span style={{ color: "var(--admin-primary)" }}>{editingUser.name}</span></h2>
                            <button onClick={() => setEditingUser(null)} style={{ background: "none", border: "none", fontSize: "3rem", cursor: "pointer", color: "var(--admin-text-muted)" }}>×</button>
                        </div>
                        <div className={styles.modalBody} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>{lang === 'ar' ? "هوية الحساب" : "Account Identity"}</h3>
                                <div className={styles.formGrid}>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">{lang === 'ar' ? "الاسم الكامل" : "Full Name"}</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                                        />
                                    </div>
                                    <div className="formGroup">
                                        <label className="formLabel">{lang === 'ar' ? "البريد الإلكتروني" : "Email Address"}</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                                        />
                                    </div>
                                    <div className="formGroup">
                                        <label className="formLabel">{lang === 'ar' ? "رقم الهاتف" : "Phone Number"}</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.phone || ""}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                                        />
                                    </div>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">{lang === 'ar' ? "دور الصلاحية" : "Permission Role"}</label>
                                        <select
                                            className={styles.adminInput}
                                            value={editForm.role}
                                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                            style={{ textAlign: isRTL ? 'right' : 'left' }}
                                        >
                                            <option value="customer">{lang === 'ar' ? "عميل (مستخدم عادي)" : "Customer (Standard User)"}</option>
                                            <option value="admin">{lang === 'ar' ? "مسؤول (مشرف)" : "Administrator (Moderator)"}</option>
                                            <option value="super_admin">{lang === 'ar' ? "مسؤول خارق (صلاحية كاملة)" : "Super Administrator (Full Power)"}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <button onClick={() => setEditingUser(null)} className={styles.adminBtnSecondary} style={{ padding: "1.25rem 2.5rem", fontSize: "1.4rem", borderRadius: "12px" }}>
                                {lang === 'ar' ? "إلغاء" : "Cancel"}
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className={styles.adminBtn}
                                disabled={updating === editingUser.id}
                                style={{ padding: "1.25rem 3.5rem", fontSize: "1.4rem" }}
                            >
                                {updating === editingUser.id ? (lang === 'ar' ? "جاري التحديث..." : "Updating…") : (lang === 'ar' ? "اعتماد التغييرات ○" : "Commit Changes ○")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
