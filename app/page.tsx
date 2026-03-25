"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import styles from "./page.module.css";
import { useLanguage } from "@/context/LanguageContext";

type SortKey = "cheapest" | "expensive" | "selling" | "rating";

function normalizeProduct(p: any) {
  const safeJson = (v: any, fb: any) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return fb; } };
  return {
    id: String(p.id), name: p.name, category: p.category,
    price: parseFloat(p.price) || 0,
    oldPrice: p.old_price ? parseFloat(p.old_price) : null,
    stitchPrice: parseFloat(p.stitch_price) || 0,
    availability: p.availability || "available",
    shippingNote: p.shipping_note || "",
    description: p.description || "", details: p.details || "",
    images: safeJson(p.images, [p.images].filter(Boolean)),
    fabricTypes: safeJson(p.fabric_types, []),
    necklineShapes: safeJson(p.neckline_shapes, []).map((n: any) => typeof n === "string" ? { name: n, image: "" } : n),
    accessories: safeJson(p.accessories, [{ name: "None", price: 0 }]),
    specs: safeJson(p.specs, []), badges: safeJson(p.badges, []),
    mostSelling: !!p.most_selling, sold: p.sold || 0, rating: p.rating || 0, stock: p.stock,
    shippingCost: parseFloat(p.shipping_cost) || 2,
    sizes: safeJson(p.sizes, []),
    colors: safeJson(p.colors, []),
    options: safeJson(p.options, []),
    isPremade: !!p.is_premade,
  };
}

function ProductCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseUp = () => setIsDragging(false);
  const onMouseLeave = () => setIsDragging(false);

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className={styles.scrollWrapper}>
      <button className={`${styles.scrollArrow} ${styles.left}`} onClick={() => scroll("left")}>‹</button>
      <div
        className={`${styles.scrollRow} ${isDragging ? styles.grabbing : ""}`}
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
      >
        {children}
      </div>
      <button className={`${styles.scrollArrow} ${styles.right}`} onClick={() => scroll("right")}>›</button>
    </div>
  );
}

function PromotionalRow({ titleKey, badgeKey, filter }: { titleKey: string; badgeKey: string; filter: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetch(`/api/products?${filter}=1`)
      .then(r => r.json())
      .then(d => {
        setProducts((d.products || []).map(normalizeProduct));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [filter]);

  if (!loaded || products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>{t(badgeKey)}</span>
          <h2 className={styles.sectionTitle}>{t(titleKey)}</h2>
        </div>
        <ProductCarousel>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </ProductCarousel>
      </div>
    </section>
  );
}

function CategoryRow({ category }: { category: any }) {
  const [sort, setSort] = useState<SortKey>("selling");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { lang, t, isRTL } = useLanguage();

  useEffect(() => {
    fetch(`/api/products?category=${encodeURIComponent(category.name)}`)
      .then(r => r.json())
      .then(d => {
        setAllProducts((d.products || []).map(normalizeProduct));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [category]);

  const sortedProducts = [...allProducts].sort((a, b) => {
    if (sort === "cheapest") return a.price - b.price;
    if (sort === "expensive") return b.price - a.price;
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    return (b.sold || 0) - (a.sold || 0);
  });

  if (!loaded || sortedProducts.length === 0) return null;

  return (
    <section className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryLeft}>
          <span className={styles.categoryBadge}>{t('nav.categories')}</span>
          <h2 className={styles.categoryName}>{lang === 'ar' ? category.name_ar || category.name : category.name}</h2>
        </div>
        <div className={styles.categoryRight}>
          <div className={styles.sortPills}>
            {([[ "selling", `🔥 ${t('nav.most_selling')}`], ["cheapest", "💰 Low Price"], ["expensive", "📈 High Price"], ["rating", "⭐ Top Rated"]] as [SortKey, string][]).map(([k, l]) => (
              <button key={k} className={`${styles.sortPill} ${sort === k ? styles.active : ""}`} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
          <a href={`/category/${category.name.toLowerCase()}`} className={styles.viewAll}>{t('common.view_all')} {isRTL ? "←" : "→"}</a>
        </div>
      </div>
      <ProductCarousel>
        {sortedProducts.map((p) => (
          <div key={p.id}>
            <ProductCard product={p} />
          </div>
        ))}
      </ProductCarousel>
    </section>
  );
}


export default function HomePage() {
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [visualCategories, setVisualCategories] = useState<{ name: string; name_ar?: string; image_url: string }[]>([]);
  const { lang, t, isRTL } = useLanguage();

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => {
        const cats: any[] = d.categories || [];
        setVisualCategories(cats.filter((c: any) => c.image_url));
        setProductCategories(cats);
      })
      .catch(() => { });
  }, []);

  return (
    <div className={styles.page}>
      {/* ── JHD.LINE WELCOME HEADER ── */}
      <motion.section
        className={styles.welcomeSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className={`container ${styles.welcomeContainer}`}>
          <motion.h1
            className={styles.welcomeRed}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t('home.welcome_title')}
          </motion.h1>
          <motion.p
            className={styles.welcomeBlue}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            {t('home.welcome_desc')}
          </motion.p>
        </div>
      </motion.section>

      {/* ── SERVICES MARQUEE ── */}
      <section className={styles.marqueeSection}>
        <div className={styles.marqueeTrack}>
          {Array(4).fill(t('home.marquee')).flat().map((item: any, i: number) => (
            <div key={i} className={styles.marqueeItem}>
              {item}
              <span className={styles.marqueeDot}></span>
            </div>
          ))}
        </div>
      </section>

      {/* ── VISUAL CATEGORIES ── */}
      <section className={styles.visualCategoriesSection}>
        <div className="container" style={{ position: 'relative' }}>
          <div className={styles.visualCategories}>
            {visualCategories.map((c, i) => (
              <motion.a
                key={c.name}
                href={`/category/${encodeURIComponent(c.name)}`}
                className={styles.visualCategoryCard}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -10 }}
              >
                <div className={styles.visualCategoryImgWrap}>
                  <img src={c.image_url} alt={c.name} className={styles.visualCategoryImg} />
                </div>
                <div className={styles.visualCategoryTitle}>{lang === 'ar' ? c.name_ar || c.name : c.name}</div>
              </motion.a>
            ))}
          </div>
          <motion.div
            className={styles.scrollIndicator}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            <span className={styles.indicatorArrow}>{isRTL ? "→" : "←"}</span>
            <span>{t('home.scroll_to_explore')}</span>
            <span className={styles.indicatorArrow}>{isRTL ? "←" : "→"}</span>
          </motion.div>
        </div>
      </section>

      {/* ── PROMOTIONAL ROWS ── */}
      <PromotionalRow titleKey="home.featured" badgeKey="product.trending" filter="limited" />
      <PromotionalRow titleKey="nav.new_arrivals" badgeKey="nav.new_arrivals" filter="new" />
      <PromotionalRow titleKey="nav.most_selling" badgeKey="home.our_picks" filter="featured" />
      <PromotionalRow titleKey="home.trending" badgeKey="home.hero_title" filter="discounted" />

      {/* ── CATEGORIES ── */}
      <div className="container">
        {productCategories.map(cat => (
          <CategoryRow key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
