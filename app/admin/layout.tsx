"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { authUser, clearAuth, verifyAuth } = useStore();
    const { lang, t, isRTL } = useLanguage();
    const [verifying, setVerifying] = useState(true);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const NAV = [
        { href: "/admin", icon: "📊", label: t('admin.dashboard') },
        { href: "/admin/products", icon: "🛍️", label: t('admin.products') },
        { href: "/admin/orders", icon: "📦", label: t('admin.orders') },
        { href: "/admin/users", icon: "👥", label: t('admin.users'), superOnly: true },
        { href: "/admin/shipping", icon: "✈️", label: t('admin.shipping') },
        { href: "/admin/support", icon: "🎫", label: t('admin.support') },
        { href: "/admin/vouchers", icon: "🎟️", label: t('admin.vouchers') },
        { href: "/admin/categories", icon: "🗂️", label: t('admin.categories') },
        { href: "/admin/necklines", icon: "👔", label: t('admin.necklines') },
    ];
    useEffect(() => {
        const check = async () => {
            await verifyAuth();
            setVerifying(false);
        };
        check();
    }, []);

    useEffect(() => {
        if (!verifying) {
            if (authUser && authUser.role !== "admin" && authUser.role !== "super_admin") {
                toast.error(lang === 'ar' ? "مطلوب صلاحية المسؤول" : "Admin access required");
                router.replace("/");
            } else if (!authUser) {
                toast.error(lang === 'ar' ? "الرجاء تسجيل الدخول" : "Please sign in");
                router.replace("/login");
            }
        }
    }, [authUser, verifying]);

    useEffect(() => {
        if (isMobileNavOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileNavOpen]);

    if (verifying) return <div style={{ background: "#0c0c0c", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-primary)", fontSize: "2.5rem" }}>⌛ {lang === 'ar' ? "يتم التحقق من الهوية..." : "Verifying Identity…"}</div>;

    if (!authUser || (authUser.role !== "admin" && authUser.role !== "super_admin")) return null;

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        clearAuth();
        router.push("/login");
    };

    const closeNav = () => setIsMobileNavOpen(false);

    return (
        <div className={styles.adminLayout}>
            {/* Mobile Header */}
            <div className={styles.mobileHeader} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <button className={styles.hamburger} onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
                    {isMobileNavOpen ? "✕" : "☰"}
                </button>
                <div className={styles.mobileLogo} style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                    <div className={styles.logoIconSmall}>ج</div>
                    <span className={styles.logoTextSmall}>{lang === 'ar' ? "الإدارة" : "Admin"}</span>
                </div>
                <div className={styles.mobileActions}>
                    <Link href="/" className={styles.miniLink}>{t('common.store')}</Link>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isMobileNavOpen && <div className={styles.sidebarOverlay} onClick={closeNav} />}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isMobileNavOpen ? styles.sidebarOpen : ""} ${isRTL ? styles.sidebarRTL : ""}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>

                {/* Logo */}
                <div className={styles.logoArea}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div className={styles.logoIcon}>ج</div>
                        <span className={styles.logoText}>{t('admin.panel')}</span>
                    </div>
                    <p style={{ fontSize: "1.1rem", color: "var(--admin-text-muted)" }}>{authUser.role === 'super_admin' ? (lang === 'ar' ? 'وضع المسؤول الأعلى' : 'Super Admin Mode') : (lang === 'ar' ? 'إدارة متجر جهاد' : 'Jihad Store Management')}</p>
                </div>

                <nav className={styles.nav}>
                    {NAV.map(n => {
                        if (n.superOnly && authUser.role !== "super_admin") return null;
                        const isExact = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
                        return (
                            <Link 
                                key={n.href} 
                                href={n.href} 
                                className={`${styles.navLink} ${isExact ? styles.navLinkActive : ""}`}
                                onClick={closeNav}
                                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                            >
                                <span style={{ marginLeft: isRTL ? '12px' : '0', marginRight: isRTL ? '0' : '12px' }}>{n.icon}</span>{n.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className={styles.sidebarFooter}>
                    <div style={{ fontSize: "1.4rem", color: "var(--admin-text)", marginBottom: "1.5rem", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: isRTL ? "flex-end" : "flex-start", gap: "12px" }}>
                        {isRTL ? (
                            <>
                                {authUser.name.split(' ')[0]} <span style={{ color: "var(--admin-primary)" }}>●</span>
                            </>
                        ) : (
                            <>
                                <span style={{ color: "var(--admin-primary)" }}>●</span> {authUser.name.split(' ')[0]}
                            </>
                        )}
                    </div>
                    <button onClick={handleLogout} className={styles.adminBtnSecondary} style={{ width: "100%", padding: "1rem", borderRadius: "1rem", fontSize: "1.3rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        🚪 {lang === 'ar' ? "تسجيل الخروج" : "Sign Out"}
                    </button>
                    <Link href="/" style={{ display: "block", textAlign: "center", marginTop: "1.5rem", fontSize: "1.1rem", color: "var(--admin-text-muted)", textDecoration: "none" }}>
                        {isRTL ? "← العودة للمتجر" : "← Back to store"}
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
