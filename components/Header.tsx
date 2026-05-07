"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import { COUNTRIES } from "@/lib/data";
import { formatPrice, useStore } from "@/lib/store";
import styles from "./Header.module.css";

type SearchProduct = {
  id: string;
  name: string;
  price: number;
  images: string[];
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

function normalizeSearchProduct(product: any): SearchProduct {
  return {
    id: String(product.id),
    name: product.name,
    price: Number(product.price) || 0,
    images: safeJson<string[]>(product.images, [product.images].filter(Boolean)),
  };
}

export function Header() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const { country, setCountry, cart, wishlist, authUser, clearAuth } = useStore();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
        setSearchResults((data.products || []).map(normalizeSearchProduct).slice(0, 5));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const promoCopy = lang === "ar" ? "كود خصم ترحيبي لأول طلب" : "Welcome discount code for your first order";
  const searchPlaceholder = lang === "ar" ? "ابحث عن منتج" : "Search products";
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
  const aboutLabel = lang === "ar" ? "عن جهاد" : "About Jihad";
  const adminLabel = lang === "ar" ? "لوحة الإدارة" : "Admin Panel";

  const handleProfileLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore sync errors and clear local auth state anyway.
    }

    clearAuth();
    setProfileMenuOpen(false);
    toast.success(lang === "ar" ? "تم تسجيل الخروج" : "Signed out");
    router.push("/");
  };

  return (
    <>
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
                      {authUser?.role === "admin" || authUser?.role === "super_admin" ? (
                        <Link href="/admin" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                          <span className={styles.profileMenuIcon}>🛠️</span>
                          <span>{adminLabel}</span>
                        </Link>
                      ) : null}
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
          <Link href="/#about" className={styles.navLink}>
            {aboutLabel}
          </Link>
        </nav>
      </header>
    </>
  );
}
