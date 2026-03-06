"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./page.module.css";
import Link from "next/link";

export default function ProfilePage() {
    const { authUser, setAuthUser } = useStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: ""
    });

    useEffect(() => {
        if (authUser) {
            setForm({
                name: authUser.name || "",
                email: authUser.email || "",
                phone: authUser.phone || "",
                address: authUser.address || "",
                city: authUser.city || ""
            });
        }
    }, [authUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");
            setAuthUser(data.user);
            toast.success("Boutique profile updated ○");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!authUser) {
        return (
            <div className={styles.page}>
                <div className="container" style={{ textAlign: "center", paddingBlock: "8rem" }}>
                    <h2 className={styles.title}>Access Restricted</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Please sign in to manage your profile.</p>
                    <Link href="/login" className="btn btnPrimary">Sign In ○</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Profile <span>Concierge</span></h1>
                </div>

                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Personal Details</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className="formGroup">
                                <label className="formLabel">Full Name</label>
                                <input
                                    className="formInput"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="formGroup">
                                <label className="formLabel">Email Address</label>
                                <input
                                    className="formInput"
                                    type="email"
                                    value={form.email}
                                    disabled
                                    style={{ background: "var(--surface-2)", cursor: "not-allowed" }}
                                />
                            </div>
                            <div className="formGroup">
                                <label className="formLabel">Direct Phone</label>
                                <input
                                    className="formInput"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>
                            <div className="formGroup">
                                <label className="formLabel">Shipping City</label>
                                <input
                                    className="formInput"
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                />
                            </div>
                            <div className="formGroup" style={{ gridColumn: "span 2" }}>
                                <label className="formLabel">Default Destination (Address)</label>
                                <input
                                    className="formInput"
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem" }}>
                            <button type="submit" className="btn btnPrimary" disabled={loading}>
                                {loading ? "Preserving Changes…" : "Update Profile ○"}
                            </button>
                            <Link href="/myaccount" className="btn btnGhost">Return to Hub</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
