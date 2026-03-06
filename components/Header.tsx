"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, formatPrice } from "@/lib/store";
import { COUNTRIES } from "@/lib/data";
import styles from "./Header.module.css";
import toast from "react-hot-toast";

export function Header() {
    const { country, setCountry, cart, wishlist, authUser, clearAuth } = useStore();
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

    const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
    const [unreadNotifs, setUnreadNotifs] = useState(0);

    const fetchNotifs = async () => {
        if (!authUser) { setUnreadNotifs(0); return; }
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            setUnreadNotifs(data.notifications?.filter((n: any) => !n.read).length || 0);
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
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

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
                    {/* Brand Logo - Added to main header */}
                    <Link href="/" className={styles.logo} title="JHD LINE">
                        <div className={styles.logoMark} style={{ background: "var(--primary)" }}>J</div>
                        <div className={`${styles.logoText} ${styles.desktopOnly}`}>JHD <span>LINE</span></div>
                    </Link>

                    {/* Primary Links (Right Side in RTL) */}
                    <nav className={`${styles.primaryNav} ${styles.desktopOnly}`}>
                        <Link href="/" className={styles.navLink}>المتجر</Link>
                        <Link href="/policy" className={styles.navLink}>سياسة الطلب</Link>
                        <Link href="/contact" className={styles.navLink}>الاستفسارات العامة</Link>
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
                                        placeholder="البحث عن منتج..."
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
                                        <div className={styles.avatar} style={{ background: "rgba(198, 40, 40, 0.1)", color: "var(--primary)" }}>{authUser?.name?.charAt(0) ?? "G"}</div>
                                        <div>
                                            <div className={styles.profileName}>{authUser?.name ?? "Guest"}</div>
                                            <div className={styles.profileEmail}>{authUser?.email ?? "Welcome"}</div>
                                        </div>
                                    </div>
                                    <nav className={styles.profileNav}>
                                        <Link href="/myaccount/notifications" onClick={() => setProfileOpen(false)}><span className={styles.navIcon}>•</span><span>Notifications</span></Link>
                                        <Link href="/myaccount/my-orders" onClick={() => setProfileOpen(false)}><span className={styles.navIcon}>•</span><span>My Orders</span></Link>
                                        <Link href="/myaccount/wishlist" onClick={() => setProfileOpen(false)}><span className={styles.navIcon}>•</span><span>Wishlist</span></Link>
                                        {(authUser?.role === "admin" || authUser?.role === "super_admin") && (
                                            <Link href="/admin" onClick={() => setProfileOpen(false)}><span className={styles.navIcon}>•</span><span>Admin Panel</span></Link>
                                        )}
                                    </nav>
                                    <div className={styles.profileFooter}>
                                        {authUser ? (
                                            <button className={styles.signoutBtn} onClick={async () => {
                                                await fetch("/api/auth/logout", { method: "POST" });
                                                clearAuth(); setProfileOpen(false); router.push("/");
                                                toast("Signed out");
                                            }}>Sign Out</button>
                                        ) : (
                                            <Link href="/login" className="btn btnPrimary btnBlock btnSm" onClick={() => setProfileOpen(false)}>Login</Link>
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
                        <div className={styles.logo} style={{ marginBottom: "2rem" }}>
                            <div className={styles.logoMark} style={{ background: "var(--primary)" }}>J</div>
                            <div className={styles.logoText}>JHD <span>LINE</span></div>
                        </div>

                        <nav className={styles.profileNav} style={{ padding: 0 }}>
                            <Link href="/" className={styles.mobileNavLink} onClick={closeAll}>المتجر (Store)</Link>
                            <Link href="/policy" className={styles.mobileNavLink} onClick={closeAll}>سياسة الطلب (Policy)</Link>
                            <Link href="/contact" className={styles.mobileNavLink} onClick={closeAll}>الاستفسارات العامة (Inquiries)</Link>
                            <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid rgba(198, 40, 40, 0.1)" }} />
                            <Link href="/myaccount/my-orders" className={styles.mobileNavLink} onClick={closeAll}>My Orders</Link>
                            <Link href="/myaccount/notifications" className={styles.mobileNavLink} onClick={closeAll}>Notifications</Link>
                            <Link href="/cart" className={styles.mobileNavLink} onClick={closeAll}>Cart ({cartCount})</Link>
                            <Link href="/myaccount/wishlist" className={styles.mobileNavLink} onClick={closeAll}>Wishlist</Link>
                        </nav>

                        <div className={styles.profileFooter} style={{ marginTop: "auto", background: "none", padding: 0 }}>
                            {authUser ? (
                                <button className={styles.signoutBtn}
                                    onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); clearAuth(); closeAll(); router.push("/"); }}>
                                    Sign Out
                                </button>
                            ) : (
                                <Link href="/login" className="btn btnPrimary btnBlock" onClick={closeAll}>Login / Register</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
