"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "../admin.module.css";
import { useStore } from "@/lib/store";

export default function SuperAdminUsersPage() {
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
        return <div style={{ padding: "2rem", textAlign: "center" }}>Access Denied: Super Admin Only</div>;
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
                toast.success("User updated successfully");
                setEditingUser(null);
                loadUsers();
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

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>User <span>Concierge</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: ".875rem" }}>{users.length} total users registered</p>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {["ID", "Name", "Email", "Phone", "Role", "Joined", "Actions"].map(h => (
                                <th key={h}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>Loading User Directory…</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td style={{ color: "var(--admin-text-muted)" }}>#{u.id}</td>
                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                <td>{u.email}</td>
                                <td style={{ color: "var(--admin-text-muted)" }}>{u.phone || "—"}</td>
                                <td>
                                    <span style={{
                                        background: u.role === 'super_admin' ? '#d74f9022' : u.role === 'admin' ? '#3b82f622' : '#eee',
                                        color: u.role === 'super_admin' ? '#d74f90' : u.role === 'admin' ? '#3b82f6' : '#666',
                                        padding: "3px 8px", borderRadius: "9999px", fontSize: ".7rem", fontWeight: 700
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ color: "var(--admin-text-muted)", fontSize: ".8rem" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditClick(u)}
                                        className={styles.adminBtnSecondary}
                                        style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px" }}
                                    >
                                        Modify Profile
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
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Modify Profile: <span style={{ color: "var(--admin-primary)" }}>{editingUser.name}</span></h2>
                            <button onClick={() => setEditingUser(null)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formSection}>
                                <h3 className={styles.formSectionTitle}>Account Identity</h3>
                                <div className={styles.formGrid}>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">Full Name</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.name}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="formGroup">
                                        <label className="formLabel">Email Address</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="formGroup">
                                        <label className="formLabel">Phone Number</label>
                                        <input
                                            className={styles.adminInput}
                                            value={editForm.phone || ""}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                        <label className="formLabel">Permission Role</label>
                                        <select
                                            className={styles.adminInput}
                                            value={editForm.role}
                                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                        >
                                            <option value="customer">Customer (Standard User)</option>
                                            <option value="admin">Administrator (Moderator)</option>
                                            <option value="super_admin">Super Administrator (Full Power)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button onClick={() => setEditingUser(null)} className={styles.adminBtnSecondary} style={{ padding: "0.75rem 1.5rem" }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className={styles.adminBtn}
                                disabled={updating === editingUser.id}
                                style={{ padding: "0.75rem 2rem" }}
                            >
                                {updating === editingUser.id ? "Updating…" : "Commit Changes ○"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
