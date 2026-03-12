"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore, formatPrice, CartItem } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./page.module.css";

/** Normalize a DB row → the shape the page expects */
function normalizeProduct(p: any) {
    const safeJson = (v: any, fallback: any) => {
        if (Array.isArray(v)) return v;
        if (!v) return fallback;
        try { return JSON.parse(v); } catch { return fallback; }
    };
    return {
        id: String(p.id),
        name: p.name,
        category: p.category,
        price: parseFloat(p.price) || 0,
        oldPrice: p.old_price ? parseFloat(p.old_price) : null,
        stitchPrice: parseFloat(p.stitch_price) || 0,
        availability: p.availability || "available",
        shippingNote: p.shipping_note || "",
        description: p.description || "",
        details: p.details || "",
        images: safeJson(p.images, [p.images].filter(Boolean)),
        fabricTypes: safeJson(p.fabric_types, []),
        necklineShapes: safeJson(p.neckline_shapes, []).map((n: any) =>
            typeof n === "string" ? { name: n, image: "" } : n
        ),
        accessories: safeJson(p.accessories, [{ name: "None", price: 0 }]),
        specs: safeJson(p.specs, []),
        badges: safeJson(p.badges, []),
        mostSelling: !!p.most_selling,
        stock: p.stock ?? null,
        shippingCost: parseFloat(p.shipping_cost) || 2,
        sizes: safeJson(p.sizes, []),
        colors: safeJson(p.colors, []),
        options: safeJson(p.options, []),
        isPremade: !!p.is_premade,
    };
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { country, addToCart, toggleWishlist, wishlist } = useStore();

    const [product, setProduct] = useState<ReturnType<typeof normalizeProduct> | null>(null);
    const [loading, setLoading] = useState(true);

    const [qty, setQty] = useState(1);
    const [fabricType, setFabricType] = useState("");
    const [fabricLength, setFabricLength] = useState("");
    const [neckSize, setNeckSize] = useState("");
    const [selectedNeckline, setSelectedNeckline] = useState("");
    const [necklineOpen, setNecklineOpen] = useState(false);
    const [stitch, setStitch] = useState<"yes" | "no">("no");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [tailorMeasurements, setTailorMeasurements] = useState<Record<string, string>>({});
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>(["None"]);
    const [activeTab, setActiveTab] = useState<"desc" | "details" | "specs">("desc");
    const imgRef = useRef<HTMLDivElement>(null);
    const lensRef = useRef<HTMLDivElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rawId = params.id as string;
        // Strip leading zeros so "009" → fetches product 9
        const numericId = parseInt(rawId, 10);
        const id = isNaN(numericId) ? rawId : String(numericId);

        fetch(`/api/products/${id}`)
            .then(r => r.json())
            .then(d => {
                if (!d.product) { router.replace("/"); return; }
                const p = normalizeProduct(d.product);
                setProduct(p);
                setFabricType(p.fabricTypes[0] ?? "");
                setSelectedNeckline(p.necklineShapes[0]?.name ?? "");
            })
            .catch(() => router.replace("/"))
            .finally(() => setLoading(false));
    }, [params.id]);

    const handleMagnify = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const wrap = imgRef.current, lens = lensRef.current, result = resultRef.current;
        if (!wrap || !lens || !result) return;
        const rect = wrap.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const zoom = 2.5, lw = lens.offsetWidth, lh = lens.offsetHeight;
        const lx = Math.max(0, Math.min(x - lw / 2, rect.width - lw));
        const ly = Math.max(0, Math.min(y - lh / 2, rect.height - lh));
        lens.style.left = `${lx}px`; lens.style.top = `${ly}px`;
        const img = wrap.querySelector("img") as HTMLImageElement;
        result.style.backgroundImage = `url('${img?.src}')`;
        result.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
        result.style.backgroundPosition = `${-(lx * zoom)}px ${-(ly * zoom)}px`;
    }, []);

    const toggleAccessory = (name: string) => {
        if (name === "None") { setSelectedAccessories(["None"]); return; }
        setSelectedAccessories(prev => {
            const without = prev.filter(a => a !== "None");
            if (prev.includes(name)) { const n = without.filter(a => a !== name); return n.length === 0 ? ["None"] : n; }
            return [...without, name];
        });
    };

    if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--secondary)" }}>Loading product…</div>;
    if (!product) return (
        <div style={{ padding: "4rem", textAlign: "center" }}>
            <h2 style={{ color: "#e6a91f" }}>Product not found</h2>
            <button className="btn btnPrimary" onClick={() => router.push("/")}>Back to Shop</button>
        </div>
    );

    const isWishlisted = wishlist.includes(product.id);
    const stitchPrice = stitch === "yes" ? product.stitchPrice : 0;
    const accessoriesPrice = selectedAccessories.filter(a => a !== "None")
        .reduce((sum, name) => sum + (product.accessories.find((x: any) => x.name === name)?.price ?? 0), 0);
    const totalPrice = (product.price + stitchPrice + accessoriesPrice) * qty;

    const handleAddToCart = () => {
        if (product.sizes.length > 0 && !selectedSize) {
            toast.error("Please select a size 📏");
            return;
        }
        if (product.colors.length > 0 && !selectedColor) {
            toast.error("Please select a color 🎨");
            return;
        }

        // Validate generic options
        for (const opt of product.options) {
            if (!selectedOptions[opt.title]) {
                toast.error(`Please select: ${opt.title}`);
                return;
            }
        }

        const item: CartItem = {
            productId: product.id,
            name: product.name,
            price: product.price + stitchPrice + accessoriesPrice,
            quantity: qty,
            fabricType: product.isPremade ? "N/A" : fabricType, 
            fabricLength: product.isPremade ? "N/A" : fabricLength, 
            neckSize: product.isPremade ? "N/A" : neckSize,
            neckline: product.isPremade ? "N/A" : selectedNeckline,
            stitch: !product.isPremade && stitch === "yes",
            stitchPrice: (!product.isPremade && stitch === "yes") ? product.stitchPrice : 0,
            accessoriesPrice,
            tailorMeasurements: (!product.isPremade && stitch === "yes") ? tailorMeasurements : {},
            accessories: selectedAccessories,
            image: product.images[0] ?? "",
            shippingCost: product.shippingCost,
            size: selectedSize || undefined,
            color: selectedColor || undefined,
            selectedOptions: selectedOptions,
        };
        addToCart(item);
        toast.success(`${product.name} added to cart! 🛒`);
    };

    const availMap: Record<string, { label: string; cls: string }> = {
        "available": { label: "Available", cls: styles.availAvail },
        "out-of-stock": { label: "Out of Stock", cls: styles.availOos },
        "coming-soon": { label: "Coming Soon", cls: styles.availSoon },
    };
    const avail = availMap[product.availability] ?? availMap["available"];

    return (
        <div className={styles.page}>
            <div className={`container ${styles.productContainer}`}>
                <div className={styles.breadcrumb}>
                    <Link href="/">Home</Link> / <Link href={`/category/${product.category.toLowerCase()}`}>{product.category}</Link> / <span>{product.name}</span>
                </div>

                <div className={styles.layout}>
                    <div className={styles.imageCol}>
                        <div className={styles.mainImgWrap} ref={imgRef} onMouseMove={handleMagnify}>
                            <img src={product.images[0]} alt={product.name} className={styles.mainImg} />
                            <div ref={lensRef} className={styles.magnifierLens} />
                            <div ref={resultRef} className={styles.magnifierResult} />
                        </div>
                    </div>

                    <div className={styles.infoCol}>
                        <div>
                            <div className={styles.prodNum}>#{product.id}</div>
                            <h1 className={styles.prodName}>{product.name}</h1>
                        </div>

                        <div className={styles.priceRow}>
                            <span className={styles.priceCurrent}>{formatPrice(product.price, country)}</span>
                            {product.oldPrice && <span className={styles.priceOld}>{formatPrice(product.oldPrice, country)}</span>}
                        </div>

                        <div className={styles.availRow}>
                            <span className={`${styles.availBadge} ${avail.cls}`}>
                                <span className={styles.dot} /> {avail.label}
                            </span>
                            <span className={styles.shippingNote}>○ {product.shippingNote}</span>
                        </div>

                        <hr className={styles.divider} />

                        {/* PRE-MADE OPTIONS: Sizes & Colors */}
                        {product.sizes.length > 0 && (
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label className={styles.optLabel}>Select Size: <span className={styles.optValue}>{selectedSize}</span></label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                                    {product.sizes.map((s: string) => (
                                        <button key={s} 
                                            onClick={() => setSelectedSize(s)}
                                            style={{
                                                padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid",
                                                borderColor: selectedSize === s ? "var(--primary)" : "var(--border)",
                                                background: selectedSize === s ? "var(--primary)" : "transparent",
                                                color: selectedSize === s ? "#fff" : "var(--secondary)",
                                                cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 200ms"
                                            }}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.colors.length > 0 && (
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label className={styles.optLabel}>Select Color: <span className={styles.optValue}>{selectedColor}</span></label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                                    {product.colors.map((c: string) => (
                                        <button key={c} 
                                            onClick={() => setSelectedColor(c)}
                                            style={{
                                                padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid",
                                                borderColor: selectedColor === c ? "var(--primary)" : "var(--border)",
                                                background: selectedColor === c ? "var(--primary)" : "transparent",
                                                color: selectedColor === c ? "#fff" : "var(--secondary)",
                                                cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 200ms"
                                            }}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DYNAMIC GENERIC OPTIONS */}
                        {product.options.map((opt: { title: string, values: string[] }) => (
                            <div key={opt.title} style={{ marginBottom: "1.5rem" }}>
                                <label className={styles.optLabel}>{opt.title}: <span className={styles.optValue}>{selectedOptions[opt.title]}</span></label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                                    {opt.values.map((v: string) => (
                                        <button key={v} 
                                            onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.title]: v }))}
                                            style={{
                                                padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid",
                                                borderColor: selectedOptions[opt.title] === v ? "var(--primary)" : "var(--border)",
                                                background: selectedOptions[opt.title] === v ? "var(--primary)" : "transparent",
                                                color: selectedOptions[opt.title] === v ? "#fff" : "var(--secondary)",
                                                cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 200ms"
                                            }}>
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* TAILORING OPTIONS: Only for Bespoke/Not Pre-made */}
                        {!product.isPremade && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {/* Fabric Type */}
                                {product.fabricTypes.length > 0 && (
                                    <div>
                                        <label className={styles.optLabel}>Fabric Selection: <span className={styles.optValue}>{fabricType}</span></label>
                                        <select className="formSelect" style={{ color: "black" }} value={fabricType} onChange={e => setFabricType(e.target.value)}>
                                            {product.fabricTypes.map((f: string) => <option key={f}>{f}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* Measurements */}
                                <div className={styles.twoCol}>
                                    <div>
                                        <label className={styles.optLabel}>Fabric Length (cm)</label>
                                        <input className="formInput" style={{ color: "black" }} type="number" placeholder="150" value={fabricLength} onChange={e => setFabricLength(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={styles.optLabel}>Neck Size (cm)</label>
                                        <input className="formInput" style={{ color: "black" }} type="number" placeholder="40" value={neckSize} onChange={e => setNeckSize(e.target.value)} />
                                    </div>
                                </div>

                                {/* Neckline Shapes */}
                                {product.necklineShapes.length > 0 && (
                                    <div>
                                        <button className={styles.optLabelBtn} onClick={() => setNecklineOpen(o => !o)}>
                                            Neckline Shape: <span className={styles.optValue}>{selectedNeckline}</span> {necklineOpen ? "▴" : "▾"}
                                        </button>
                                        {necklineOpen && (
                                            <div className={styles.necklineGrid}>
                                                {product.necklineShapes.map((ns: any) => (
                                                    <button key={ns.name}
                                                        className={`${styles.necklineOption} ${selectedNeckline === ns.name ? styles.selected : ""}`}
                                                        onClick={() => { setSelectedNeckline(ns.name); setNecklineOpen(false); }}>
                                                        {ns.image && <img src={ns.image} alt={ns.name} />}
                                                        <span>{ns.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Stitch */}
                                <div>
                                    <label className={styles.optLabel}>Tailoring / Stitching</label>
                                    <div className={styles.stitchRow}>
                                        {(["yes", "no"] as const).map(v => (
                                            <label key={v} className={`${styles.stitchLabel} ${stitch === v ? styles.stitchSelected : ""}`}>
                                                <input type="radio" name="stitch" value={v} checked={stitch === v} onChange={() => setStitch(v)} style={{ display: "none" }} />
                                                {v === "yes" ? `✂️ Bespoke (+${formatPrice(product.stitchPrice, country)})` : "No Stitching"}
                                            </label>
                                        ))}
                                    </div>
                                    {stitch === "yes" && (
                                        <div className={styles.stitchFields}>
                                            <div className={styles.stitchNote}>Tailoring service requested. Please provide measurements in <strong>cm</strong>.</div>
                                            {["Chest", "Waist", "Hips", "Shoulder Width", "Sleeve Length", "Total Length"].map(m => (
                                                <div key={m}>
                                                    <label className={styles.optLabel}>{m}</label>
                                                    <input className="formInput" type="number" placeholder="0.0"
                                                        value={tailorMeasurements[m] ?? ""}
                                                        onChange={e => setTailorMeasurements(p => ({ ...p, [m]: e.target.value }))} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Accessories */}
                        {product.accessories.length > 0 && (
                            <div style={{ marginTop: "1.5rem" }}>
                                <label className={styles.optLabel}>Signature Accessories</label>
                                <div className={styles.accessoriesRow}>
                                    {product.accessories.map((acc: any) => {
                                        const isSelected = selectedAccessories.includes(acc.name);
                                        return (
                                            <label key={acc.name} className={`${styles.accChip} ${isSelected ? styles.accSelected : ""}`}>
                                                <input type="checkbox" style={{ display: "none" }} checked={isSelected} onChange={() => toggleAccessory(acc.name)} />
                                                <span>{acc.name}</span>
                                                {acc.price > 0 && <span className={styles.accPrice}>+{formatPrice(acc.price, country)}</span>}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <hr className={styles.divider} />

                        {/* Qty + Total */}
                        <div className={styles.qtyTotalRow}>
                            <div>
                                <label className={styles.optLabel}>Quantity</label>
                                <div className={styles.qtyStepper}>
                                    <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                    <span className={styles.qtyNum}>{qty}</span>
                                    <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                                </div>
                            </div>
                            <div className={styles.totalBox}>
                                <div className={styles.totalLabel}>Subtotal</div>
                                <div className={styles.totalAmount}>{formatPrice(totalPrice, country)}</div>
                                {(stitchPrice > 0 || accessoriesPrice > 0) && (
                                    <div className={styles.totalBreakdown}>
                                        {formatPrice(product.price, country)} (Base)
                                        {stitchPrice > 0 && ` + ${formatPrice(stitchPrice, country)} (Stitch)`}
                                        {accessoriesPrice > 0 && ` + ${formatPrice(accessoriesPrice, country)} (Acc)`}
                                        {qty > 1 && ` × ${qty}`}
                                    </div>
                                )}
                                <div className={styles.totalNote}>Shipping & taxes at checkout</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.ctaRow}>
                            <button className="btn btnPrimary btnLg"
                                style={{ flex: 1, justifyContent: "center" }}
                                onClick={handleAddToCart}
                                disabled={product.availability === "out-of-stock"}>
                                💼 Add to Shopping Bag
                            </button>
                            <button className="btn btnOutline"
                                style={{ color: isWishlisted ? "var(--danger)" : "var(--secondary)", borderColor: isWishlisted ? "var(--danger)" : "var(--border)" }}
                                onClick={() => { toggleWishlist(product.id); toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist ♥"); }}>
                                {isWishlisted ? "♥" : "♡"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Description Tabs */}
                <div className={styles.descSection}>
                    <div className={styles.tabs}>
                        {(["desc", "details", "specs"] as const).map(t => (
                            <button key={t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ""}`} onClick={() => setActiveTab(t)}>
                                {t === "desc" ? "Story" : t === "details" ? "Craftsmanship" : "Specifications"}
                            </button>
                        ))}
                    </div>
                    {activeTab === "desc" && <p className={styles.descText}>{product.description}</p>}
                    {activeTab === "details" && <p className={styles.descText}>{product.details}</p>}
                    {activeTab === "specs" && (
                        <table className={styles.specTable}>
                            <tbody>
                                {product.specs.map((s: any) => (
                                    <tr key={s.label}>
                                        <td className={styles.specLabel}>{s.label}</td>
                                        <td>{s.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
