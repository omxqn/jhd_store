"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

type SortKey = "cheapest" | "expensive" | "selling" | "rating";

function normalizeProduct(p: any) {
    const safeJson = (v: any, fb: any) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return fb; } };
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
        sold: p.sold || 0,
        rating: p.rating || 0,
        stock: p.stock,
        shippingCost: parseFloat(p.shipping_cost) || 2,
        sizes: safeJson(p.sizes, []),
        colors: safeJson(p.colors, []),
        options: safeJson(p.options, []),
        isPremade: !!p.is_premade,
    };
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const rawName = (params.name as string) ?? "";
    const [sort, setSort] = useState<SortKey>("selling");
    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState<{ name: string; name_ar: string | null; image_url: string | null } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Fetch products for this category
        fetch(`/api/products?category=${encodeURIComponent(rawName)}`)
            .then(r => r.json())
            .then(d => {
                setProducts((d.products || []).map(normalizeProduct));
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch category details
        fetch("/api/categories")
            .then(r => r.json())
            .then(d => {
                const cats: any[] = d.categories || [];
                const found = cats.find(c => c.name.toLowerCase() === rawName.toLowerCase());
                if (found) setCategory(found);
            });
    }, [rawName]);

    const sortedProducts = [...products].sort((a, b) => {
        if (sort === "cheapest") return a.price - b.price;
        if (sort === "expensive") return b.price - a.price;
        if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
        return (b.sold || 0) - (a.sold || 0);
    });

    if (loading) return (
        <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading Collection...</p>
        </div>
    );

    if (products.length === 0) return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.noResults}
        >
            <div className={styles.noResultsIcon}>✨</div>
            <h2 className={styles.noResultsTitle}>Soon...</h2>
            <p className={styles.noResultsDesc}>We are currently curating the "{category?.name || rawName}" collection. Stay tuned!</p>
            <Link href="/" className={styles.backBtn}>← Back to Boutique</Link>
        </motion.div>
    );

    const sortLabels: [SortKey, string][] = [
        ["selling", "🔥 Popular"],
        ["cheapest", "💰 Low Price"],
        ["expensive", "📈 High Price"],
        ["rating", "⭐ Top Rated"]
    ];

    return (
        <div className={styles.page}>
            {/* HERO SECTION */}
            <section className={styles.heroSection}>
                {category?.image_url && (
                    <div className={styles.heroBg}>
                        <img src={category.image_url} alt="" />
                        <div className={styles.heroOverlay}></div>
                    </div>
                )}
                <div className={`container ${styles.heroContainer}`}>
                    <div className={styles.breadcrumb}>
                        <Link href="/">Home</Link>
                        <span className={styles.breadcrumbSep}>/</span>
                        <span className={styles.breadcrumbActive}>{category?.name || rawName}</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className={styles.title}>
                            {category?.name_ar || category?.name || rawName}
                            <span className={styles.titleAccent}> Collection</span>
                        </h1>
                        <p className={styles.countText}>{products.length} Items found in this collection</p>
                    </motion.div>
                </div>
            </section>

            <div className="container">
                {/* SORT & FILTERS */}
                <div className={styles.controlsRow}>
                    <div className={styles.sortPills}>
                        {sortLabels.map(([k, l]) => (
                            <button
                                key={k}
                                onClick={() => setSort(k)}
                                className={`${styles.sortPill} ${sort === k ? styles.active : ""}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRODUCT GRID */}
                <div className={styles.grid}>
                    <AnimatePresence mode="popLayout">
                        {sortedProducts.map((p, i) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    opacity: { duration: 0.4, delay: i * 0.05 },
                                    scale: { duration: 0.4, delay: i * 0.05 },
                                    layout: { duration: 0.4 }
                                }}
                            >
                                <ProductCard product={p} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
