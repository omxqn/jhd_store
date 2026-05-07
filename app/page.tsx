"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice, useStore } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import styles from "./page.module.css";

type HomeCategory = {
  id: string | number;
  name: string;
  name_ar?: string;
  image_url?: string | null;
};

type SortKey = "selling" | "cheapest" | "expensive";

type HomeProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  images: string[];
  badges: string[];
  sold: number;
  rating: number;
  shippingCost: number;
  sizes: string[];
  colors: string[];
  options: Array<{ title: string; values: string[] }>;
  isPremade: boolean;
};

function safeJson<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value !== "string") return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeProduct(product: any): HomeProduct {
  return {
    id: String(product.id),
    name: product.name,
    category: product.category,
    price: Number(product.price) || 0,
    oldPrice: product.old_price ? Number(product.old_price) : null,
    images: safeJson<string[]>(product.images, [product.images].filter(Boolean)),
    badges: safeJson<string[]>(product.badges, []),
    sold: Number(product.sold) || 0,
    rating: Number(product.rating) || 0,
    shippingCost: Number(product.shipping_cost) || 2,
    sizes: safeJson<string[]>(product.sizes, []),
    colors: safeJson<string[]>(product.colors, []),
    options: safeJson<Array<{ title: string; values: string[] }>>(product.options, []),
    isPremade: Boolean(product.is_premade),
  };
}

function GarlandDivider() {
  return (
    <div className={styles.garlandWrap}>
      <img src="/heart-garland.png" alt="" aria-hidden="true" className={styles.garland} />
    </div>
  );
}

function HomeRail({
  children,
  isRTL,
  variant = "carousel",
}: {
  children: ReactNode;
  isRTL: boolean;
  variant?: "carousel" | "collections";
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "prev" | "next") => {
    if (!railRef.current) return;
    const amount = railRef.current.clientWidth * 0.8;
    const delta = direction === "next" ? amount : -amount;
    railRef.current.scrollBy({
      left: isRTL ? -delta : delta,
      behavior: "smooth",
    });
  };

  return (
    <div className={`${styles.railShell} ${variant === "collections" ? styles.railShellCollections : styles.railShellCarousel}`}>
      <button
        type="button"
        className={`${styles.railButton} ${styles.railButtonPrev} ${variant === "collections" ? styles.railButtonCollections : ""}`}
        onClick={() => scroll("prev")}
        aria-label="Previous"
      >
        {isRTL ? "\u203a" : "\u2039"}
      </button>
      <div
        ref={railRef}
        className={`${styles.railTrack} ${variant === "collections" ? styles.railTrackCollections : styles.railTrackCarousel}`}
      >
        {children}
      </div>
      <button
        type="button"
        className={`${styles.railButton} ${styles.railButtonNext} ${variant === "collections" ? styles.railButtonCollections : ""}`}
        onClick={() => scroll("next")}
        aria-label="Next"
      >
        {isRTL ? "\u2039" : "\u203a"}
      </button>
    </div>
  );
}

function CollectionCard({
  category,
  label,
}: {
  category: HomeCategory;
  label: string;
}) {
  const imageSrc = category.image_url || "/heart-logo.png";
  const isFallback = !category.image_url;

  return (
    <Link href={`/category/${encodeURIComponent(category.name)}`} className={styles.collectionCard}>
      <div className={styles.collectionCircle}>
        <img
          src={imageSrc}
          alt={label}
          className={`${styles.collectionImage} ${isFallback ? styles.collectionImageFallback : ""}`}
        />
      </div>
      <span className={styles.collectionLabel}>{label}</span>
    </Link>
  );
}

function HomeProductCard({ product }: { product: HomeProduct }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const { country, wishlist, toggleWishlist, addToCart } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  const badgeLabel = product.oldPrice || product.badges.includes("sale")
    ? lang === "ar" ? "خصم" : "Sale"
    : product.badges.includes("new")
      ? lang === "ar" ? "جديد" : "New"
      : null;

  const needsSelection =
    !product.isPremade ||
    product.options.length > 0 ||
    product.sizes.length > 0 ||
    product.colors.length > 0;

  const handleWishlist = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product.id);
    toast(isWishlisted ? (lang === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist") : (lang === "ar" ? "تمت الإضافة إلى المفضلة" : "Added to wishlist"));
  };

  const handleAddToCart = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (needsSelection) {
      toast(lang === "ar" ? "اختاري التفاصيل من صفحة المنتج" : "Choose product options on the product page");
      router.push(`/product/${product.id}`);
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      fabricType: "Default",
      neckline: "Default",
      stitch: false,
      stitchPrice: 0,
      accessories: ["None"],
      image: product.images[0] || "/heart-logo.png",
      shippingCost: product.shippingCost,
    });
    toast.success(lang === "ar" ? "تمت إضافة المنتج إلى السلة" : "Added to cart");
  };

  return (
    <article className={styles.productCard}>
      <Link href={`/product/${product.id}`} className={styles.productCardLink}>
        <div className={styles.productMedia}>
          {badgeLabel ? <span className={styles.productBadge}>{badgeLabel}</span> : null}
          <button
            type="button"
            className={`${styles.productHeart} ${isWishlisted ? styles.productHeartActive : ""}`}
            onClick={handleWishlist}
            aria-label="Wishlist"
          >
            <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <img
            src={product.images[0] || "/heart-logo.png"}
            alt={product.name}
            className={styles.productImage}
          />
        </div>

        <div className={styles.productActions}>
          <button type="button" className={styles.productActionButton} onClick={handleAddToCart} aria-label="Add to cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-11z" />
              <path d="M6 6 5 3H2" />
              <circle cx="9" cy="20" r="1.25" />
              <circle cx="18" cy="20" r="1.25" />
            </svg>
          </button>
          <span className={styles.productActionsDivider} />
          <span className={styles.productActionButton} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </span>
        </div>

        <div className={styles.productMeta}>
          <h3 className={styles.productName}>{product.name}</h3>
          <div className={styles.productPriceRow}>
            <span className={styles.productPrice}>{formatPrice(product.price, country)}</span>
            {product.oldPrice ? (
              <span className={styles.productOldPrice}>{formatPrice(product.oldPrice, country)}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

function ProductShowcase({
  title,
  products,
  sectionId,
  isRTL,
}: {
  title: string;
  products: HomeProduct[];
  sectionId: string;
  isRTL: boolean;
}) {
  const { lang } = useLanguage();
  const [sort, setSort] = useState<SortKey>("selling");

  if (products.length === 0) return null;

  const sortedProducts = [...products].sort((left, right) => {
    if (sort === "cheapest") return left.price - right.price;
    if (sort === "expensive") return right.price - left.price;
    return right.sold - left.sold || right.rating - left.rating;
  });

  const sortOptions = [
    { key: "selling" as SortKey, labelAr: "الأكثر مبيعاً", labelEn: "Most Selling" },
    { key: "cheapest" as SortKey, labelAr: "الأرخص", labelEn: "Lowest Price" },
    { key: "expensive" as SortKey, labelAr: "الأعلى سعراً", labelEn: "Highest Price" },
  ];

  return (
    <section className={styles.productsSection} id={sectionId}>
      <div className={styles.sectionPanel}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <div className={styles.sectionMeta}>
            <span className={styles.sectionCount}>
              {products.length} {lang === "ar" ? "منتجات" : "Products"}
            </span>
            <span className={styles.sectionNote}>
              {lang === "ar" ? "مرري يمينًا ويسارًا لاكتشاف المزيد" : "Scroll left and right to discover more"}
            </span>
          </div>
          <div className={styles.filterRow}>
            {sortOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`${styles.filterPill} ${sort === option.key ? styles.filterPillActive : ""}`}
                onClick={() => setSort(option.key)}
              >
                {isRTL ? option.labelAr : option.labelEn}
              </button>
            ))}
          </div>
        </div>

        <HomeRail isRTL={isRTL} variant="carousel">
          {sortedProducts.map((product) => (
            <HomeProductCard key={`${sectionId}-${product.id}`} product={product} />
          ))}
        </HomeRail>
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [collections, setCollections] = useState<HomeCategory[]>([]);
  const [productSections, setProductSections] = useState<Array<{
    id: string;
    titleAr: string;
    titleEn: string;
    products: HomeProduct[];
  }>>([]);
  const [categorySections, setCategorySections] = useState<Array<{
    id: string;
    label: string;
    labelAr?: string;
    products: HomeProduct[];
  }>>([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HomeProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, t, isRTL } = useLanguage();
  const { country, setCountry, cart, wishlist, authUser, clearAuth } = useStore();

  useEffect(() => {
    let active = true;

    async function loadHomepage() {
      try {
        const [categoriesRes, featuredRes, limitedRes, discountedRes, allProductsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products?featured=1"),
          fetch("/api/products?limited=1"),
          fetch("/api/products?discounted=1"),
          fetch("/api/products?sort=selling"),
        ]);

        const categoriesData = await categoriesRes.json();
        const featuredData = await featuredRes.json();
        const limitedData = await limitedRes.json();
        const discountedData = await discountedRes.json();
        const allProductsData = await allProductsRes.json();

        if (!active) return;

        const categories = (categoriesData.categories || []) as HomeCategory[];
        const imageFirst = categories.filter((item) => item.image_url);
        const fallback = categories.filter((item) => !item.image_url);
        const orderedCategories = [...imageFirst, ...fallback];
        setCollections(orderedCategories);

        const featuredProducts: HomeProduct[] = (featuredData.products || []).map(normalizeProduct).slice(0, 6);
        const limitedProducts: HomeProduct[] = (limitedData.products || []).map(normalizeProduct).slice(0, 6);
        const discountedProducts: HomeProduct[] = (discountedData.products || []).map(normalizeProduct).slice(0, 6);
        const allProducts: HomeProduct[] = (allProductsData.products || []).map(normalizeProduct);

        setProductSections([
          {
            id: "most-selling",
            titleAr: "الأكثر مبيعاً",
            titleEn: "Most Selling",
            products: featuredProducts,
          },
          {
            id: "limited",
            titleAr: "قطع محدودة",
            titleEn: "Limited",
            products: limitedProducts,
          },
          {
            id: "on-sale",
            titleAr: "عروض خاصة",
            titleEn: "On Sale",
            products: discountedProducts,
          },
        ].filter((section) => section.products.length > 0));

        setCategorySections(
          orderedCategories
            .map((category) => ({
              id: String(category.id),
              label: category.name,
              labelAr: category.name_ar,
              products: allProducts.filter((product) => product.category === category.name).slice(0, 6),
            }))
            .filter((section) => section.products.length > 0)
        );
      } catch {
        if (!active) return;
        setCollections([]);
        setProductSections([]);
        setCategorySections([]);
      }
    }

    loadHomepage();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
      if (countryMenuRef.current && !countryMenuRef.current.contains(target)) {
        setCountryOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setCountryOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults((data.products || []).map(normalizeProduct).slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const collectionTitle = lang === "ar" ? "مجموعات مختارة" : t("home.featured");
  const ctaLabel = lang === "ar" ? "تعرف على المزيد" : "Learn More";
  const promoCopy = lang === "ar" ? "كود خصم ترحيبي لأول طلب" : "Welcome discount code for your first order";
  const aboutLabel = lang === "ar" ? "عن جهاد" : "About Jihad";
  const subscribeTitle = lang === "ar" ? "النشرة البريدية" : "Newsletter";
  const subscribeCopy = lang === "ar" ? "اشترك لتصلك أحدث العروض" : "Subscribe for the latest offers";
  const registryLabel = lang === "ar" ? "السجل التجاري" : "Commercial Registry";
  const rightsCopy = lang === "ar" ? "الحقوق محفوظة | جهاد لاين 2026" : "All rights reserved | JHD.LINE 2026";
  const searchPlaceholder = lang === "ar" ? "ابحث عن منتج" : "Search products";
  const footerBrandTitle = lang === "ar" ? "جهاد لاين" : "JHD.LINE";
  const footerBrandCopy = lang === "ar"
    ? "تصاميم خليجية أنيقة تجمع بين الحرفة، اللمسة المعاصرة، والعناية الدقيقة بكل تفصيل من الطلب حتى التسليم."
    : "Elegant GCC fashion shaped with careful craftsmanship, modern taste, and attention to every detail from order to delivery.";
  const footerShopTitle = lang === "ar" ? "التسوق" : "Shop";
  const footerSupportTitle = lang === "ar" ? "الدعم" : "Support";
  const footerTrustTitle = lang === "ar" ? "مزايا المتجر" : "Store Highlights";
  const footerNewsletterTitle = lang === "ar" ? "ابق على تواصل" : "Stay Connected";
  const footerNewsletterCopy = lang === "ar"
    ? "اشترك للحصول على العروض الجديدة، المجموعات المحدودة، والتنبيهات الخاصة قبل الجميع."
    : "Subscribe for new offers, limited collections, and special updates before everyone else.";
  const footerShopLinks = [
    { href: "#collections", label: lang === "ar" ? "الأقسام" : "Collections" },
    { href: "#most-selling", label: lang === "ar" ? "الأكثر مبيعًا" : "Most Selling" },
    { href: "#limited", label: lang === "ar" ? "قطع محدودة" : "Limited Pieces" },
    { href: "#on-sale", label: lang === "ar" ? "العروض" : "On Sale" },
  ];
  const footerSupportLinks = [
    { href: "/policy", label: lang === "ar" ? "سياسة الطلب" : "Order Policy" },
    { href: "/contact", label: lang === "ar" ? "تواصل معنا" : "Contact Us" },
    { href: "/login", label: lang === "ar" ? "الحساب والدخول" : "Account Access" },
    { href: "/cart", label: lang === "ar" ? "السلة" : "Cart" },
  ];
  const footerTrustItems = [
    lang === "ar" ? "شحن إلى دول الخليج" : "GCC shipping available",
    lang === "ar" ? "خيارات تفصيل حسب الطلب" : "Tailoring on request",
    lang === "ar" ? "خدمة عملاء سريعة" : "Fast customer support",
  ];
  const footerSocialLinks = [
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "WhatsApp", href: "#" },
  ];
  const quickLinks = [
    { href: "#collections", label: lang === "ar" ? "الأقسام" : "Collections" },
    ...productSections.map((section) => ({
      href: `#${section.id}`,
      label: lang === "ar" ? section.titleAr : section.titleEn,
    })),
    { href: "#newsletter", label: lang === "ar" ? "النشرة البريدية" : "Newsletter" },
  ];

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success(lang === "ar" ? "تم تسجيل اهتمامك" : "Thanks for subscribing");
  };

  const handleProfileLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network/logout sync errors and clear local auth state anyway.
    }
    clearAuth();
    setProfileMenuOpen(false);
    toast.success(lang === "ar" ? "تم تسجيل الخروج" : "Signed out");
    router.push("/");
  };

  const guestPrimaryLabel = lang === "ar" ? "الدخول / التسجيل" : "Login / Register";
  const guestSecondaryLabel = lang === "ar" ? "إنشاء حساب" : "Create Account";
  const notificationsLabel = lang === "ar" ? "التنبيهات" : "Notifications";
  const ordersLabel = lang === "ar" ? "طلباتي" : "My Orders";
  const wishlistLabel = lang === "ar" ? "المفضلة" : "Wishlist";
  const supportLabel = lang === "ar" ? "تذاكر الدعم" : "Support Tickets";
  const logoutLabel = lang === "ar" ? "تسجيل الخروج" : "Sign Out";
  const guestName = lang === "ar" ? "مستخدم ضيف" : "Guest User";
  const guestWelcome = lang === "ar" ? "مرحباً بك في متجر جهاد" : "Welcome to Jihad Store";
  const accountGroupLabel = lang === "ar" ? "حسابي" : "My Account";
  const dashboardLabel = lang === "ar" ? "لوحة الحساب" : "Account Dashboard";

  return (
    <div className={styles.page}>
      <div className={styles.topBanner}>
        <span className={styles.topBannerDot} />
        <span className={styles.topBannerText}>{promoCopy}</span>
        <span className={styles.topBannerCode}>Welcome10</span>
        <span className={styles.topBannerDot} />
      </div>

      <header className={styles.header}>
        <div className={styles.headerActions}>
          <div className={styles.searchWrapper} ref={searchRef}>
            <button
              type="button"
              className={`${styles.iconButton} ${searchOpen ? styles.iconButtonActive : ""}`}
              aria-label="Search"
              onClick={() => {
                setSearchOpen((open) => !open);
                setProfileMenuOpen(false);
                setCountryOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {searchOpen ? (
              <div className={styles.searchDropdown}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  autoFocus
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <div className={styles.searchResults}>
                  {searchLoading ? (
                    <div className={styles.searchState}>{lang === "ar" ? "جاري البحث..." : "Searching..."}</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className={styles.searchResultLink}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <img
                          src={product.images[0] || "/heart-logo.png"}
                          alt={product.name}
                          className={styles.searchThumb}
                        />
                        <div className={styles.searchMeta}>
                          <span className={styles.searchItemName}>{product.name}</span>
                          <span className={styles.searchItemPrice}>{formatPrice(product.price, country)}</span>
                        </div>
                      </Link>
                    ))
                  ) : searchQuery.trim() ? (
                    <div className={styles.searchState}>{lang === "ar" ? "لا توجد نتائج" : "No results found"}</div>
                  ) : (
                    <div className={styles.searchState}>{lang === "ar" ? "ابدأ بالكتابة للبحث" : "Start typing to search"}</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.countryPicker} ref={countryMenuRef}>
            <button
              type="button"
              className={`${styles.iconButton} ${countryOpen ? styles.iconButtonActive : ""}`}
              aria-label="Country"
              onClick={() => {
                setCountryOpen((open) => !open);
                setProfileMenuOpen(false);
                setSearchOpen(false);
              }}
            >
              <span className={styles.flag}>{country.flag}</span>
            </button>

            {countryOpen ? (
              <div className={styles.countryDropdown}>
                {COUNTRIES.map((item) => (
                  <div key={item.code} className={styles.countryRow}>
                    <button
                      type="button"
                      className={`${styles.countryOption} ${country.code === item.code ? styles.countryOptionActive : ""}`}
                      onClick={() => {
                        setCountry(item);
                        setLang("ar");
                        setCountryOpen(false);
                      }}
                    >
                      <span className={styles.flag}>{item.flag}</span>
                      <span className={styles.optName}>{item.name}</span>
                    </button>

                    <div className={styles.countryLangs}>
                      <button
                        type="button"
                        className={`${styles.countryLangButton} ${country.code === item.code && lang === "ar" ? styles.countryLangButtonActive : ""}`}
                        onClick={() => {
                          setCountry(item);
                          setLang("ar");
                          setCountryOpen(false);
                        }}
                      >
                        عر
                      </button>
                      <button
                        type="button"
                        className={`${styles.countryLangButton} ${country.code === item.code && lang === "en" ? styles.countryLangButtonActive : ""}`}
                        onClick={() => {
                          setCountry(item);
                          setLang("en");
                          setCountryOpen(false);
                        }}
                      >
                        EN
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Link href="/myaccount/wishlist" className={styles.iconButton} aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill={wishlist.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlist.length > 0 ? <span className={styles.iconBadge}>{wishlist.length}</span> : null}
          </Link>

          <Link href="/cart" className={styles.iconButton} aria-label="Cart">
            <span className={styles.iconEmoji} aria-hidden="true">💼</span>
            {cartCount > 0 ? <span className={styles.iconBadge}>{cartCount}</span> : null}
          </Link>

          <div className={styles.profileMenuWrap} ref={profileMenuRef}>
            <button
              type="button"
              className={`${styles.iconButton} ${profileMenuOpen ? styles.iconButtonActive : ""}`}
              aria-label="Account"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
              onClick={() => {
                setProfileMenuOpen((open) => !open);
                setCountryOpen(false);
                setSearchOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {profileMenuOpen ? (
              <div className={styles.profileMenuPopup} role="menu">
                <div className={styles.profileMenuHeader}>
                  <div className={styles.profileMenuAvatar}>
                    {(authUser?.name?.trim()?.charAt(0) || "G").toUpperCase()}
                  </div>
                  <div className={styles.profileMenuMeta}>
                    <strong className={styles.profileMenuName}>{authUser?.name || guestName}</strong>
                    <span className={styles.profileMenuHint}>{authUser?.email || guestWelcome}</span>
                  </div>
                </div>

                <div className={styles.profileMenuBody}>
                  <div className={styles.profileMenuGroup}>
                    <div className={styles.profileMenuGroupLabel}>{accountGroupLabel}</div>
                    <nav className={styles.profileMenuNav}>
                      <Link href="/myaccount/notifications" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                        <span className={styles.profileMenuIcon}>🔔</span>
                        <span>{notificationsLabel}</span>
                      </Link>
                      <Link href="/myaccount/my-orders" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                        <span className={styles.profileMenuIcon}>📦</span>
                        <span>{ordersLabel}</span>
                      </Link>
                      <Link href="/myaccount/wishlist" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                        <span className={styles.profileMenuIcon}>❤️</span>
                        <span>{wishlistLabel}</span>
                      </Link>
                      <Link href="/myaccount/support" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                        <span className={styles.profileMenuIcon}>💬</span>
                        <span>{supportLabel}</span>
                      </Link>
                      {authUser ? (
                        <button type="button" className={styles.profileMenuButton} onClick={handleProfileLogout}>
                          <span className={styles.profileMenuIcon}>↩</span>
                          <span>{logoutLabel}</span>
                        </button>
                      ) : null}
                    </nav>
                  </div>
                </div>

                <div className={styles.profileMenuFooter}>
                  <Link
                    href={authUser ? "/myaccount" : "/login"}
                    className={styles.profileMenuFooterButton}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    {authUser ? dashboardLabel : guestPrimaryLabel}
                  </Link>
                  {!authUser ? (
                    <Link
                      href="/signup"
                      className={styles.profileMenuFooterSecondary}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      {guestSecondaryLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <Link href="/" className={styles.brand}>
          <img src="/heart-logo.png" alt="JHD.LINE" className={styles.brandLogo} />
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>
            {t("nav.home")}
          </Link>
          <Link href="/policy" className={styles.navLink}>
            {t("nav.policy")}
          </Link>
          <Link href="/contact" className={`${styles.navLink} ${styles.navLinkAccent}`}>
            {t("nav.contact")}
          </Link>
          <Link href="#about" className={styles.navLink}>
            {aboutLabel}
          </Link>
        </nav>
      </header>

      <section className={styles.heroSection} id="about">
        <div className={styles.heroStage}>
          <img src="/hero-bell.png" alt="" aria-hidden="true" className={`${styles.heroLamp} ${styles.heroLampLeft}`} />
          <img src="/hero-bell.png" alt="" aria-hidden="true" className={`${styles.heroLamp} ${styles.heroLampRight}`} />
          <img src="/hero-heart.png" alt="" aria-hidden="true" className={styles.heroHeart} />
          <div className={styles.heroStamps} aria-hidden="true">
            <img src="/heart-logo.png" alt="" className={`${styles.heroStamp} ${styles.heroStampPrimary}`} />
            <img src="/footer-heart-symbol.png" alt="" className={`${styles.heroStamp} ${styles.heroStampSecondary}`} />
            <img src="/hero-heart.png" alt="" className={`${styles.heroStamp} ${styles.heroStampTertiary}`} />
          </div>

          <div className={styles.heroContent}>
            {lang === "ar" ? (
              <img src="/hero-title.png" alt={t("home.welcome_title")} className={styles.heroTitleGraphic} />
            ) : (
              <h1 className={styles.heroTitle}>{t("home.welcome_title")}</h1>
            )}
            <p className={styles.heroCopy}>{t("home.welcome_desc")}</p>
            <Link href="#collections" className={styles.heroButton}>
              {ctaLabel}
            </Link>
          </div>

          <div className={styles.heroThreads} />
        </div>
      </section>

      <nav className={styles.quickNav} aria-label={lang === "ar" ? "تنقل سريع" : "Quick navigation"}>
        <img src="/heart-logo.png" alt="" aria-hidden="true" className={styles.quickNavStamp} />
        <span className={styles.quickNavLabel}>{lang === "ar" ? "تنقل سريع" : "Quick Navigation"}</span>
        <div className={styles.quickNavLinks}>
          {quickLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.quickNavLink}>
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <section className={styles.collectionsSection} id="collections">
        <div className={`${styles.sectionPanel} ${styles.sectionPanelCollections}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{collectionTitle}</h2>
            <div className={styles.sectionMeta}>
              <span className={styles.sectionCount}>
                {collections.length} {lang === "ar" ? "أقسام" : "Collections"}
              </span>
              <span className={styles.sectionNote}>
                {lang === "ar" ? "تنظيم واضح للوصول السريع" : "Clear organization for faster browsing"}
              </span>
            </div>
          </div>

          <HomeRail isRTL={isRTL} variant="collections">
            {collections.map((category) => (
              <CollectionCard
                key={category.id}
                category={category}
                label={lang === "ar" ? category.name_ar || category.name : category.name}
              />
            ))}
          </HomeRail>
        </div>
      </section>

      {productSections.map((section, index) => (
        <div key={section.id}>
          <GarlandDivider />
          <ProductShowcase
            title={lang === "ar" ? section.titleAr : section.titleEn}
            products={section.products}
            sectionId={section.id}
            isRTL={isRTL}
          />
          {index === productSections.length - 1 && categorySections.length === 0 ? <GarlandDivider /> : null}
        </div>
      ))}

      {categorySections.map((section, index) => (
        <div key={`category-${section.id}`}>
          <GarlandDivider />
          <ProductShowcase
            title={lang === "ar" ? section.labelAr || section.label : section.label}
            products={section.products}
            sectionId={`category-${section.id}`}
            isRTL={isRTL}
          />
          {index === categorySections.length - 1 ? <GarlandDivider /> : null}
        </div>
      ))}

      <footer className={styles.footer} id="newsletter">
        <img src="/footer-top-decor.png" alt="" aria-hidden="true" className={`${styles.footerDecor} ${styles.footerDecorLeft}`} />
        <img src="/footer-top-decor.png" alt="" aria-hidden="true" className={`${styles.footerDecor} ${styles.footerDecorRight}`} />
        <div className={styles.footerStamps} aria-hidden="true">
          <img src="/heart-logo.png" alt="" className={`${styles.footerStamp} ${styles.footerStampLeft}`} />
          <img src="/footer-heart-symbol.png" alt="" className={`${styles.footerStamp} ${styles.footerStampRight}`} />
        </div>

        <div className={styles.footerStage}>
          <div className={styles.footerHero}>
            <div className={styles.footerBrandHeader}>
              <img src="/heart-logo.png" alt="JHD.LINE" className={styles.footerBrandLogo} />
              <div className={styles.footerBrandMeta}>
                <span className={styles.footerEyebrow}>{aboutLabel}</span>
                <h3 className={styles.footerBrandTitle}>{footerBrandTitle}</h3>
              </div>
            </div>
            <p className={styles.footerText}>{footerBrandCopy}</p>
            <div className={styles.footerSocials}>
              {footerSocialLinks.map((item) => (
                <a key={item.label} href={item.href} className={styles.footerSocialLink}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.footerLinksGrid}>
            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerLinkTitle}>{footerShopTitle}</h4>
              <div className={styles.footerLinkList}>
                {footerShopLinks.map((item) => (
                  <a key={item.href} href={item.href} className={styles.footerLinkItem}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerLinkTitle}>{footerSupportTitle}</h4>
              <div className={styles.footerLinkList}>
                {footerSupportLinks.map((item) => (
                  <Link key={item.href} href={item.href} className={styles.footerLinkItem}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.footerLinkColumn}>
              <h4 className={styles.footerLinkTitle}>{footerTrustTitle}</h4>
              <div className={styles.footerBadgeList}>
                {footerTrustItems.map((item) => (
                  <span key={item} className={styles.footerBadgeItem}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>{subscribeTitle}</h3>
            <p className={styles.footerText}>{subscribeCopy}</p>
            <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                className={styles.newsletterInput}
                placeholder={lang === "ar" ? "بريدك الإلكتروني" : "Your email"}
              />
              <button type="submit" className={styles.newsletterButton}>
                {lang === "ar" ? "اشتراك" : "Subscribe"}
              </button>
            </form>
            <img src="/social-icons.svg" alt="" aria-hidden="true" className={styles.socialIcons} />
          </div>

          <div className={styles.footerCenter}>
            <span className={styles.footerHeading}>{registryLabel}</span>
            <div className={styles.registryNumber}>1234567800</div>
            <img src="/commercial-registry-badge.png" alt={registryLabel} className={styles.registryBadge} />
          </div>

          <div className={styles.footerBrand}>
            <img src="/footer-heart-symbol.png" alt="JHD.LINE" className={styles.footerBrandMark} />
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>{rightsCopy}</span>
          <div className={styles.footerBottomLinks}>
            <Link href="/policy" className={styles.footerBottomLink}>{t("nav.policy")}</Link>
            <Link href="/contact" className={styles.footerBottomLink}>{t("nav.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
