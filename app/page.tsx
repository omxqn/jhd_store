"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import styles from "./page.module.css";

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

function PromotionalRow({ title, badge, filter }: { title: string; badge: string; filter: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

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
          <span className={styles.sectionBadge}>{badge}</span>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        <ProductCarousel>
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </ProductCarousel>
      </div>
    </section>
  );
}

function CategoryRow({ category }: { category: string }) {
  const [sort, setSort] = useState<SortKey>("selling");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
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
          <span className={styles.categoryBadge}>الأصناف</span>
          <h2 className={styles.categoryName}>{category}</h2>
        </div>
        <div className={styles.categoryRight}>
          <div className={styles.sortPills}>
            {([["selling", "🔥 الأكثر مبيعاً"], ["cheapest", "💰 الأقل سعراً"], ["expensive", "📈 الأعلى سعراً"], ["rating", "⭐ الأعلى تقييماً"]] as [SortKey, string][]).map(([k, l]) => (
              <button key={k} className={`${styles.sortPill} ${sort === k ? styles.active : ""}`} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
          <a href={`/category/${category.toLowerCase()}`} className={styles.viewAll}>مشاهدة الكل ←</a>
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
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [visualCategories, setVisualCategories] = useState<{ name: string; image_url: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => {
        const cats: any[] = d.categories || [];
        setVisualCategories(cats.filter((c: any) => c.image_url));
        setProductCategories(cats.map((c: any) => c.name));
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
            مرحباً بك في عالم جهاد!
          </motion.h1>
          <motion.p
            className={styles.welcomeBlue}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            من الرسم إلى التطريز، نبدع بشغف لنضع الإبداع في كل تصميم. نحرص على أن يحمل بصمتكم الخاصة، وأن يعكس جمال التفاصيل ودقة التنفيذ.
          </motion.p>
        </div>
      </motion.section>

      {/* ── SERVICES MARQUEE ── */}
      <section className={styles.marqueeSection}>
        <div className={styles.marqueeTrack}>
          {Array(4).fill([
            "تفصيل ثياب", "أرقى العبايات", "طرح احترافية",
            "هدايا وورد", "شوكولاتة", "سبح وكهرمان", "عطور فاخرة"
          ]).flat().map((item, i) => (
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
                <div className={styles.visualCategoryTitle}>{c.name}</div>
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
            <span className={styles.indicatorArrow}>←</span>
            <span>اسحب بالتمرير</span>
            <span className={styles.indicatorArrow}>→</span>
          </motion.div>
        </div>
      </section>

      {/* ── PROMOTIONAL ROWS ── */}
      <PromotionalRow title="عرض خاص" badge="إصدار محدود" filter="limited" />
      <PromotionalRow title="الاحدث" badge="وصلنا حديثاً" filter="new" />
      <PromotionalRow title="الأكثر مبيعاً" badge="مختاراتنا" filter="featured" />
      <PromotionalRow title="تخفيضات" badge="وفر الآن" filter="discounted" />

      {/* ── CATEGORIES ── */}
      <div className="container">
        {productCategories.map(cat => (
          <CategoryRow key={cat} category={cat} />
        ))}
      </div>
    </div>
  );
}
