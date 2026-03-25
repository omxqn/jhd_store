"use client";
import Link from "next/link";
import { PRODUCTS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import styles from "./page.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function WishlistPage() {
    const { wishlist } = useStore();
    const { lang, t, isRTL } = useLanguage();
    const wishlisted = PRODUCTS.filter(p => wishlist.includes(p.id));

    if (wishlisted.length === 0) return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>♥</div>
                    <h2 className={styles.emptyTitle}>{lang === 'ar' ? "مساحة منسقة" : "A Curated Space"}</h2>
                    <p className={styles.emptyText}>
                        {lang === 'ar' ? "قائمة رغباتك فارغة حالياً. قومي بتنسيق قطعك المفضلة بالضغط على أيقونة القلب في أي منتج." : "Your wishlist is currently empty. Curate your desired items by pressing the heart icon on any product."}
                    </p>
                    <Link href="/" className="btn btnPrimary btnLg">{lang === 'ar' ? "استكشاف التشكيلات ○" : "Explore Curations ○"}</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {lang === 'ar' ? "قائمة " : "My "} <span>{lang === 'ar' ? "رغباتي" : "Wishlist"}</span>
                    </h1>
                    <span className={styles.count}>{wishlisted.length} {lang === 'ar' ? "قطع منسقة" : "curated items"}</span>
                </div>
                <div className={styles.grid}>
                    {wishlisted.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </div>
        </div>
    );
}
