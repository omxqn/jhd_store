"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import styles from "../admin.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface NecklineShape {
    id: number;
    name: string;
    image_url: string | null;
    sort_order: number;
}

const emptyForm = { name: "", image_url: "", sort_order: "0" };

export default function NecklinesPage() {
    const { lang, t, isRTL } = useLanguage();
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
            else toast.error(d.error || (lang === 'ar' ? "فشل الرفع" : "Upload failed"));
        } catch { toast.error(lang === 'ar' ? "فشل الرفع" : "Upload failed"); }
        finally { setUploading(false); }
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error(lang === 'ar' ? "الاسم مطلوب" : "Name is required"); return; }
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
                let msg = lang === 'ar' ? "فشل الحفظ" : "Failed to save";
                try { msg = JSON.parse(text).error || msg; } catch { }
                toast.error(msg);
            }
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(lang === 'ar' ? `هل أنت متأكد من حذف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Delete "${name}"? This cannot be undone.`)) return;
        const res = await fetch(`/api/admin/necklines/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success(lang === 'ar' ? "تم الحذف" : "Deleted"); load(); }
        else toast.error(lang === 'ar' ? "فشل الحذف" : "Failed to delete");
    };

    const inputStyle = {
        background: "var(--admin-surface)", border: "1px solid var(--admin-border)",
        borderRadius: "12px", padding: "1.25rem 1.5rem", color: "var(--admin-text)",
        fontSize: "1.375rem", width: "100%", outline: "none",
    } as const;

    return (
        <div>
            {/* Header */}
            <div className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h1 className={styles.pageTitle}>👔 {lang === 'ar' ? "أشكال " : "Neckline "} <span>{lang === 'ar' ? "فتحة الرقبة" : "Shapes"}</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem" }}>{lang === 'ar' ? "إدارة خيارات أشكال فتحة الرقبة المعروضة أثناء تخصيص المنتج" : "Manage neckline shape options shown during product customization"}</p>
                </div>
                <button className={styles.adminBtn} onClick={openCreate} style={{ fontSize: "1.5rem", padding: "1.25rem 2.5rem" }}>{lang === 'ar' ? "+ إضافة فتحة رقبة" : "+ Add Neckline"}</button>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>{t('common.loading')}</div>
            ) : shapes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--admin-text-muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👔</div>
                    <div style={{ fontWeight: 600 }}>{lang === 'ar' ? "لا توجد أشكال فتحة رقبة بعد" : "No neckline shapes yet"}</div>
                    <button className={styles.adminBtn} style={{ marginTop: "1rem" }} onClick={openCreate}>{lang === 'ar' ? "أضف شكلك الأول" : "Add your first shape"}</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
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
                            <div style={{ padding: "1.5rem", flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                                <div style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.name}</div>
                                <div style={{ fontSize: "1.3rem", color: "var(--admin-text-muted)" }}>{lang === 'ar' ? "ترتيب العرض:" : "Sort Order:"} {s.sort_order}</div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: "flex", gap: "1rem", padding: "1.25rem 1.5rem", borderTop: "1px solid var(--admin-border)", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <button onClick={() => openEdit(s)}
                                    style={{ flex: 1, padding: "0.85rem", borderRadius: "10px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "none", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700 }}>
                                    ✏️ {lang === 'ar' ? "تعديل" : "Edit"}
                                </button>
                                <button onClick={() => handleDelete(s.id, s.name)}
                                    style={{ padding: "0.85rem 1.5rem", borderRadius: "10px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700 }}>
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
                        <div className={styles.modalContent} style={{ maxWidth: "600px", width: "100%", textAlign: isRTL ? 'right' : 'left' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.25rem", padding: "2rem 2.5rem", borderBottom: "1px solid var(--admin-border)", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <h2 style={{ fontWeight: 700, fontSize: "2.25rem" }}>{editing ? (lang === 'ar' ? "تعديل شكل الرقبة" : "Edit Neckline") : (lang === 'ar' ? "شكل رقبة جديد" : "New Neckline")}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: "3rem", cursor: "pointer", color: "var(--admin-text-muted)" }}>×</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", padding: "0 2.5rem 2.5rem" }}>
                            {/* Name */}
                            <div>
                                <label style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--admin-text-muted)" }}>{lang === 'ar' ? "اسم الشكل *" : "Shape Name *"}</label>
                                <input style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={lang === 'ar' ? "مثال: دائري كلاسيكي" : "e.g. Classic Round"} />
                            </div>

                            {/* Image */}
                            <div>
                                <label style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--admin-text-muted)" }}>{lang === 'ar' ? "معاينة بصرية" : "Visual Preview"}</label>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />

                                {/* Preview */}
                                {form.image_url && (
                                    <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "1.25rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                        <img src={form.image_url} alt="preview" style={{ width: "120px", height: "120px", objectFit: "contain", borderRadius: "12px", border: "1px solid var(--admin-border)", background: "var(--admin-surface)", padding: "10px" }} />
                                        <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700 }}>
                                            {lang === 'ar' ? "حذف الصورة" : "Discard Image"}
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: "flex", gap: "1rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        style={{ padding: "1.25rem 2rem", borderRadius: "12px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "1px solid var(--admin-border)", cursor: "pointer", fontWeight: 700, fontSize: "1.2rem" }}>
                                        {uploading ? (lang === 'ar' ? "⌛ جاري الرفع..." : "⌛ Uploading…") : (lang === 'ar' ? "📂 اختر ملف صورة" : "📂 Choose Image File")}
                                    </button>
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <input style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder={lang === 'ar' ? "أو الصق رابط الصورة مباشرة..." : "Or paste an image URL directly…"} />
                                </div>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--admin-text-muted)" }}>{lang === 'ar' ? "أولوية العرض (الترتيب)" : "Display Priority (Sort Order)"}</label>
                                <input style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                                <div style={{ fontSize: "1.1rem", color: "var(--admin-text-muted)", marginTop: "0.5rem" }}>{lang === 'ar' ? "الأرقام الأقل تظهر أولاً في قائمة العميل." : "Lower numbers appear first in the customer selector."}</div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", justifyContent: "flex-end", padding: "2rem 2.5rem", borderTop: "1px solid var(--admin-border)", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: "1.25rem 2.5rem", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1.4rem" }}>
                                {lang === 'ar' ? "تجاهل" : "Discard"}
                            </button>
                            <button onClick={handleSave} disabled={saving || uploading} className={styles.adminBtn} style={{ padding: "1.25rem 3rem", fontSize: "1.4rem" }}>
                                {saving ? (lang === 'ar' ? "جاري الحفظ..." : "Saving…") : editing ? (lang === 'ar' ? "✓ تحديث الشكل" : "✓ Update Shape") : (lang === 'ar' ? "✓ إنشاء الشكل" : "✓ Create Shape")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
