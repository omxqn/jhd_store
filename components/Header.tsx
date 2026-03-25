"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import styles from "./Header.module.css";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

export function Header() {
    const { country, setCountry, cart, wishlist, authUser, clearAuth } = useStore();
    const { lang, setLang, t, isRTL } = useLanguage();
    const router = useRouter();
    const [countryOpen, setCountryOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const countryRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState<any[]>([]);
    const unreadCount = notifications.filter(n => !n.read).length;
    const supportUnread = notifications.filter(n => n.type === "support" && !n.read).length;
    const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

    const fetchNotifs = async () => {
        if (!authUser) { setNotifications([]); return; }
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (e) { }
    };

    useEffect(() => {
        fetchNotifs();
        // Custom event for instant updates from notifications page
        window.addEventListener("notif-update", fetchNotifs);
        return () => window.removeEventListener("notif-update", fetchNotifs);
    }, [authUser]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
            if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        
        if (profileOpen || mobileOpen) {
            document.body.classList.add("hide-admin-nav");
        } else {
            document.body.classList.remove("hide-admin-nav");
        }

        return () => { 
            document.body.style.overflow = ""; 
            document.body.classList.remove("hide-admin-nav");
        };
    }, [mobileOpen, profileOpen]);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (searchQuery.length < 1) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                const items = (data.products || []).slice(0, 5).map((p: any) => ({
                    ...p,
                    images: typeof p.images === "string" ? JSON.parse(p.images) : p.images
                }));
                setSearchResults(items);
            } catch (e) {
                console.error("Search fetch failed", e);
            } finally {
                setSearchLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const closeAll = () => { setMobileOpen(false); setProfileOpen(false); setCountryOpen(false); };

    return (
        <>
            <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
                <div className={styles.inner}>
                    {/* Brand Logo */}
                    <Link href="/" className={styles.logo} title="JHD LINE">
                        <img src="/heart-logo.png" alt="JHD LINE" className={styles.logoImg} />
                        <div className={`${styles.logoText} ${styles.desktopOnly}`}>JHD <span>LINE</span></div>
                    </Link>

                    {/* Primary Links (Right Side in RTL) */}
                    <nav className={`${styles.primaryNav} ${styles.desktopOnly}`}>
                        <Link href="/" className={styles.navLink}>{t('nav.home')}</Link>
                        <Link href="/policy" className={styles.navLink}>{t('nav.policy')}</Link>
                        <Link href="/contact" className={styles.navLink}>{t('nav.contact')}</Link>
                    </nav>

                    {/* Actions (Left Side in RTL) */}
                    <div className={styles.actions}>
                        <div className={styles.searchWrapper} ref={searchRef}>
                            <button className={styles.iconBtn} onClick={() => setSearchOpen(o => !o)} title="Search">
                                <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                            </button>
                            {searchOpen && (
                                <div className={styles.searchDropdown}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder={t('common.search')}
                                        autoFocus
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    {searchResults.length > 0 && (
                                        <div className={styles.searchResults}>
                                            {searchResults.map(p => (
                                                <Link key={p.id} href={`/product/${p.id}`} className={styles.searchNavOption} onClick={() => setSearchOpen(false)}>
                                                    <img src={p.images[0]} alt="" className={styles.searchThumb} />
                                                    <div>
                                                        <div className={styles.searchItemName}>{p.name}</div>
                                                        <div className={styles.searchItemPrice}>{formatPrice(p.price, country)}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.langPicker}>
                            <button 
                                className={styles.langBtn} 
                                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                            >
                                {lang === "ar" ? "EN" : "عربي"}
                            </button>
                        </div>

                        <div className={styles.countryPicker} ref={countryRef}>
                            <button className={styles.countryBtn} onClick={() => { setCountryOpen(o => !o); setProfileOpen(false); }}>
                                <span className={styles.flag}>{country.flag}</span>
                            </button>
                            {countryOpen && (
                                <div className={styles.dropdown}>
                                    {COUNTRIES.map(c => (
                                        <button key={c.code}
                                            className={`${styles.countryOption} ${country.code === c.code ? styles.selected : ""}`}
                                            onClick={() => { setCountry(c); setCountryOpen(false); }}>
                                            <span className={styles.flag}>{c.flag}</span>
                                            <span className={styles.optName}>{c.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>


                        <Link href="/myaccount/wishlist" className={styles.iconBtn} title="Wishlist">
                            <svg className={styles.iconSvg} viewBox="0 0 24 24" fill={wishlist.length > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            {wishlist.length > 0 && <span className={styles.badgeCount}>{wishlist.length}</span>}
                        </Link>

                        <Link href="/cart" className={styles.iconBtn} title="Cart">
                            <span className={styles.iconSvg}>💼</span>
                            {cartCount > 0 && <span className={styles.badgeCount}>{cartCount}</span>}
                        </Link>

                        <div className={`${styles.profilePicker} ${styles.desktopOnly}`} ref={profileRef}>
                            <button className={styles.iconBtn} onClick={() => { setProfileOpen(o => !o); setCountryOpen(false); }}>
                                <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </button>
                            {profileOpen && (
                                <div className={styles.profilePanel}>
                                    <div className={styles.profileHeader}>
                                        <div className={styles.avatar}>{authUser?.name?.charAt(0) ?? "G"}</div>
                                        <div className={styles.profileMeta}>
                                            <div className={styles.profileName}>{authUser?.name ?? t('header.guest_user')}</div>
                                            <div className={styles.profileEmail}>{authUser?.email ?? t('header.welcome_store')}</div>
                                        </div>
                                    </div>
                                    <div className={styles.profileBody}>
                                        <div className={styles.navGroup}>
                                            <div className={styles.groupLabel}>{t('common.my_account')}</div>
                                            <nav className={styles.profileNav}>
                                                <Link href="/myaccount/notifications" onClick={() => setProfileOpen(false)}>
                                                    <span className={styles.navIcon}>🔔</span>
                                                    <span>{t('account.notifications')}</span>
                                                    {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                                                </Link>
                                                <Link href="/myaccount/my-orders" onClick={() => setProfileOpen(false)}>
                                                    <span className={styles.navIcon}>📦</span>
                                                    <span>{t('account.my_orders')}</span>
                                                </Link>
                                                <Link href="/myaccount/wishlist" onClick={() => setProfileOpen(false)}>
                                                    <span className={styles.navIcon}>❤️</span>
                                                    <span>{t('nav.most_selling')}</span>
                                                </Link>
                                                <Link href="/myaccount/support" onClick={() => setProfileOpen(false)}>
                                                    <span className={styles.navIcon}>💬</span>
                                                    <span>{t('account.support_tickets')}</span>
                                                    {supportUnread > 0 && <span className={styles.notifBadge}>{supportUnread}</span>}
                                                </Link>
                                            </nav>
                                        </div>
                                        
                                        {(authUser?.role === "admin" || authUser?.role === "super_admin") && (
                                            <div className={styles.navGroup}>
                                                <div className={styles.groupLabel}>{t('header.management')}</div>
                                                <nav className={styles.profileNav}>
                                                    <Link href="/admin" onClick={() => setProfileOpen(false)}>
                                                        <span className={styles.navIcon}>🛠️</span>
                                                        <span>{t('header.admin_panel')}</span>
                                                    </Link>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.profileFooter}>
                                        {authUser ? (
                                            <button className={styles.signoutBtn} onClick={async () => {
                                                await fetch("/api/auth/logout", { method: "POST" });
                                                clearAuth(); setProfileOpen(false); router.push("/");
                                            }}>{t('common.sign_out')}</button>
                                        ) : (
                                            <Link href="/login" className="btn btnPrimary btnBlock btnSm" onClick={() => setProfileOpen(false)}>{t('header.login_register')}</Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className={`${styles.iconBtn} ${styles.mobileOnly}`} onClick={() => setMobileOpen(o => !o)}>
                            <span>{mobileOpen ? "✕" : "☰"}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile Drawer ── */}
            {mobileOpen && (
                <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)}>
                    <div className={styles.mobileDrawer} onClick={e => e.stopPropagation()}>
                        <button className={styles.mobileClose} onClick={() => setMobileOpen(false)}>✕</button>
                        
                        <div className={styles.mobileDrawerHeader}>
                            {authUser ? (
                                <div className={styles.mobileUserIdentity}>
                                    <div className={styles.avatarLarge}>{authUser.name.charAt(0)}</div>
                                    <div className={styles.mobileUserMeta}>
                                        <div className={styles.mobileUserNameLuxe}>{authUser.name}</div>
                                        <div className={styles.mobileUserEmailLuxe}>{authUser.email}</div>
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login" className={styles.mobileGuestHero} onClick={closeAll}>
                                    <div className={styles.guestIcon}>✨</div>
                                    <div className={styles.guestMeta}>
                                        <div className={styles.guestTitle}>{t('header.welcome_jhd')}</div>
                                        <div className={styles.guestSub}>{t('header.login_world')}</div>
                                    </div>
                                </Link>
                            )}
                        </div>

                        <div className={styles.mobileBody}>
                            <div className={styles.drawerSection}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                                    <div className={styles.sectionLabel}>{t('nav.categories')}</div>
                                    <button 
                                        className={styles.mobileLangBtn} 
                                        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                                    >
                                        {lang === "ar" ? t('header.english') : t('header.arabic')}
                                    </button>
                                </div>
                                <nav className={styles.mobilePrimaryNav}>
                                    <Link href="/" className={styles.mobileNavLink} onClick={closeAll}>
                                        <span className={styles.navMain}>{t('nav.home')}</span>
                                        <span className={styles.navSub}>{t('header.browse_collection')}</span>
                                    </Link>
                                    <Link href="/policy" className={styles.mobileNavLink} onClick={closeAll}>
                                        <span className={styles.navMain}>{t('nav.policy')}</span>
                                        <span className={styles.navSub}>{t('header.order_policies')}</span>
                                    </Link>
                                    <Link href="/contact" className={styles.mobileNavLink} onClick={closeAll}>
                                        <span className={styles.navMain}>{t('nav.contact')}</span>
                                        <span className={styles.navSub}>{t('header.contact_support')}</span>
                                    </Link>
                                </nav>
                            </div>

                            <div className={styles.mobileDivider} />

                            <div className={styles.drawerSection}>
                                <div className={styles.sectionLabel}>{t('common.my_account')}</div>
                                <nav className={styles.mobileDashboardNav}>
                                    <Link href="/myaccount/notifications" className={styles.dashboardLink} onClick={closeAll}>
                                        <span className={styles.dashboardIcon}>🔔</span>
                                        <span className={styles.dashboardText}>{t('account.notifications')}</span>
                                        {unreadCount > 0 && <span className={styles.notifBadgeSmall}>{unreadCount}</span>}
                                    </Link>
                                    <Link href="/myaccount/my-orders" className={styles.dashboardLink} onClick={closeAll}>
                                        <span className={styles.dashboardIcon}>📦</span>
                                        <span className={styles.dashboardText}>{t('account.my_orders')}</span>
                                    </Link>
                                    <Link href="/myaccount/wishlist" className={styles.dashboardLink} onClick={closeAll}>
                                        <span className={styles.dashboardIcon}>❤️</span>
                                        <span className={styles.dashboardText}>{t('nav.most_selling')}</span>
                                    </Link>
                                    <Link href="/myaccount/support" className={styles.dashboardLink} onClick={closeAll}>
                                        <span className={styles.dashboardIcon}>💬</span>
                                        <span className={styles.dashboardText}>{t('account.support_tickets')}</span>
                                        {supportUnread > 0 && <span className={styles.notifBadgeSmall}>{supportUnread}</span>}
                                    </Link>
                                    <Link href="/cart" className={styles.dashboardLink} onClick={closeAll}>
                                        <span className={styles.dashboardIcon}>💼</span>
                                        <span className={styles.dashboardText}>{t('cart.bag')}</span>
                                        {cartCount > 0 && <span className={styles.notifBadgeSmall}>{cartCount}</span>}
                                    </Link>
                                </nav>
                            </div>

                            {(authUser?.role === "admin" || authUser?.role === "super_admin") && (
                                <>
                                    <div className={styles.mobileDivider} />
                                    <div className={styles.drawerSection}>
                                        <div className={styles.sectionLabel}>{t('header.management')}</div>
                                        <nav className={styles.mobileDashboardNav}>
                                            <Link href="/admin" className={styles.dashboardLink} onClick={closeAll}>
                                                <span className={styles.dashboardIcon}>🛠️</span>
                                                <span className={styles.dashboardText}>{t('header.admin_panel')}</span>
                                            </Link>
                                        </nav>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.mobileDrawerFooter}>
                            {authUser && (
                                <button className={styles.luxeSignoutBtn} onClick={async () => { 
                                    await fetch("/api/auth/logout", { method: "POST" }); 
                                    clearAuth(); closeAll(); router.push("/"); 
                                }}>
                                    <span>{t('common.sign_out')}</span>
                                    <span className={styles.signoutArrow}>→</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
