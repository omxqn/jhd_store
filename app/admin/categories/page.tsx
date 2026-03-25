"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import styles from "../admin.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface Category {
    id: number;
    name: string;
    name_ar: string | null;
    image_url: string | null;
    sort_order: number;
}

const emptyForm = { name: "", name_ar: "", image_url: "", sort_order: "0" };

export default function CategoriesPage() {
    const { lang, t, isRTL } = useLanguage();
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
            else toast.error(d.error || (lang === 'ar' ? "فشل الرفع" : "Upload failed"));
        } catch { toast.error(lang === 'ar' ? "فشل الرفع" : "Upload failed"); }
        finally { setUploading(false); }
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error(lang === 'ar' ? "الاسم مطلوب" : "Name is required"); return; }
        setSaving(true);
        try {
            const payload = { name: form.name.trim(), name_ar: form.name_ar.trim() || null, image_url: form.image_url || null, sort_order: parseInt(form.sort_order) || 0 };
            const res = editing
                ? await fetch(`/api/admin/categories/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
                : await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                toast.success(editing 
                    ? (lang === 'ar' ? "تم تحديث التصنيف!" : "Category updated!") 
                    : (lang === 'ar' ? "تم إنشاء التصنيف!" : "Category created!")
                );
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
        if (!confirm(lang === 'ar' ? `هل أنت متأكد من حذف التصنيف "${name}"؟ لن يتم حذف المنتجات التابعة له.` : `Delete category "${name}"? Products in this category will not be deleted.`)) return;
        const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        if (res.ok) { toast.success(lang === 'ar' ? "تم الحذف" : "Deleted"); load(); }
        else toast.error(lang === 'ar' ? "فشل الحذف" : "Failed to delete");
    };

    const inputStyle = {
        background: "rgba(0,0,0,0.03)", border: "1px solid var(--admin-border)",
        borderRadius: "10px", padding: "1rem 1.25rem", color: "var(--admin-text)",
        fontSize: "1.5rem", width: "100%", outline: "none", fontWeight: 600
    } as const;

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h1 className={styles.pageTitle}>{lang === 'ar' ? "🗂️ التصنيفات" : "🗂️ Categories"}</h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem" }}>{lang === 'ar' ? "إدارة تصنيفات المتجر. تظهر البطاقات المرئية كمربعات على الصفحة الرئيسية؛ بينما تظهر التصنيفات الحرفية فقط كصفوف تابعة للمنتجات." : "Manage store categories. Visual cards appear as tiles on the homepage; text-only categories appear as product rows."}</p>
                </div>
                <button className={styles.adminBtn} style={{ padding: "1.25rem 2.5rem", fontSize: "1.5rem" }} onClick={openCreate}>+ {lang === 'ar' ? "إضافة تصنيف" : "Add Category"}</button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--admin-text-muted)" }}>{t('common.loading')}</div>
            ) : categories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "6rem", color: "var(--admin-text-muted)" }}>
                    <div style={{ fontSize: "5rem", marginBottom: "2rem" }}>🗂️</div>
                    <div style={{ fontWeight: 700, fontSize: "1.8rem" }}>{lang === 'ar' ? "لا يوجد تصنيفات حالياً" : "No categories configured yet"}</div>
                    <button className={styles.adminBtn} style={{ marginTop: "2rem", padding: "1.25rem 2.5rem", fontSize: "1.5rem" }} onClick={openCreate}>{lang === 'ar' ? "أضف تصنيفك الأول" : "Add your first category"}</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem" }}>
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
                            <div style={{ padding: "1.25rem 1.5rem", flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
                                <div style={{ fontWeight: 800, fontSize: "1.5rem", color: "var(--admin-text)" }}>{lang === 'ar' ? (cat.name_ar || cat.name) : cat.name}</div>
                                {lang === 'en' && cat.name_ar && <div style={{ fontSize: "1.25rem", color: "var(--admin-text-muted)", direction: "rtl", marginTop: "0.5rem", fontWeight: 700 }}>{cat.name_ar}</div>}
                                {lang === 'ar' && cat.name_ar && <div style={{ fontSize: "1.25rem", color: "var(--admin-text-muted)", marginTop: "0.5rem", fontWeight: 700 }}>{cat.name}</div>}
                                <div style={{ fontSize: "1.1rem", color: "var(--admin-text-muted)", marginTop: "0.75rem", fontWeight: 600 }}>{lang === 'ar' ? "ترتيب العرض:" : "Sort Order:"} {cat.sort_order}</div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: "flex", gap: "1rem", padding: "1rem 1.25rem", borderTop: "1px solid var(--admin-border)", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <button onClick={() => openEdit(cat)} style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "none", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700 }}>{lang === 'ar' ? "✏️ تعديل" : "✏️ Edit"}</button>
                                <button onClick={() => handleDelete(cat.id, cat.name)} style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div className={styles.modal} style={{ maxWidth: "600px", width: "100%", padding: "2.5rem", textAlign: isRTL ? 'right' : 'left' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <h2 style={{ fontWeight: 800, fontSize: "2.1rem" }}>{editing ? (lang === 'ar' ? "تعديل التصنيف" : "Modify Category") : (lang === 'ar' ? "إنشاء تصنيف" : "Build Category")}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", fontSize: "3rem", cursor: "pointer", color: "var(--admin-text-muted)" }}>×</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Name */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                <div className="formGroup">
                                    <label style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--admin-text-muted)" }}>{lang === 'ar' ? "الاسم (EN) *" : "Name (EN) *"}</label>
                                    <input style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Thobes" />
                                </div>
                                <div className="formGroup">
                                    <label style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--admin-text-muted)" }}>{lang === 'ar' ? "الاسم (AR)" : "Name (AR)"}</label>
                                    <input style={{ ...inputStyle, direction: "rtl", textAlign: "right" }} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} placeholder="مثال: ثياب" />
                                </div>
                            </div>

                            {/* Image */}
                            <div className="formGroup">
                                <label style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--admin-text-muted)" }}>
                                    {lang === 'ar' ? "صورة العرض" : "Display Image"} <span style={{ fontWeight: 400, fontSize: "1.1rem" }}>{lang === 'ar' ? "(اختياري — لمربعات الصفحة الرئيسية)" : "(optional — for homepage tiles)"}</span>
                                </label>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
                                {form.image_url && (
                                    <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "1.5rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                        <img src={form.image_url} alt="preview" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "12px", border: "1px solid var(--admin-border)" }} />
                                        <button type="button" onClick={() => setForm(f => ({ ...f, image_url: "" }))} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "10px", padding: "0.75rem 1.5rem", cursor: "pointer", fontSize: "1.2rem", fontWeight: 700 }}>{lang === 'ar' ? "إزالة" : "Remove"}</button>
                                    </div>
                                )}
                                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                                        style={{ padding: "0.75rem 1.5rem", borderRadius: "10px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "1px solid var(--admin-border)", cursor: "pointer", fontWeight: 700, fontSize: "1.25rem" }}>
                                        {uploading ? (lang === 'ar' ? "جاري الرفع..." : "Uploading…") : (lang === 'ar' ? "📂 اختر صورة للواجهة" : "📂 Select Banner Image")}
                                    </button>
                                </div>
                                <input style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder={lang === 'ar' ? "أو الصق رابط الصورة..." : "Or paste an image URL…"} />
                            </div>

                            {/* Sort Order */}
                            <div className="formGroup">
                                <label style={{ display: "block", fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--admin-text-muted)" }}>{lang === 'ar' ? "أولوية العرض (ترتيب الفرز)" : "Display Priority (Sort Rank)"}</label>
                                <input style={{ ...inputStyle, textAlign: isRTL ? 'right' : 'left' }} type="number" min="0" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                                <div style={{ fontSize: "1.1rem", color: "var(--admin-text-muted)", marginTop: "0.5rem", fontWeight: 600 }}>{lang === 'ar' ? "الأرقام الأقل تظهر أولاً في الموقع." : "Lower numbers appear first on the site."}</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", justifyContent: isRTL ? 'flex-start' : "flex-end", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: "1.25rem 2.5rem", borderRadius: "12px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "1.4rem" }}>{lang === 'ar' ? "إلغاء" : "Cancel"}</button>
                            <button onClick={handleSave} disabled={saving || uploading} className={styles.adminBtn} style={{ padding: "1.25rem 3rem", fontSize: "1.4rem" }}>
                                {saving ? (lang === 'ar' ? "جاري الحفظ..." : "Saving…") : editing ? (lang === 'ar' ? "✓ تحديث" : "✓ Update") : (lang === 'ar' ? "✓ إنشاء" : "✓ Create")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
