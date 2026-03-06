"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import styles from "../../../admin.module.css";

const CATEGORIES = ["Thobes", "Abayas", "Bishts", "Kids", "Accessories"];
const BADGE_OPTIONS: [string, string][] = [
    ["sale", "On Sale"],
    ["norefund", "No Refund"],
    ["oos", "Out of Stock"],
    ["new", "New Arrival"],
    ["limited", "Limited Edition"],
    ["bestseller", "Best Seller"],
];

interface AccessoryRow { name: string; price: string; }
interface SpecRow { label: string; value: string; }

const safeJson = (v: any, fallback: any = []) => {
    if (Array.isArray(v)) return v;
    try { return JSON.parse(v); } catch { return fallback; }
};

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const [categories, setCategories] = useState<string[]>(["Thobes", "Abayas", "Bishts", "Kids", "Accessories"]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: "", category: "Thobes", price: "", old_price: "",
        availability: "available", stitch_price: "0", shipping_note: "",
        description: "", details: "", most_selling: false, stock: "100",
    });

    const [images, setImages] = useState<string[]>([]);
    const [fabricTypes, setFabricTypes] = useState<string[]>([]);
    const [fabricInput, setFabricInput] = useState("");
    const [necklines, setNecklines] = useState<string[]>([]);
    const [badges, setBadges] = useState<string[]>([]);
    const [accessories, setAccessories] = useState<AccessoryRow[]>([{ name: "None", price: "0" }]);
    const [specs, setSpecs] = useState<SpecRow[]>([{ label: "", value: "" }]);

    const [dbNecklines, setDbNecklines] = useState<{ id: number; name: string; image_url: string | null }[]>([]);

    // Pre-fetch categories + DB necklines
    useEffect(() => {
        fetch("/api/categories")
            .then(r => r.json())
            .then(d => { if (d.categories?.length) setCategories(d.categories.filter((c: any) => !c.image_url).map((c: any) => c.name)); })
            .catch(() => { });
        fetch("/api/admin/necklines")
            .then(r => r.json())
            .then(d => setDbNecklines(d.shapes || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!id) return;
        setFetching(true);
        fetch(`/api/admin/products/${id}`)
            .then(r => r.json())
            .then(({ product: p }) => {
                if (!p) { toast.error("Product not found"); router.push("/admin/products"); return; }
                setForm({
                    name: p.name || "", category: p.category || "Thobes",
                    price: p.price ?? "", old_price: p.old_price ?? "",
                    availability: p.availability || "available",
                    stitch_price: p.stitch_price ?? "0",
                    shipping_note: p.shipping_note || "",
                    description: p.description || "", details: p.details || "",
                    most_selling: !!p.most_selling, stock: p.stock ?? "100",
                });
                setImages(safeJson(p.images, []));
                setFabricTypes(safeJson(p.fabric_types, []));
                const rawNecklines = safeJson(p.neckline_shapes, []);
                setNecklines(rawNecklines.map((n: any) => typeof n === "string" ? n : n?.name ?? "").filter(Boolean));
                setBadges(safeJson(p.badges, []));
                const rawAcc = safeJson(p.accessories, [{ name: "None", price: 0 }]);
                setAccessories(rawAcc.map((a: any) => ({ name: a.name, price: String(a.price) })));
                const rawSpecs = safeJson(p.specs, []);
                setSpecs(rawSpecs.length ? rawSpecs.map((s: any) => ({ label: s.label, value: s.value })) : [{ label: "", value: "" }]);
            })
            .finally(() => setFetching(false));
    }, [id]);

    const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

    const handleFileUpload = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploadingIdx(images.length);
        const fd = new FormData();
        fd.append("file", files[0]);
        try {
            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.url) setImages(prev => [...prev, data.url]);
            else toast.error(data.error || "Upload failed");
        } catch { toast.error("Upload failed"); }
        finally { setUploadingIdx(null); }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFileUpload(e.dataTransfer.files);
    }, [images]);

    const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));
    const addFabric = () => {
        const v = fabricInput.trim();
        if (v && !fabricTypes.includes(v)) setFabricTypes(prev => [...prev, v]);
        setFabricInput("");
    };

    const addAccessory = () => setAccessories(prev => [...prev, { name: "", price: "0" }]);
    const removeAccessory = (i: number) => setAccessories(prev => prev.filter((_, idx) => idx !== i));
    const updateAccessory = (i: number, k: keyof AccessoryRow, v: string) =>
        setAccessories(prev => prev.map((a, idx) => idx === i ? { ...a, [k]: v } : a));

    const addSpec = () => setSpecs(prev => [...prev, { label: "", value: "" }]);
    const removeSpec = (i: number) => setSpecs(prev => prev.filter((_, idx) => idx !== i));
    const updateSpec = (i: number, k: keyof SpecRow, v: string) =>
        setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [k]: v } : s));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price || images.length === 0) {
            toast.error("Name, Price, and at least one image are required");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                old_price: form.old_price ? parseFloat(form.old_price) : null,
                stitch_price: parseFloat(form.stitch_price || "0"),
                stock: parseInt(form.stock || "100"),
                images,
                badges,
                fabric_types: fabricTypes,
                neckline_shapes: necklines,
                accessories: accessories.map(a => ({ name: a.name, price: parseFloat(a.price) || 0 })),
                specs: specs.filter(s => s.label).map(s => ({ label: s.label, value: s.value })),
            };
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) { toast.success("Product updated! ✓"); router.push("/admin/products"); }
            else { const d = await res.json(); toast.error(d.error || "Failed to update product"); }
        } finally { setLoading(false); }
    };

    const inputStyle = {
        background: "rgba(0,0,0,0.03)", border: "1px solid var(--admin-border)",
        borderRadius: "8px", padding: "0.6rem 0.85rem", color: "var(--admin-text)",
        fontSize: "0.875rem", width: "100%", outline: "none",
    } as const;

    const sectionStyle = {
        background: "var(--admin-surface)", border: "1px solid var(--admin-border)",
        borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem",
    } as const;

    const sectionTitle = {
        fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" as const,
        letterSpacing: "0.06em", color: "var(--admin-primary)", marginBottom: "1.25rem",
        display: "flex", alignItems: "center", gap: "0.5rem",
    };

    if (fetching) return <div style={{ textAlign: "center", padding: "4rem", color: "var(--admin-text-muted)" }}>Loading product…</div>;

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <button onClick={() => router.back()} style={{ background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.875rem" }}>← Back</button>
                <div>
                    <h1 className={styles.pageTitle}>Edit <span>Product #{id}</span></h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: ".875rem" }}>Update the details below</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Section 1: Identity */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>🏷️ Product Identity</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Product ID</label>
                            <input style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} value={id} readOnly />
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Product Name *</label>
                            <input style={inputStyle} value={form.name} onChange={f("name")} placeholder="e.g. Royal Embroidered Thobe" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Category *</label>
                            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category} onChange={f("category")}>
                                {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Availability</label>
                            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.availability} onChange={f("availability")}>
                                <option value="available">Available</option>
                                <option value="out-of-stock">Out of Stock</option>
                                <option value="coming-soon">Coming Soon</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Stock Units</label>
                            <input style={inputStyle} type="number" min="0" value={form.stock} onChange={f("stock")} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Pricing */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>💰 Pricing</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                        {[["Price (OMR) *", "price", "0.000"], ["Old Price (OMR)", "old_price", "Leave blank if no sale"], ["Stitch Price (OMR)", "stitch_price", "0.000"]].map(([label, key, ph]) => (
                            <div key={key}>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>{label}</label>
                                <input style={inputStyle} type="number" step="0.001" placeholder={ph} value={form[key as keyof typeof form] as string} onChange={f(key as keyof typeof form)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 3: Badges */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>🎖️ Badges</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {BADGE_OPTIONS.map(([key, label]) => (
                            <button key={key} type="button"
                                onClick={() => setBadges(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])}
                                style={{
                                    padding: "0.35rem 0.85rem", borderRadius: "9999px", border: "2px solid",
                                    borderColor: badges.includes(key) ? "var(--admin-primary)" : "var(--admin-border)",
                                    background: badges.includes(key) ? "rgba(215, 79, 144, 0.1)" : "transparent",
                                    color: badges.includes(key) ? "var(--admin-primary)" : "var(--admin-text-muted)",
                                    cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, transition: "all 150ms",
                                }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section 4: Images */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>🖼️ Product Images</div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileUpload(e.target.files)} />
                    <div
                        onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ border: "2px dashed var(--admin-border)", borderRadius: "12px", padding: "2rem", textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,0.02)", marginBottom: "1rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📂</div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Drag & drop to add more images, or click to browse</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: "0.25rem" }}>JPG, PNG, WebP — max 5MB each</div>
                        {uploadingIdx !== null && <div style={{ marginTop: "0.75rem", color: "var(--admin-primary)" }}>Uploading…</div>}
                    </div>
                    {images.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem" }}>
                            {images.map((url, i) => (
                                <div key={i} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", aspectRatio: "1", border: "1px solid var(--admin-border)" }}>
                                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <button type="button" onClick={() => removeImage(i)}
                                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                                    {i === 0 && <div style={{ position: "absolute", bottom: "4px", left: "4px", background: "var(--admin-primary)", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "2px 5px", borderRadius: "4px" }}>MAIN</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section 5: Description */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>📋 Description & Details</div>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Description *</label>
                            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" as const }} value={form.description} onChange={f("description")} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Additional Details</label>
                            <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" as const }} value={form.details} onChange={f("details")} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem", color: "var(--admin-text-muted)" }}>Shipping Note</label>
                            <input style={inputStyle} value={form.shipping_note} onChange={f("shipping_note")} />
                        </div>
                    </div>
                </div>

                {/* Section 6: Fabric Types */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>🧵 Fabric Types</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        {fabricTypes.map((fab, i) => (
                            <span key={i} style={{ background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                                {fab}
                                <button type="button" onClick={() => setFabricTypes(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "0.9rem" }}>×</button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input style={{ ...inputStyle, flex: 1 }} value={fabricInput} onChange={e => setFabricInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFabric(); } }}
                            placeholder="Type a fabric name and press Enter or Add" />
                        <button type="button" onClick={addFabric} style={{ padding: "0.6rem 1rem", borderRadius: "8px", background: "var(--admin-primary)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>+ Add</button>
                    </div>
                </div>

                {/* Section 7: Necklines */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>👔 Neckline Shapes</div>
                    {/* Selected chips */}
                    {necklines.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                            {necklines.map((n, i) => (
                                <span key={i} style={{ background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                                    {n}
                                    <button type="button" onClick={() => setNecklines(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "0.9rem", lineHeight: 1 }}>×</button>
                                </span>
                            ))}
                        </div>
                    )}
                    {/* DB picker grid */}
                    {dbNecklines.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "0.75rem" }}>
                            {dbNecklines.map(shape => {
                                const selected = necklines.includes(shape.name);
                                return (
                                    <button key={shape.id} type="button"
                                        onClick={() => setNecklines(prev =>
                                            selected ? prev.filter(n => n !== shape.name) : [...prev, shape.name]
                                        )}
                                        style={{
                                            border: `2px solid ${selected ? "var(--admin-primary)" : "var(--admin-border)"}`,
                                            borderRadius: "10px", background: selected ? "rgba(215,79,144,0.1)" : "var(--admin-surface)",
                                            cursor: "pointer", padding: "0.5rem", textAlign: "center",
                                            transition: "all 150ms", position: "relative",
                                        }}>
                                        {selected && <div style={{ position: "absolute", top: "4px", right: "4px", background: "var(--admin-primary)", color: "#fff", borderRadius: "50%", width: "16px", height: "16px", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✓</div>}
                                        {shape.image_url ? (
                                            <img src={shape.image_url} alt={shape.name} style={{ width: "100%", aspectRatio: "1", objectFit: "contain", borderRadius: "6px", marginBottom: "0.4rem" }} />
                                        ) : (
                                            <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>👔</div>
                                        )}
                                        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: selected ? "var(--admin-primary)" : "var(--admin-text)" }}>{shape.name}</div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ color: "var(--admin-text-muted)", fontSize: "0.85rem", padding: "1rem", textAlign: "center", border: "1px dashed var(--admin-border)", borderRadius: "8px" }}>
                            No neckline shapes in database yet. <a href="/admin/necklines" target="_blank" style={{ color: "var(--admin-primary)" }}>Add some →</a>
                        </div>
                    )}
                </div>

                {/* Section 8: Accessories */}
                <div style={sectionStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <div style={sectionTitle}>💎 Accessories</div>
                        <button type="button" onClick={addAccessory} style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>+ Add Row</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text-muted)", padding: "0 0.25rem" }}><span>Name</span><span>Price (OMR)</span><span></span></div>
                        {accessories.map((a, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", alignItems: "center" }}>
                                <input style={inputStyle} value={a.name} onChange={e => updateAccessory(i, "name", e.target.value)} placeholder="e.g. Cufflinks" />
                                <input style={{ ...inputStyle, width: "100px" }} type="number" step="0.001" value={a.price} onChange={e => updateAccessory(i, "price", e.target.value)} />
                                <button type="button" onClick={() => removeAccessory(i)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem" }}>×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 9: Specs */}
                <div style={sectionStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <div style={sectionTitle}>📊 Product Specs</div>
                        <button type="button" onClick={addSpec} style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", background: "rgba(215,79,144,0.1)", color: "var(--admin-primary)", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>+ Add Spec</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--admin-text-muted)", padding: "0 0.25rem" }}><span>Label</span><span>Value</span><span></span></div>
                        {specs.map((s, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "center" }}>
                                <input style={inputStyle} value={s.label} onChange={e => updateSpec(i, "label", e.target.value)} placeholder="e.g. Material" />
                                <input style={inputStyle} value={s.value} onChange={e => updateSpec(i, "value", e.target.value)} placeholder="e.g. 100% Cotton" />
                                <button type="button" onClick={() => removeSpec(i)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: "6px", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem" }}>×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Options */}
                <div style={sectionStyle}>
                    <div style={sectionTitle}>⚙️ Options</div>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
                        <input type="checkbox" checked={form.most_selling as boolean} onChange={f("most_selling")} style={{ width: 18, height: 18, accentColor: "var(--admin-primary)" }} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Feature on Homepage</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Show in the "Most Selling" section</div>
                        </div>
                    </label>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", paddingBottom: "3rem" }}>
                    <button type="button" onClick={() => router.back()} style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{ padding: "0.75rem 2rem", borderRadius: "8px", background: "var(--admin-primary)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem" }}>
                        {loading ? "Saving…" : "✓ Update Product"}
                    </button>
                </div>
            </form>
        </div>
    );
}
