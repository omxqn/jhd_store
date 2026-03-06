"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import styles from "../admin.module.css";

interface NecklineShape {
    id: number;
    name: string;
    image_url: string | null;
    sort_order: number;
}

const emptyForm = { name: "", image_url: "", sort_order: "0" };

export default function NecklinesPage() {
    const [shapes, setShapes] = useState<NecklineShape[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<NecklineShape | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/necklines");
        const d = await res.json();
        setShapes(d.shapes || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (s: NecklineShape) => {
        setEditing(s);
        setForm({ name: s.name, image_url: s.image_url || "", sort_order: String(s.sort_order) });
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
            const payload = { name: form.name.trim(), image_url: form.image_url || null, sort_order: parseInt(form.sort_order) || 0 };
            const res = editing
                ? await fetch(`/api/admin/necklines/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
                : await fetch("/api/admin/necklines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

            if (res.ok) {
                toast.success(editing ? "Updated!" : "Created!");
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
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        const res = await fetch(`/api/admin/necklines/${id}`, { method: "DELETE" });
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
            <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 className={styles.pageTitle}>👔 Neckline <span>Shapes</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: ".875rem" }}>Manage neckline shape options shown during product customization</p>
                </div>
                <button className={styles.adminBtn} onClick={openCreate}>+ Add Neckline</button>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>Loading…</div>
            ) : shapes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--admin-text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👔</div>
                    <div style={{ fontWeight: 600 }}>No neckline shapes yet</div>
                    <button className={styles.adminBtn} style={{ marginTop: "1rem" }} onClick={openCreate}>Add your first shape</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem" }}>
                    {shapes.map(s => (
                        <div key={s.id} style={{
                            background: "var(--admin-surface)", border: "1px solid var(--admin-border)",
                            borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column",
                        }}>
                            {/* Image */}
                            <div style={{ aspectRatio: "1", background: "rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
                                {s.image_url ? (
                                    <img src={s.image_url} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "0.5rem" }} />
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2.5rem", color: "var(--admin-text-muted)" }}>👔</div>
                                )}
                            </div>
                            {/* Info */}
                            <div style={{ padding: "0.75rem 1rem", flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{s.name}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Sort: {s.sort_order}</div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: "flex", gap: "0.5rem", padding: "0.75rem 1rem", borderTop: "1px solid var(--admin-border)" }}>
                                <button onClick={() => openEdit(s)}
                                    style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                                    ✏️ Edit
                                </button>
                                <button onClick={() => handleDelete(s.id, s.name)}
                                    style={{ padding: "0.4rem 0.75rem", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                                    🗑
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className={styles.modal} style={{ maxWidth: "480px", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{editing ? "Edit Neckline Shape" : "New Neckline Shape"}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--admin-text-muted)" }}>×</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Name */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Name *</label>
                                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Classic Round" />
                            </div>

                            {/* Image */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Image</label>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />

                                {/* Preview */}
                                {form.image_url && (
                                    <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <img src={form.image_url} alt="preview" style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "8px", border: "1px solid var(--admin-border)", background: "rgba(0,0,0,0.03)", padding: "4px" }} />
                                        <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem" }}>
                                            Remove
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "1px solid var(--admin-border)", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                                        {uploading ? "Uploading…" : "📂 Upload Image"}
                                    </button>
                                </div>
                                <div style={{ marginTop: "0.5rem" }}>
                                    <input style={inputStyle} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste an image URL…" />
                                </div>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Sort Order</label>
                                <input style={inputStyle} type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                                <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>Lower numbers appear first</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontWeight: 600 }}>
                                Cancel
                            </button>
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
