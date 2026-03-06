"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import styles from "../admin.module.css";

interface Category {
    id: number;
    name: string;
    name_ar: string | null;
    image_url: string | null;
    sort_order: number;
}

const emptyForm = { name: "", name_ar: "", image_url: "", sort_order: "0" };

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/categories");
        const d = await res.json();
        setCategories(d.categories || []);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };
    const openEdit = (c: Category) => {
        setEditing(c);
        setForm({ name: c.name, name_ar: c.name_ar || "", image_url: c.image_url || "", sort_order: String(c.sort_order) });
        setIsModalOpen(true);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const d = await res.json();
            if (d.url) setForm(prev => ({ ...prev, image_url: d.url }));
            else toast.error(d.error || "Upload failed");
        } catch { toast.error("Upload failed"); }
        finally { setUploading(false); }
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error("Name is required"); return; }
        setSaving(true);
        try {
            const payload = { name: form.name.trim(), name_ar: form.name_ar.trim() || null, image_url: form.image_url || null, sort_order: parseInt(form.sort_order) || 0 };
            const res = editing
                ? await fetch(`/api/admin/categories/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
                : await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                toast.success(editing ? "Category updated!" : "Category created!");
                setIsModalOpen(false);
                load();
            } else {
                const text = await res.text();
                let msg = "Failed to save";
                try { msg = JSON.parse(text).error || msg; } catch { }
                toast.error(msg);
            }
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Delete category "${name}"? Products in this category will not be deleted.`)) return;
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("Deleted"); load(); }
        else toast.error("Failed to delete");
    };

    const inputStyle = {
        background: "rgba(0,0,0,0.03)", border: "1px solid var(--admin-border)",
        borderRadius: "8px", padding: "0.6rem 0.85rem", color: "var(--admin-text)",
        fontSize: "0.875rem", width: "100%", outline: "none",
    } as const;

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 className={styles.pageTitle}>🗂️ Categories</h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: ".875rem" }}>Manage store categories. Visual (with image) appear as tiles on the homepage; text-only appear as product rows.</p>
                </div>
                <button className={styles.adminBtn} onClick={openCreate}>+ Add Category</button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>Loading…</div>
            ) : categories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--admin-text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗂️</div>
                    <div style={{ fontWeight: 600 }}>No categories yet</div>
                    <button className={styles.adminBtn} style={{ marginTop: "1rem" }} onClick={openCreate}>Add your first category</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                    {categories.map(cat => (
                        <div key={cat.id} style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            {/* Image or placeholder */}
                            <div style={{ aspectRatio: "1", overflow: "hidden", background: "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {cat.image_url
                                    ? <img src={cat.image_url} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <span style={{ fontSize: "2.5rem", color: "var(--admin-text-muted)" }}>🗂️</span>
                                }
                            </div>
                            {/* Info */}
                            <div style={{ padding: "0.75rem 1rem", flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{cat.name}</div>
                                {cat.name_ar && <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", direction: "rtl", marginTop: "2px" }}>{cat.name_ar}</div>}
                                <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: "4px" }}>Sort: {cat.sort_order}</div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: "flex", gap: "0.5rem", padding: "0.6rem 0.75rem", borderTop: "1px solid var(--admin-border)" }}>
                                <button onClick={() => openEdit(cat)} style={{ flex: 1, padding: "0.35rem", borderRadius: "6px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}>✏️ Edit</button>
                                <button onClick={() => handleDelete(cat.id, cat.name)} style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "0.78rem" }}>🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className={styles.modal} style={{ maxWidth: "500px", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{editing ? "Edit Category" : "New Category"}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--admin-text-muted)" }}>×</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Name */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Name (EN) *</label>
                                    <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Thobes" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Name (AR)</label>
                                    <input style={{ ...inputStyle, direction: "rtl" }} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} placeholder="مثال: ثياب" />
                                </div>
                            </div>

                            {/* Image */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>
                                    Image <span style={{ fontWeight: 400 }}>(optional — adds a visual tile on the homepage)</span>
                                </label>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
                                {form.image_url && (
                                    <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <img src={form.image_url} alt="preview" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--admin-border)" }} />
                                        <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
                                    </div>
                                )}
                                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "1px solid var(--admin-border)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                                        {uploading ? "Uploading…" : "📂 Upload Image"}
                                    </button>
                                </div>
                                <input style={inputStyle} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste an image URL…" />
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Sort Order</label>
                                <input style={inputStyle} type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                                <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>Lower numbers appear first</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving || uploading} className={styles.adminBtn}>
                                {saving ? "Saving…" : editing ? "✓ Update" : "✓ Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
